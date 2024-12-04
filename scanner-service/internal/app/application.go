package app

import (
	"context"
	amqp "github.com/rabbitmq/amqp091-go"
	"log/slog"
	"time"

	"github.com/jobayer12/repoScanner/RepoScannerService/config"
	"github.com/jobayer12/repoScanner/RepoScannerService/internal"
	services "github.com/jobayer12/repoScanner/RepoScannerService/services/scan"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

// Application represents the core application structure
type Application struct {
	Config             config.Config
	MongoClient        *mongo.Client
	RabbitMQConnection *amqp.Connection
	ScanService        services.ScanService
}

// NewApplication initializes and returns a new Application instance
func NewApplication() (*Application, error) {
	// Load configuration
	cfg, err := config.LoadConfig(".")
	if err != nil {
		return nil, err
	}

	// Setup MongoDB
	mongoClient, err := setupMongoDB(cfg.MongoDBConnectionURI)
	if err != nil {
		return nil, err
	}

	// Setup RabbitMQ
	rabbitmqConn, err := internal.ConnectRabbitMQ(cfg.RabbitMQURI)
	if err != nil {
		return nil, err
	}

	// Create scan service
	scanCollection := mongoClient.Database("scanner").Collection("scan")
	scanService := services.NewScanService(scanCollection, context.Background())

	return &Application{
		Config:             cfg,
		MongoClient:        mongoClient,
		RabbitMQConnection: rabbitmqConn,
		ScanService:        scanService,
	}, nil
}

// StartConsumers initializes and starts RabbitMQ consumers
func (app *Application) StartConsumers(ctx context.Context) error {
	// RabbitMQ Consumer
	consumerClient, err := internal.NewRabbitMQClient(app.RabbitMQConnection)
	if err != nil {
		return err
	}

	publishClient, err := internal.NewRabbitMQClient(app.RabbitMQConnection)
	if err != nil {
		return err
	}

	// Start RabbitMQ Consumer
	go func() {
		rabbitmq := internal.NewRabbitMQConsumer(consumerClient, publishClient, app.ScanService, ctx)
		rabbitmq.StartConsumer(app.Config.ScanQueueName, "scanner-service", "reposcanner", "repo.email.github-scan")
	}()

	// RabbitMQ RPC
	rpcClient, err := internal.NewRabbitMQClient(app.RabbitMQConnection)
	if err != nil {
		return err
	}

	// Start RPC Consumer
	go func() {
		rpcRabbitMQ := internal.NewRabbitMQRPC(rpcClient, app.ScanService, ctx)
		rpcRabbitMQ.StartConsumingRpcRequest(app.Config.RpcQueueName, "rpc-request")
	}()

	return nil
}

// Cleanup closes all open connections and resources
func (app *Application) Cleanup() {
	if app.MongoClient != nil {
		if err := app.MongoClient.Disconnect(context.Background()); err != nil {
			slog.Error("Failed to disconnect MongoDB", "error", err)
		}
	}

	if app.RabbitMQConnection != nil {
		if err := app.RabbitMQConnection.Close(); err != nil {
			slog.Error("Failed to close RabbitMQ connection", "error", err)
		}
	}
}

// setupMongoDB establishes a connection to MongoDB
func setupMongoDB(connectionURI string) (*mongo.Client, error) {
	ctx := context.Background()

	// Configure MongoDB client options
	mongoConn := options.Client().
		ApplyURI(connectionURI).
		SetMaxPoolSize(50).                 // Adjust pool size as needed
		SetMinPoolSize(10).                 // Minimum pool size
		SetMaxConnIdleTime(5 * time.Minute) // Idle connection timeout

	// Establish MongoDB connection
	client, err := mongo.Connect(ctx, mongoConn)
	if err != nil {
		return nil, err
	}

	// Verify connection with a ping
	if err := client.Ping(ctx, readpref.Primary()); err != nil {
		return nil, err
	}

	slog.Info("MongoDB successfully connected")
	return client, nil
}
