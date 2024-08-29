package main

import (
	"bytes"
	"fmt"
	"os/exec"
)

func main() {
	// The name of the Docker image to scan
	imageName := "alpine:latest"

	// Run Trivy scan
	results, err := runTrivyScan(imageName)
	if err != nil {
		fmt.Printf("Error running Trivy scan: %v\n", err)
		return
	}

	// Print the results
	fmt.Println("Trivy Scan Results:")
	fmt.Println(results)
}

// runTrivyScan runs a Trivy scan on the given Docker image
func runTrivyScan(imageName string) (string, error) {
	cmd := exec.Command("trivy", "image", imageName)

	var out bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &out

	err := cmd.Run()
	if err != nil {
		return "", err
	}

	return out.String(), nil
}
