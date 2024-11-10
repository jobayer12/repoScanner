package zeromq

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"os/exec"
	"regexp"
	"strings"

	"github.com/jobayer12/repoScanner/RepoScannerService/models"
	zmq "github.com/pebbe/zmq4"
)

type ZSubscriber struct {
	connection *zmq.Socket
	zPublisher ZPublisher
}

// NewZeromqSubscriber creates a new ZeroMQ subscriber and connects it to the given URL
func NewZeromqSubscriber(zPublisher ZPublisher, url, route string) *ZSubscriber {
	// Create a SUB socket
	connection, err := zmq.NewSocket(zmq.SUB)
	if err != nil {
		log.Fatalf("Failed to create subscriber socket: %v", err)
		return nil
	}

	// Connect to the given URL
	formattedURL := fmt.Sprintf("tcp://%s", url)
	err = connection.Connect(formattedURL)
	if err != nil {
		log.Fatalf("Failed to connect subscriber to %s: %v", formattedURL, err)
		return nil
	}

	// Subscribe to the specified route
	err = connection.SetSubscribe(route)
	if err != nil {
		log.Fatalf("Failed to subscribe to route '%s': %v", route, err)
	}

	log.Printf("Subscriber connected to: tcp://%s/%s\n", url, route)
	return &ZSubscriber{connection: connection, zPublisher: zPublisher}
}

// StartSubscriber starts the subscriber and listens for incoming messages
func (zs *ZSubscriber) StartSubscriber() {
	defer func(connection *zmq.Socket) {
		err := connection.Close()
		if err != nil {
			log.Fatal("ZeroMQ Connection Close")
		}
	}(zs.connection)

	for {
		// Receive a multipart message from the publisher
		msg, err := zs.connection.RecvMessage(0)
		if err != nil {
			log.Printf("Failed to receive message: %v", err)
			continue
		}

		fmt.Printf("Received message [%s]\n", msg)
		// Check if the message has at least two parts (topic and payload)
		if len(msg) < 2 {
			log.Printf("Received incomplete message: %v", msg)
			continue
		}

		// Convert and trim the message frame
		jsonData := strings.TrimSpace(msg[1])

		// Parse the JSON object into the Message struct
		var parsedMessage models.Repository
		status := "SCAN_DONE"
		err = json.Unmarshal([]byte(jsonData), &parsedMessage)
		if err != nil {
			log.Printf("Error parsing JSON: %v\nRaw JSON: %s\n", err, jsonData)
			continue
		}
		log.Printf("Start scanning")

		// Define the Docker Trivy command with the JSON format output
		cmd := exec.Command("trivy", "repo", parsedMessage.Repository, "--format", "json", "--branch", parsedMessage.Branch)

		// Capture the output
		var out bytes.Buffer
		var stderr bytes.Buffer
		cmd.Stdout = &out
		cmd.Stderr = &stderr

		// Run the command
		err = cmd.Run()
		if err != nil {
			fmt.Printf("Error running Trivy scan: %v\n", err)
			if err != nil {
				log.Fatal(err.Error())
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
			status = "SCAN_FAILED"
			scanResult = nil
			log.Fatalf("Failed to parse JSON: %v", err)
		}

		log.Println("Scan Done")
		publishMessagePayload := models.ScanResult{
			Result: scanResult,
			ScanId: parsedMessage.ScanId,
			UserId: parsedMessage.UserId,
			Status: status,
		}

		// Publish the scan result
		if err := zs.zPublisher.PublishMessage("scan.github-scan-result", publishMessagePayload); err != nil {
			log.Fatal(err.Error())
		}
	}
}
