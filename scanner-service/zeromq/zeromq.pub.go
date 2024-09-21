package zeromq

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/jobayer12/repoScanner/RepoScannerService/config"
	"github.com/jobayer12/repoScanner/RepoScannerService/models"
	"github.com/jobayer12/repoScanner/RepoScannerService/services"
	"github.com/zeromq/goczmq"
)

type ZPublisher struct {
	scanService services.ScanService
	connection  *goczmq.Sock
}

func NewZeromqPublisher(scanService services.ScanService, route string) *ZPublisher {
	loadConfig, err := config.LoadConfig(".")
	if err != nil {
		log.Fatal("Could not load environment variables", err)
	}

	connection, _ := goczmq.NewPub(fmt.Sprintf("tcp://%s:%s/%s", loadConfig.ZeromqHost, loadConfig.ZeromqPort, route))
	if connection == nil {
		log.Fatal(fmt.Sprintf("Failed to connect zeromq '%s' publisher", route))
	}

	log.Printf("Publisher connected to: %s\n", fmt.Sprintf("tcp://%s:%s/%s", loadConfig.ZeromqHost, loadConfig.ZeromqPort, route))
	return &ZPublisher{scanService: scanService, connection: connection}
}

// PublishMessage Function to publish the message
func (zp *ZPublisher) PublishMessage(objectId, email, repo string) error {
	fmt.Println("objectId", objectId)
	fmt.Println("email", email)
	fmt.Println("repo", repo)
	defer zp.connection.Destroy()
	loadConfig, err := config.LoadConfig(".")
	if err != nil {
		log.Fatal("Could not load environment variables", err)
	}
	payload := models.ScanResultPayload{
		EmailGitHubScan: models.ScanResult{
			Email:          email,
			RepositoryName: repo,
			ScanResultLink: fmt.Sprintf("%s/api/v1/scan/%s", loadConfig.AuthServiceURL, objectId),
		},
	}
	fmt.Println(payload)
	message, err := json.Marshal(payload)
	fmt.Println("after marshal", message)
	if err != nil {
		log.Println("Error marshalling scan request:", err)
		return err
	}
	err = zp.connection.SendFrame(message, goczmq.FlagNone)
	if err != nil {
		log.Fatal("Failed to publish")
		return err
	}
	return nil
}
