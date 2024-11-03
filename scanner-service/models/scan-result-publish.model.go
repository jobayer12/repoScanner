package models

type ScanResult struct {
	Result interface{} `json:"result"`
	ScanId string      `json:"scanId"`
	Status string      `json:"status"`
	UserId int         `json:"userId"`
}
