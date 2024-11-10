# Stage 1: Build the Go application
FROM golang:alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy go.mod, go.sum, and Makefile, then download dependencies
COPY go.mod go.sum makefile ./

RUN go mod download

# Copy the rest of the code
COPY . .

# Build the application using makefile command
RUN make build

# Stage 2: Set up the runtime environment with Trivy
FROM golang:alpine AS production

# Set the working directory
WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder /app/bin/main /app/main

# Expose any necessary ports, e.g., 8080 for the API
EXPOSE 8080

# Set the entrypoint command to run the application
CMD ["./main"]