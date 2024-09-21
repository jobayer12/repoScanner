package main

import (
	"context"
	"log"
	"log/slog"

	"github.com/jobayer12/repoScanner/RepoScannerService/config"
	"github.com/jobayer12/repoScanner/RepoScannerService/logger"
	"github.com/jobayer12/repoScanner/RepoScannerService/services"
	"github.com/jobayer12/repoScanner/RepoScannerService/zeromq"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
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
	// Create ZeroMQ publisher socket
	zeroPublisher := zeromq.NewZeromqPublisher(scanService, "scanResult-scannerService")
	//Create ZeroMQ subscriber socket
	ZeroSubscriber := zeromq.NewZeromqSubscriber(scanService, zeroPublisher, "githubScan")
	ZeroSubscriber.StartSubscriber()

}
