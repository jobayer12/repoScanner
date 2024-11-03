# RepoScanner
`RepoScanner` is a project composed of three microservices that work together to authenticate users, scan GitHub repositories, and send notifications based on scan results. This setup enables secure access control, automated scanning, and email notifications to streamline repository management and security analysis.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Microservices Overview](#microservices-overview)
- [Setup Instructions](#setup-instructions)
  - [Auth Service](#1-auth-service)
  - [Scan Service](#2-scan-service)
  - [Email Service](#3-email-service)
- [Usage](#usage)
- [Contributing](#contributing)

## Prerequisites

Before setting up the project, ensure the following are installed on your local machine:

- **[Trivy](https://aquasecurity.github.io/trivy/v0.18.3/installation/)**: A vulnerability scanner for containers and other artifacts, required to perform security scans.
- **[ZeroMQ](https://zeromq.org/download/)**: A high-performance messaging library, required for inter-service communication.

## Microservices Overview

1. **Auth Service** - Developed using **NestJS**, this service handles user authentication and provides JWT tokens for secure access to other services.
2. **Scan Service** - Built with **Golang**, this service is responsible for scanning GitHub repositories using Trivy. It communicates with the Auth and Email services to perform secure scans and notify users of the results.
3. **Email Service** - Another **NestJS** service, this service sends email notifications based on scan results, utilizing the results from the Scan Service.

## Setup Instructions

### 1. Auth Service

The Auth Service handles user registration, login, and JWT authentication.


#### Steps to Set Up

- Navigate to the `auth-service` directory:

   ```bash
   cd auth-service
   ```

- Rename `.env.sample` to `.env` and configure the environment variables.

- Install the dependencies:
   ```bash
   npm install
   ```
- Start the Auth Service:
   ```bash
   npm run start
   ```

### 2. Scan Service

The Scan Service performs repository scans using Trivy and interacts with other services via ZeroMQ.

#### Steps to Set Up

- Navigate to the `scan-service` directory:

   ```bash
   cd scan-service
   ```
- Rename `.env.sample` to `.env` and configure any necessary environment variables.


- Install any required Go dependencies:
    ```bash
    go mod download
    ```
- Ensure Trivy and ZeroMQ are properly installed, as they are required to run this service.


- Start the Scan Service:
    ```bash
    make run
    ```

### 3. Email Service
The Email Service handles email notifications, alerting users based on scan results.

#### Steps to Set Up

- Navigate to the email-service directory:

    ```bash
    cd email-service
    ```
- Rename `.env.sample` to `.env` and configure any necessary environment variables.

- Install the dependencies:
    ```bash
    npm install
    ```
- Start the Email Service:
    ```bash
    npm run start
    ```

## Usage

- Go to http://localhost:3000/api#/ to see the list of available Auth Service endpoints.

- Use the pre-created user:
  -	Email: john.doe@example.com
  -	Password: v0N6OI8

- Log in to retrieve a JWT token, which can then be used to authorize requests to the services.

- **Perform a Scan:** Send a scan request through the Scan Service using the JWT token from the Auth Service.
- **Receive Email Notification:** Once a scan completes, the Email Service will automatically send a notification based on the results.


## Contributing
Contributions are welcome! Please fork the repository and create a pull request for review.