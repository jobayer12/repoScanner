package models

// Repository Define a struct to match the expected JSON structure
type Repository struct {
	Branch     string `json:"branch"`
	Repository string `json:"repository"`
	ScanId     string `json:"scanId"`
	UserId     int    `json:"userId"`
}
