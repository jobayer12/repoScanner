package internal

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"github.com/jobayer12/repoScanner/RepoScannerService/config"
	"github.com/jobayer12/repoScanner/RepoScannerService/models"
	services "github.com/jobayer12/repoScanner/RepoScannerService/services/scan"
	amqp "github.com/rabbitmq/amqp091-go"
	_ "golang.org/x/sync/errgroup"
	"log"
	"os/exec"
	"regexp"
	"time"
)

type RabbitMQConsumer struct {
	client        *RabbitMQClient
	publishClient *RabbitMQClient
	scanService   services.ScanService
	ctx           context.Context
}

func NewRabbitMQConsumer(client, publishClient *RabbitMQClient, scanService services.ScanService, ctx context.Context) *RabbitMQConsumer {
	return &RabbitMQConsumer{
		client:        client,
		publishClient: publishClient,
		scanService:   scanService,
		ctx:           ctx,
	}
}

func (rmc *RabbitMQConsumer) StartConsumer(queue, consumer, exchange, routingKey string) {
	log.Printf("Starting Consumer for queue: %s", queue)

	channel, err := rmc.client.conn.Channel()
	if err != nil {
		log.Fatalf("Failed to create RabbitMQ channel: %v", err)
	}
	defer func(channel *amqp.Channel) {
		err := channel.Close()
		if err != nil {
			panic(err)
		}
	}(channel)

	messageBus, err := channel.Consume(queue, consumer, false, false, false, false, nil)
	if err != nil {
		log.Fatalf("Failed to consume messages: %v", err)
	}

	// Run indefinitely, waiting for messages
	for {
		select {
		case msg, ok := <-messageBus:
			if !ok {
				log.Println("Message channel closed, reconnecting...")
				time.Sleep(5 * time.Second) // Add delay before reconnecting
				rmc.reconnect(queue, consumer, exchange, routingKey)
				return
			}

			// Process the message in a separate goroutine
			go func(msg amqp.Delivery) {
				err := rmc.processMessage(msg, exchange, routingKey)
				if err != nil {
					log.Printf("Error processing message: %v", err)
				}
			}(msg)

		case <-rmc.ctx.Done():
			log.Println("Consumer context canceled. Shutting down...")
			return
		}
	}
}

// Handles reconnection logic (retry if connection is lost)
func (rmc *RabbitMQConsumer) reconnect(queue, consumer, exchange, routingKey string) {
	for {
		err := rmc.client.Close() // Ensure clean-up before reconnecting
		if err != nil {
			log.Printf("Error closing connection: %v", err)
		}

		log.Println("Reconnecting to RabbitMQ...")

		// Update the RabbitMQ client connection
		go rmc.StartConsumer(queue, consumer, exchange, routingKey)
		return
	}
}

func (rmc *RabbitMQConsumer) processMessage(msg amqp.Delivery, exchange, routingKey string) error {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("Recovered from panic: %v", r)
		}
	}()

	log.Printf("Processing message: %s", string(msg.Body))

	// Parse the JSON object into the Message struct
	var parsedMessage models.BaseQueuePayload[models.Repository]
	err := json.Unmarshal(msg.Body, &parsedMessage)
	if err != nil {
		log.Printf("Error parsing JSON: %v\n", err)
		_ = msg.Nack(false, false)
		return nil
	}

	log.Printf("Starting scan for repository: %s", parsedMessage.Data.Repository)

	// Define the Docker Trivy command with JSON output
	cmd := exec.Command("trivy", "repo", parsedMessage.Data.Repository, "--format", "json", "--branch", parsedMessage.Data.Branch)
	var out bytes.Buffer
	var stderr bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &stderr

	// Create the initial scan entry
	createScan := &models.CreateScanRequest{
		UserId:     parsedMessage.Data.UserId,
		Repository: parsedMessage.Data.Repository,
		Branch:     parsedMessage.Data.Branch,
		Sha:        parsedMessage.Data.Sha,
	}
	createScanResponse, err := rmc.scanService.CreateScan(createScan)
	if err != nil {
		log.Printf("Failed to create scan in MongoDB: %v", err)
		_ = msg.Nack(false, false)
		return err
	}

	// Run the Trivy scan command
	err = cmd.Run()
	var scanResult interface{}
	updateScan := &models.UpdateScanResult{}

	if err != nil {
		log.Printf("Trivy scan failed: %v\nStderr: %s", err, stderr.String())
		updateScan = &models.UpdateScanResult{
			Status:    "SCAN_FAILED",
			Result:    nil,
			UpdatedAt: time.Now(),
		}
	} else {
		// Extract JSON from Trivy output
		re := regexp.MustCompile(`(?s)(\{.*\})`)
		jsonPart := re.FindString(out.String())
		if jsonPart == "" {
			log.Printf("No valid JSON found in Trivy output")
			updateScan.Status = "SCAN_FAILED"
			scanResult = nil
		} else {
			err = json.Unmarshal([]byte(jsonPart), &scanResult)
			if err != nil {
				log.Printf("Failed to parse JSON: %v", err)
				updateScan.Status = "SCAN_FAILED"
				scanResult = nil
			} else {
				updateScan.Status = "SCAN_DONE"
				updateScan.Result = scanResult
			}
		}
	}

	// Update the scan entry in MongoDB
	updateScan.UpdatedAt = time.Now()
	_, err = rmc.scanService.UpdateScan(createScanResponse.Id.Hex(), updateScan)
	if err != nil {
		log.Printf("Failed to update scan in MongoDB: %v", err)
		_ = msg.Nack(false, false)
		return err
	}

	log.Printf("Scan completed for repository: %s", parsedMessage.Data.Repository)

	// Publish the result to the email queue
	loadConfig, err := config.LoadConfig(".")
	if err != nil {
		log.Printf("Failed to load environment variables: %v", err)
		_ = msg.Nack(false, false)
		return err
	}

	emailQueueData := models.EmailQueueData{
		Email:          parsedMessage.Data.Email,
		ScanResultLink: fmt.Sprintf("%v/api/v1/scan/%v", loadConfig.AuthServiceURI, createScanResponse.Id.Hex()),
		Status:         updateScan.Status,
	}

	emailQueuePayload := models.BaseQueuePayload[models.EmailQueueData]{
		Pattern: routingKey,
		Data:    emailQueueData,
	}

	emailQueuePayloadByte, err := json.Marshal(emailQueuePayload)
	if err != nil {
		log.Printf("Failed to marshal email queue payload: %v", err)
		_ = msg.Nack(false, false)
		return err
	}

	err = rmc.publishClient.Send(rmc.ctx, exchange, routingKey, amqp.Publishing{
		ContentType:   "application/json",
		DeliveryMode:  amqp.Persistent,
		Body:          emailQueuePayloadByte,
		CorrelationId: msg.CorrelationId,
	})
	if err != nil {
		log.Printf("Failed to publish to email queue: %v", err)
		_ = msg.Nack(false, false)
		return err
	}

	// Acknowledge the message after successful processing
	if err := msg.Ack(false); err != nil {
		log.Printf("Failed to acknowledge message: %v", err)
		return err
	}

	return nil
}
