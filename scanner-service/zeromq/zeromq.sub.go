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
	"github.com/zeromq/goczmq"
)

type ZSubscriber struct {
	connection *goczmq.Sock
	zPublisher *ZPublisher
}

func NewZeromqSubscriber(zPublisher *ZPublisher, url, route string) *ZSubscriber {
	formattedURL := fmt.Sprintf("tcp://%s", url)
	log.Println("formattedURL", formattedURL)
	connection, _ := goczmq.NewSub(formattedURL, route)
	if connection == nil {
		log.Fatal(fmt.Sprintf("Failed to connect zeromq '%s' subscriber", route))
	}

	log.Printf("Subscriber connected to: %s\n", fmt.Sprintf("tcp://%s/%s", url, route))
	return &ZSubscriber{connection: connection, zPublisher: zPublisher}
}

// StartSubscriber Function to start the subscriber and listen for messages
func (zs *ZSubscriber) StartSubscriber() {
	defer zs.connection.Destroy()

	for {
		// Receive a message from the publisher
		msg, err := zs.connection.RecvMessage()
		if err != nil {
			log.Printf("Failed to receive message: %v", err)
			continue
		}
		fmt.Printf("Received message [%s]\n", msg)
		// Check if the message has at least one frame
		if len(msg) < 2 {
			log.Printf("Received incomplete message: %v", msg)
			continue
		}

		// Convert and trim the message frame
		jsonData := strings.TrimSpace(string(msg[1]))

		// Parse the JSON object into the Message struct
		var parsedMessage models.Repository
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
			return
		}

		re := regexp.MustCompile(`(?s)(\{.*\}|$begin:math:display$.*$end:math:display$)`)
		jsonPart := re.FindString(out.String())

		if jsonPart == "" {
			log.Fatal("No valid JSON found in the Trivy output")
			return
		}

		// Parse the extracted JSON part
		var scanResult interface{}
		err = json.Unmarshal([]byte(jsonPart), &scanResult)
		if err != nil {
			log.Fatalf("Failed to parse JSON: %v", err)
			return
		}

		log.Println("Scan Done")
		publishMessagePayload := models.ScanResult{
			Result: scanResult,
			ScanId: parsedMessage.ScanId,
		}

		if err := zs.zPublisher.PublishMessage("github-scan-result", publishMessagePayload); err != nil {
			log.Fatal(err.Error())
		}
	}
}
