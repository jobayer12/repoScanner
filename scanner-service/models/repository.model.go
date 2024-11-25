package models

type BaseQueuePayload[T any] struct {
	Pattern string `json:"pattern"`
	Data    T      `json:"data"`
}

// Repository Define a struct to match the expected JSON structure
type Repository struct {
	Sha        string `json:"sha"`
	Branch     string `json:"branch"`
	Repository string `json:"repository"`
	UserId     int    `json:"userId"`
	Email      string `json:"email"`
}
type EmailQueueData struct {
	Email          string `json:"email"`
	ScanResultLink string `json:"scanResultLink"`
	Status         string `json:"status"`
}
