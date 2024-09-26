package zeromq

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/zeromq/goczmq"
)

type ZPublisher struct {
	connection *goczmq.Sock
}

func NewZeromqPublisher(url string) *ZPublisher {
	connection, _ := goczmq.NewPub(url)
	if connection == nil {
		log.Fatal("Failed to connect zeromq publisher")
	}

	connection.Bind(url)

	log.Printf("Publisher connected to: %s\n", fmt.Sprintf("tcp://%s", url))
	return &ZPublisher{connection: connection}
}

// PublishMessage Function to publish the message
func (zp *ZPublisher) PublishMessage(topic string, payload interface{}) error {
	message, err := json.Marshal(payload)
	if err != nil {
		log.Println("Error marshalling scan request:", err)
		return err
	}
	err = zp.connection.SendFrame([]byte(message), 0)
	fmt.Println("after send message", err)
	if err != nil {
		log.Fatal("Failed to publish")
		return err
	}
	return nil
}

// Close Call Destroy only when done with the connection
func (zp *ZPublisher) Close() {
	zp.connection.Destroy()
}
