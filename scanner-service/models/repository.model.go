package models

// Repository Define a struct to match the expected JSON structure
type Repository struct {
	Sha        string `json:"sha"`
	Branch     string `json:"branch"`
	Repository string `json:"repository"`
	UserId     int    `json:"userId"`
	Email      string `json:"email"`
}
