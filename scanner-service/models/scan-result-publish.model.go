package models

type ScanResult struct {
	Result interface{} `json:"result"`
	ScanId string      `json:"scanId"`
}
