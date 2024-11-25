package internal

import (
	"context"
	"encoding/json"
	"github.com/jobayer12/repoScanner/RepoScannerService/models"
	services "github.com/jobayer12/repoScanner/RepoScannerService/services/scan"
	amqp "github.com/rabbitmq/amqp091-go"
	"log"
)

type RabbitMQRpc struct {
	client      *RabbitMQClient
	scanService services.ScanService
	ctx         context.Context
}

func NewRabbitMQRPC(client *RabbitMQClient, scanService services.ScanService, ctx context.Context) *RabbitMQRpc {
	return &RabbitMQRpc{
		client:      client,
		scanService: scanService,
		ctx:         ctx,
	}
}

func (rpc *RabbitMQRpc) StartConsumingRpcRequest(queue, consumer string) {
	messages, err := rpc.client.Consume(queue, consumer, false) // Set autoAck to false for manual acknowledgment
	if err != nil {
		log.Fatal("Failed to register a consumer:", err)
	}

	ch, _ := rpc.client.conn.Channel() // Ensure you have access to the RabbitMQ channel
	if ch == nil {
		log.Fatal("RabbitMQ channel is not initialized")
	}

	log.Println("Waiting for RPC requests...")
	for d := range messages {
		go func(delivery amqp.Delivery) { // Use a goroutine to process each message
			go rpc.handleRPCRequest(delivery, ch)
			_ = delivery.Ack(false) // Acknowledge the message after processing
		}(d)
	}
}

// HandleRPCRequest Handle RPC Requests with enhanced structure
func (rpc *RabbitMQRpc) handleRPCRequest(d amqp.Delivery, ch *amqp.Channel) {

	var response models.RpcResponse

	request := models.BaseQueuePayload[models.RpcPayload]{}
	if err := json.Unmarshal(d.Body, &request); err != nil {
		log.Println(err)
		response = models.RpcResponse{Error: "Invalid request format"}
		sendResponse(ch, d, response)
		return
	}

	switch request.Pattern {
	case "scanList":
		// Fetch data based on the constructed query
		data, err := rpc.scanService.Find(request.Data)
		if err != nil {
			response = models.RpcResponse{Error: "Data not found", Data: make([]interface{}, 0)}
		} else {
			response = models.RpcResponse{Data: data, Error: ""}
		}

	default:
		response = models.RpcResponse{Error: "Unknown command"}
	}

	sendResponse(ch, d, response)
}

// Helper function to send the response back to RabbitMQ
func sendResponse(ch *amqp.Channel, d amqp.Delivery, response models.RpcResponse) {
	responseBody, _ := json.Marshal(response)
	err := ch.Publish(
		"",        // exchange
		d.ReplyTo, // reply queue
		false,
		false,
		amqp.Publishing{
			ContentType:   "application/json",
			CorrelationId: d.CorrelationId,
			Body:          responseBody,
		},
	)
	if err != nil {
		return
	}
}
