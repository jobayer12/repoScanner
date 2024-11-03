package zeromq

import (
	"encoding/json"
	"fmt"
	"log"

	zmq "github.com/pebbe/zmq4"
)

type ZPublisher struct {
	connection *zmq.Socket
}

// NewZeromqPublisher creates a new ZeroMQ publisher and binds it to the given URL
func NewZeromqPublisher(url string) ZPublisher {
	// Create a new PUB socket
	publisher, err := zmq.NewSocket(zmq.PUB)
	if err != nil {
		panic(err)
		// log.Fatalf("Failed to create publisher socket: %v", err)
		// return nil
	}

	fmt.Println(url)
	// Bind to the provided URL
	err = publisher.Bind(fmt.Sprintf("tcp://%s", url))
	if err != nil {
		panic(err)
		// log.Fatalf("Failed to bind publisher to URL: %v", err)
		// return nil
	}

	log.Printf("Publisher connected to: %s\n", fmt.Sprintf("tcp://%s", url))
	return ZPublisher{connection: publisher}
}

// PublishMessage publishes the given payload as a JSON-encoded message
func (zp ZPublisher) PublishMessage(topic string, payload interface{}) error {
	// Marshal the payload into JSON
	message, err := json.Marshal(payload)
	if err != nil {
		panic(err)
		// log.Printf("Error marshalling payload: %v", err)
		// return err
	}

	// Send the message with the topic as a multipart message
	_, err = zp.connection.SendMessage(topic, string(message))
	if err != nil {
		panic(err)
		// log.Printf("Failed to publish message: %v", err)
		// return err
	}
	return nil
}

// Close terminates the ZeroMQ publisher socket
func (zp *ZPublisher) Close() {
	err := zp.connection.Close()
	if err != nil {
		return
	}
	log.Println("Publisher connection closed")
}
