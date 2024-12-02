# Build stage: Use Golang to build the application binary
FROM golang:1.21.1-alpine AS builder

# Install build tools and dependencies
RUN apk add --no-cache git gcc g++ libc-dev bash

# Set the working directory inside the container
WORKDIR /app

# Copy go.mod and go.sum to the working directory
COPY go.mod go.sum ./

# Download Go modules
RUN go mod download

# Copy the source code into the container
COPY . .

# Build the application binary
RUN go build -o bin/main cmd/scanner/main.go

# Final stage: Use a minimal image to run the app
FROM alpine:3.18

# Install Trivy and dependencies
RUN apk add --no-cache bash curl ca-certificates \
  && curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin

# Set the working directory
WORKDIR /app

# Copy the built binary from the builder stage
COPY --from=builder /app/bin/main .

# Expose necessary ports (if applicable)
EXPOSE 8080

# Set the entrypoint to execute the binary
ENTRYPOINT ["./main"]