package models

type RabbitMQScanQueuePayload struct {
	Pattern string     `json:"pattern"`
	Data    Repository `json:"data"`
}

// Repository Define a struct to match the expected JSON structure
type Repository struct {
	Sha        string `json:"sha"`
	Branch     string `json:"branch"`
	Repository string `json:"repository"`
	UserId     int    `json:"userId"`
	Email      string `json:"email"`
}

type EmailQueuePayload struct {
	Pattern string         `json:"pattern"`
	Data    EmailQueueData `json:"data"`
}

type EmailQueueData struct {
	Email          string `json:"email"`
	ScanResultLink string `json:"scanResultLink"`
	Status         string `json:"status"`
}
