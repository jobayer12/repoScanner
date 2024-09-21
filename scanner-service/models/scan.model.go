package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

type CreateScanRequest struct {
	UserId     int       `json:"userId,omitempty" bson:"userId,omitempty"`
	CreateAt   time.Time `json:"created_at,omitempty" bson:"created_at,omitempty"`
	Status     string    `json:"status,omitempty" bson:"status,omitempty"`
	Repository string    `json:"repository,omitempty" bson:"repository,omitempty"`
	Branch     string    `json:"branch,omitempty" bson:"branch,omitempty"`
	Sha        string    `json:"sha,omitempty" bson:"sha,omitempty"`
}

type ScanDBSchema struct {
	Id         primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	UserId     int                `json:"userId,omitempty" bson:"userId,omitempty"`
	Result     any                `json:"result,omitempty" bson:"result,omitempty"`
	CreateAt   time.Time          `json:"created_at,omitempty" bson:"created_at,omitempty"`
	UpdatedAt  time.Time          `json:"updated_at,omitempty" bson:"updated_at,omitempty"`
	Status     string             `json:"status,omitempty" bson:"status,omitempty"`
	Repository string             `json:"repository,omitempty" bson:"repository,omitempty"`
	Branch     string             `json:"branch,omitempty" bson:"branch,omitempty"`
	Sha        string             `json:"sha,omitempty" bson:"sha,omitempty"`
}

type UpdateScanResult struct {
	Result    any       `json:"result,omitempty" bson:"result,omitempty"`
	UpdatedAt time.Time `json:"updated_at,omitempty" bson:"updated_at,omitempty"`
	Status    string    `json:"status,omitempty" bson:"status,omitempty"`
}
