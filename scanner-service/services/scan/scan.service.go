package services

import (
	"github.com/jobayer12/repoScanner/RepoScannerService/models"
)

type ScanService interface {
	CreateScan(*models.CreateScanRequest) (*models.ScanDBSchema, error)
	UpdateScan(string, *models.UpdateScanResult) (*models.ScanDBSchema, error)
	FindScanById(string, string) (*models.ScanDBSchema, error)
	ScanListByUserId(userId, page, limit int) ([]*models.ScanDBSchema, error)
}
