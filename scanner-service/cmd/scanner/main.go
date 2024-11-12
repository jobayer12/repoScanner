package main

import (
	"context"
	"github.com/jobayer12/repoScanner/RepoScannerService/config"
	"github.com/jobayer12/repoScanner/RepoScannerService/internal"
	"github.com/jobayer12/repoScanner/RepoScannerService/logger"
	services "github.com/jobayer12/repoScanner/RepoScannerService/services/scan"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
	"log"
	"log/slog"
)

var (
	mongoClient    *mongo.Client
	ctx            context.Context
	scanService    services.ScanService
	scanCollection *mongo.Collection
)

func init() {
	slog.SetDefault(logger.Logger())
	loadConfig, err := config.LoadConfig(".")
	if err != nil {
		log.Fatal("Failed to load environment variables", err)
	}

	ctx = context.TODO()

	// mongodb connection
	mongoConn := options.Client().ApplyURI(loadConfig.MongoDBConnectionURI)
	mongoClient, err := mongo.Connect(ctx, mongoConn)

	if err != nil {
		log.Fatal(err)
	}

	if err := mongoClient.Ping(ctx, readpref.Primary()); err != nil {
		log.Fatal(err)
	}

	log.Println("MongoDB successfully connected...")
	scanCollection = mongoClient.Database("scanner").Collection("scan")
	scanService = services.NewScanService(scanCollection, ctx)
}

func main() {
	loadConfig, err := config.LoadConfig(".")
	if err != nil {
		log.Fatal("Failed to load environment variables", err)
	}
	// Connect to RabbitMQ
	conn, err := internal.ConnectRabbitMQ(loadConfig.RabbitMQURL)
	if err != nil {
		panic(err)
	}
	defer conn.Close()

	client, err := internal.NewRabbitMQClient(conn)
	if err != nil {
		panic(err)
	}
	defer client.Close()

	// Set up publisher
	publishConn, err := internal.ConnectRabbitMQ(loadConfig.RabbitMQURL)
	if err != nil {
		panic(err)
	}
	defer publishConn.Close()

	publishClient, err := internal.NewRabbitMQClient(publishConn)
	if err != nil {
		panic(err)
	}
	defer publishClient.Close()

	// Set up a context with cancel for cleanup
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	rabbitmq := internal.NewRabbitMQConsumer(client, publishClient, scanService, ctx)
	// Start consuming messages
	rabbitmq.StartConsumer(loadConfig.ScanQueueName, "scanner-service", "reposcanner", "repo.email.github-scan")
}
