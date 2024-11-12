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
	"log"
	"os/exec"
	"regexp"
	"time"

	"golang.org/x/sync/errgroup"
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
	messageBus, err := rmc.client.Consume(queue, consumer, false)
	if err != nil {
		return
	}

	if err != nil {
		panic(err)
	}

	var blocking chan struct{}

	ctx, cancel := context.WithTimeout(rmc.ctx, 15*time.Second)
	defer cancel()

	g, ctx := errgroup.WithContext(ctx)
	g.SetLimit(10)

	go func() {
		for message := range messageBus {
			msg := message
			g.Go(func() error {
				if err := msg.Ack(false); err != nil {
					log.Println("Ack message failed")
					return err
				}

				// Parse the JSON object into the Message struct
				var parsedMessage models.RabbitMQScanQueuePayload
				err = json.Unmarshal(msg.Body, &parsedMessage)
				if err != nil {
					log.Printf("Error parsing JSON: %v\n", err)
					return nil
				}
				log.Printf("Start scanning")
				// Define the Docker Trivy command with the JSON format output
				cmd := exec.Command("trivy", "repo", parsedMessage.Data.Repository, "--format", "json", "--branch", parsedMessage.Data.Branch)
				var out bytes.Buffer
				var stderr bytes.Buffer
				cmd.Stdout = &out
				cmd.Stderr = &stderr
				var createScan *models.CreateScanRequest
				var updateScan *models.UpdateScanResult
				createScan = &models.CreateScanRequest{
					UserId:     parsedMessage.Data.UserId,
					Repository: parsedMessage.Data.Repository,
					Branch:     parsedMessage.Data.Branch,
					Sha:        parsedMessage.Data.Sha,
				}
				createScanResponse, err := rmc.scanService.CreateScan(createScan)
				if err != nil {
					log.Fatalf("Failed to create scan in mongodb %v", err.Error())
				}

				// Run the command
				err = cmd.Run()

				if err != nil {
					fmt.Printf("Error running Trivy scan: %v\n", err)
					fmt.Printf("Stderr: %v\n", stderr.String())
					updateScan = &models.UpdateScanResult{
						Status:    "SCAN_FAILED",
						Result:    nil,
						UpdatedAt: time.Now(),
					}
					_, err := rmc.scanService.UpdateScan(createScanResponse.Id.Hex(), updateScan)
					if err != nil {
						log.Fatalf("Failed to update scan in mongodb %v", err.Error())
					}
				}

				// Extract the JSON part of the output using a regular expression
				re := regexp.MustCompile(`(?s)(\{.*\}|$begin:math:display$.*$end:math:display$)`)
				jsonPart := re.FindString(out.String())

				if jsonPart == "" {
					log.Fatal("No valid JSON found in the Trivy output")
				}

				// Parse the extracted JSON part
				var scanResult interface{}
				err = json.Unmarshal([]byte(jsonPart), &scanResult)
				if err != nil {
					//status = "SCAN_FAILED"
					scanResult = nil
					log.Fatalf("Failed to parse JSON: %v", err)
				}

				updateScan = &models.UpdateScanResult{
					Status:    "SCAN_DONE",
					Result:    scanResult,
					UpdatedAt: time.Now(),
				}

				log.Println("Scan Done")

				_, err = rmc.scanService.UpdateScan(createScanResponse.Id.Hex(), updateScan)
				if err != nil {
					log.Fatal(err.Error())
				}

				loadConfig, err := config.LoadConfig(".")
				if err != nil {
					log.Fatal("Failed to load environment variables", err)
				}

				emailQueueData := models.EmailQueueData{
					Email:          parsedMessage.Data.Email,
					ScanResultLink: fmt.Sprintf("%v/api/v1/scan/%v", loadConfig.AuthServiceHost, createScanResponse.Id.Hex()),
					Status:         "SCAN_DONE",
				}

				emailQueuePayload := models.EmailQueuePayload{
					Pattern: routingKey,
					Data:    emailQueueData,
				}

				emailQueuePayloadByte, err := json.Marshal(emailQueuePayload)
				if err != nil {
					log.Printf("Failed to marshal: %v", emailQueuePayload)
					return err
				}

				if err := rmc.publishClient.Send(ctx, exchange, routingKey, amqp.Publishing{
					ContentType:   "text/plain",
					DeliveryMode:  amqp.Persistent,
					Body:          emailQueuePayloadByte,
					CorrelationId: msg.CorrelationId,
				}); err != nil {
					panic(err)
				}
				return nil
			})
		}
	}()

	log.Println("Consuming, use CTRL+C to exit")
	<-blocking
}
