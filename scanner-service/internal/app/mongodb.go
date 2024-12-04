package app

import (
	"context"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

// CreateMongoClient creates and verifies a MongoDB connection
func CreateMongoClient(ctx context.Context, connectionURI string) (*mongo.Client, error) {
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
