package models

type ScanResult struct {
	Email          string `json:"email"`
	RepositoryName string `json:"repositoryName"`
	ScanResultLink string `json:"scanResultLink"`
}

type ScanResultPayload struct {
	EmailGitHubScan ScanResult `json:"email.github-scan"`
}
