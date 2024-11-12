package internal

import (
	"context"
	"encoding/json"
	"github.com/jobayer12/repoScanner/RepoScannerService/models"
	services "github.com/jobayer12/repoScanner/RepoScannerService/services/scan"
	amqp "github.com/rabbitmq/amqp091-go"
)

// ListRequest Request and Response Structures
type ListRequest struct {
	Cmd    string `json:"cmd"`
	UserId string `json:"userId,omitempty"`
}

type ByIDRequest struct {
	Cmd    string `json:"cmd"`
	ID     string `json:"id"`
	UserId string `json:"userId"`
}

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

// HandleRPCRequest Handle RPC Requests with enhanced structure
func (rpc *RabbitMQRpc) HandleRPCRequest(d amqp.Delivery, ch *amqp.Channel) {
	//ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	//defer cancel()

	var response models.Response

	request := ListRequest{}
	if err := json.Unmarshal(d.Body, &request); err != nil {
		response = models.Response{Error: "Invalid request format"}
		sendResponse(ch, d, response)
		return
	}

	switch request.Cmd {
	//case "getList":
	//	if request.UserId != "" {
	//		filter = bson.M{"userId": request.UserId}
	//	}
	//	data, err := services.ScanService.ScanListByUserId(request.UserId, 0, 100))
	//	if err != nil {
	//		response = Response{Error: "Failed to fetch data"}
	//	} else {
	//		response = Response{Data: data}
	//	}

	case "getById":
		idReq := ByIDRequest{}
		err := json.Unmarshal(d.Body, &idReq)
		if err != nil {
			return
		}

		data, err := rpc.scanService.FindScanById(idReq.ID, idReq.UserId)
		if err != nil {
			response = models.Response{Error: "Data not found"}
		} else {
			response = models.Response{Data: data}
		}

	default:
		response = models.Response{Error: "Unknown command"}
	}

	sendResponse(ch, d, response)
}

// Helper function to send the response back to RabbitMQ
func sendResponse(ch *amqp.Channel, d amqp.Delivery, response models.Response) {
	responseBody, _ := json.Marshal(response)
	ch.Publish(
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
}
