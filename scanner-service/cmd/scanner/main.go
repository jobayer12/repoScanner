package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	"github.com/jobayer12/repoScanner/RepoScannerService/internal/app"
	"github.com/jobayer12/repoScanner/RepoScannerService/logger"
)

func main() {
	// Setup structured logging
	slog.SetDefault(logger.Logger())

	// Create application context with cancellation
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Handle graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	// Create application
	application, err := app.NewApplication()
	if err != nil {
		slog.Error("Failed to initialize application", "error", err)
		os.Exit(1)
	}
	defer application.Cleanup()

	// Start consumers
	if err := application.StartConsumers(ctx); err != nil {
		slog.Error("Failed to start consumers", "error", err)
		os.Exit(1)
	}

	// Wait for shutdown signal
	<-sigChan
	slog.Info("Shutting down application...")
	cancel()
}
