package main

import (
	"context"
	"fmt"
	"log"
	"log/slog"

	"github.com/jobayer12/repoScanner/RepoScannerService/config"
	"github.com/jobayer12/repoScanner/RepoScannerService/internal"
	"github.com/jobayer12/repoScanner/RepoScannerService/logger"
	services "github.com/jobayer12/repoScanner/RepoScannerService/services/scan"
	_ "github.com/rabbitmq/amqp091-go"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

var (
	mongoClient            *mongo.Client
	ctx                    context.Context
	scanService            services.ScanService
	scanCollection         *mongo.Collection
	loadConfig             config.Config
	rabbitmqConsumerClient *internal.RabbitMQClient
	rabbitMQPublishClient  *internal.RabbitMQClient
	rabbitmqRPCClient      *internal.RabbitMQClient
)

func init() {
	slog.SetDefault(logger.Logger())

	// Load configuration
	var err error
	loadConfig, err = config.LoadConfig(".")
	fmt.Printf("%+v\n", loadConfig)
	if err != nil {
		log.Fatal("Failed to load environment variables", err)
	}

	// MongoDB connection
	setupMongoDB()

	// RabbitMQ connections
	setupRabbitMQ()

}

func setupRabbitMQ() {
	var err error

	// Establish a single RabbitMQ connection
	conn, err := internal.ConnectRabbitMQ(loadConfig.RabbitMQURI)
	if err != nil {
		log.Fatal("Failed to connect to RabbitMQ:", err)
	}

	// Consumer client using the same connection
	rabbitmqConsumerClient, err = internal.NewRabbitMQClient(conn)
	if err != nil {
		log.Fatal("Failed to create RabbitMQ consumer client:", err)
	}

	// Publisher client using the same connection
	rabbitMQPublishClient, err = internal.NewRabbitMQClient(conn)
	if err != nil {
		log.Fatal("Failed to create RabbitMQ publisher client:", err)
	}

	// RPC client using the same connection
	rabbitmqRPCClient, err = internal.NewRabbitMQClient(conn)
	if err != nil {
		log.Fatal("Failed to create RabbitMQ RPC client:", err)
	}

	log.Println("RabbitMQ clients successfully initialized with a single connection...")
}

func setupMongoDB() {
	var err error
	mongoConn := options.Client().ApplyURI(loadConfig.MongoDBConnectionURI)
	mongoClient, err = mongo.Connect(ctx, mongoConn)
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}

	if err := mongoClient.Ping(ctx, readpref.Primary()); err != nil {
		log.Fatal("Failed to ping MongoDB:", err)
	}

	log.Println("MongoDB successfully connected...")
	scanCollection = mongoClient.Database("scanner").Collection("scan")
	scanService = services.NewScanService(scanCollection, ctx)
}

func main() {

	defer func(mongoClient *mongo.Client, ctx context.Context) {
		err := mongoClient.Disconnect(ctx)
		if err != nil {
			panic(err)
		}
	}(mongoClient, ctx)

	defer func(rabbitmqConsumerClient *internal.RabbitMQClient) {
		err := rabbitmqConsumerClient.Close()
		if err != nil {
			panic(err)
		}
	}(rabbitmqConsumerClient)

	defer func(rabbitMQPublishClient *internal.RabbitMQClient) {
		err := rabbitMQPublishClient.Close()
		if err != nil {
			panic(err)
		}
	}(rabbitMQPublishClient)

	defer func(rabbitmqRPCClient *internal.RabbitMQClient) {
		err := rabbitmqRPCClient.Close()
		if err != nil {
			panic(err)
		}
	}(rabbitmqRPCClient)

	// Context for StartConsumer
	ctxConsumer, cancelConsumer := context.WithCancel(context.Background())
	defer cancelConsumer()

	// Context for RPC
	ctxRpc, cancelRpc := context.WithCancel(context.Background())
	defer cancelRpc()

	// Set up RabbitMQ Consumer
	go func() {
		rabbitmq := internal.NewRabbitMQConsumer(rabbitmqConsumerClient, rabbitMQPublishClient, scanService, ctxConsumer)
		rabbitmq.StartConsumer(loadConfig.ScanQueueName, "scanner-service", "reposcanner", "repo.email.github-scan")
	}()

	// Set up RabbitMQ RPC
	go func() {
		rpcRabbitMQ := internal.NewRabbitMQRPC(rabbitmqRPCClient, scanService, ctxRpc)
		rpcRabbitMQ.StartConsumingRpcRequest(loadConfig.RpcQueueName, "rpc-request")
	}()

	// Block main thread to keep consumers alive
	select {}
}
