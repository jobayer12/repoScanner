package main

import (
	"log"
	"log/slog"

	"github.com/jobayer12/repoScanner/RepoScannerService/config"
	"github.com/jobayer12/repoScanner/RepoScannerService/logger"
	"github.com/jobayer12/repoScanner/RepoScannerService/zeromq"
)

func init() {
	slog.SetDefault(logger.Logger())
}

func main() {
	loadConfig, err := config.LoadConfig(".")
	if err != nil {
		log.Fatal("Failed to load environment variables", err)
	}
	// Create ZeroMQ publisher socket
	zeroPublisher := zeromq.NewZeromqPublisher(loadConfig.ZeromqPublishURL)
	//Create ZeroMQ subscriber socket
	ZeroSubscriber := zeromq.NewZeromqSubscriber(zeroPublisher, loadConfig.ZeromqSubscribeURL, "scan.github-scan")
	ZeroSubscriber.StartSubscriber()

}
