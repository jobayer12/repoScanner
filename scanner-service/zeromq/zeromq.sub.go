package zeromq

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"os/exec"
	"regexp"
	"strings"
	"time"

	"github.com/jobayer12/repoScanner/RepoScannerService/config"
	"github.com/jobayer12/repoScanner/RepoScannerService/models"
	"github.com/jobayer12/repoScanner/RepoScannerService/services"
	"github.com/zeromq/goczmq"
)

type ZSubscriber struct {
	scanService services.ScanService
	connection  *goczmq.Sock
	zPublisher  *ZPublisher
}

func NewZeromqSubscriber(scanService services.ScanService, zPublisher *ZPublisher, route string) *ZSubscriber {
	loadConfig, err := config.LoadConfig(".")
	if err != nil {
		log.Fatal("Could not load environment variables", err)
	}
	connection, _ := goczmq.NewSub(fmt.Sprintf("tcp://%s:%s", loadConfig.ZeromqHost, loadConfig.ZeromqPort), route)
	if connection == nil {
		log.Fatal(fmt.Sprintf("Failed to connect zeromq '%s' subscriber", route))
	}

	log.Printf("Subscriber connected to: %s\n", fmt.Sprintf("tcp://%s:%s/%s", loadConfig.ZeromqHost, loadConfig.ZeromqPort, route))
	return &ZSubscriber{scanService: scanService, connection: connection, zPublisher: zPublisher}
}

// StartSubscriber Function to start the subscriber and listen for messages
func (zs *ZSubscriber) StartSubscriber() {

	defer zs.connection.Destroy()

	for {
		// Receive a message from the publisher
		msg, err := zs.connection.RecvMessage()
		fmt.Printf(string(msg[1]))
		if err != nil {
			log.Printf("Failed to receive message: %v", err)
			continue
		}

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
		var createScan *models.CreateScanRequest
		var updateScan *models.UpdateScanResult
		createScan = &models.CreateScanRequest{
			UserId:     parsedMessage.UserId,
			Repository: parsedMessage.Repository,
			Branch:     parsedMessage.Branch,
			Sha:        parsedMessage.Sha,
		}

		createScanResponse, err := zs.scanService.CreateScan(createScan)
		if err != nil {
			log.Fatal("Failed to create scan in mongodb")
			return
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
			_, err := zs.scanService.UpdateScan(createScanResponse.Id.Hex(), updateScan)
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

		updateScan = &models.UpdateScanResult{
			Status:    "SCAN_DONE",
			Result:    scanResult,
			UpdatedAt: time.Now(),
		}

		log.Println("Scan Done")

		_, err = zs.scanService.UpdateScan(createScanResponse.Id.Hex(), updateScan)
		if err != nil {
			log.Fatal(err.Error())
		}

		if err := zs.zPublisher.PublishMessage(createScanResponse.Id.Hex(), parsedMessage.Email, parsedMessage.Repository); err != nil {
			log.Fatal(err.Error())
		}
	}
}
