package services

import (
	"context"
	"errors"
	"strconv"
	"time"

	"github.com/jobayer12/repoScanner/RepoScannerService/models"
	"github.com/jobayer12/repoScanner/RepoScannerService/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type ScanServiceImpl struct {
	scanCollection *mongo.Collection
	ctx            context.Context
}

func NewScanService(scanCollection *mongo.Collection, ctx context.Context) ScanService {
	return &ScanServiceImpl{scanCollection, ctx}
}

func (s *ScanServiceImpl) CreateScan(request *models.CreateScanRequest) (*models.ScanDBSchema, error) {
	request.CreateAt = time.Now()
	request.Status = "START_SCANNING"
	res, err := s.scanCollection.InsertOne(s.ctx, request)

	if err != nil {
		var er mongo.WriteException
		if errors.As(err, &er) && er.WriteErrors[0].Code == 11000 {
			return nil, errors.New("post with that title already exists")
		}
		return nil, err
	}
	var scanResult *models.ScanDBSchema
	query := bson.M{"_id": res.InsertedID}
	if err = s.scanCollection.FindOne(s.ctx, query).Decode(&scanResult); err != nil {
		return nil, err
	}
	return scanResult, nil
}

func (s *ScanServiceImpl) UpdateScan(id string, result *models.UpdateScanResult) (*models.ScanDBSchema, error) {
	doc, err := utils.ToDoc(result)
	if err != nil {
		return nil, err
	}
	obId, _ := primitive.ObjectIDFromHex(id)
	query := bson.D{{Key: "_id", Value: obId}}
	update := bson.D{{Key: "$set", Value: doc}}
	res := s.scanCollection.FindOneAndUpdate(s.ctx, query, update, options.FindOneAndUpdate().SetReturnDocument(1))
	var updatedPost *models.ScanDBSchema
	if err := res.Decode(&updatedPost); err != nil {
		return nil, errors.New("no scan with that Id exists")
	}
	return updatedPost, nil
}

func (s *ScanServiceImpl) Find(filter models.RpcPayload) ([]*models.ScanDBSchema, error) {
	// Initialize the query object
	query := bson.M{}
	// Add `id` to the query if it's available in the payload
	if filter.ID != "" {
		obId, err := primitive.ObjectIDFromHex(filter.ID)
		if err == nil { // Ensure the ID is a valid ObjectID
			query["_id"] = obId
		}
	}
	// Add `userId` to the query if it's available in the payload
	if filter.UserID > 0 {
		query["userId"] = filter.UserID
	}

	cursor, err := s.scanCollection.Find(s.ctx, query)

	if err != nil {
		return nil, err
	}
	defer cursor.Close(s.ctx)
	var scans []*models.ScanDBSchema
	for cursor.Next(s.ctx) {
		scan := &models.ScanDBSchema{}
		err := cursor.Decode(scan)

		if err != nil {
			return nil, err
		}

		scans = append(scans, scan)
	}
	if err := cursor.Err(); err != nil {
		return nil, err
	}

	if len(scans) == 0 {
		return []*models.ScanDBSchema{}, nil
	}

	return scans, nil
}

func (s *ScanServiceImpl) FindScanById(id, userId string) (*models.ScanDBSchema, error) {
	obId, _ := primitive.ObjectIDFromHex(id)

	query := bson.M{"id": obId, "userId": userId}

	var post *models.ScanDBSchema

	if err := s.scanCollection.FindOne(s.ctx, query).Decode(&post); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, errors.New("no document with that Id exists")
		}

		return nil, err
	}

	return post, nil
}

func (s *ScanServiceImpl) ScanListByUserId(userId, page, limit int) ([]*models.ScanDBSchema, error) {
	if page <= 0 {
		page = 1
	}

	if limit <= 0 {
		limit = 10
	}
	skip := (page - 1) * limit
	opt := options.FindOptions{}
	opt.SetLimit(int64(limit))
	opt.SetSkip(int64(skip))
	opt.SetSort(bson.M{"created_at": -1})
	obId, _ := primitive.ObjectIDFromHex(strconv.Itoa(userId))
	query := bson.M{"user_id": obId}
	cursor, err := s.scanCollection.Find(s.ctx, query, &opt)

	if err != nil {
		return nil, err
	}
	defer cursor.Close(s.ctx)
	var scans []*models.ScanDBSchema
	for cursor.Next(s.ctx) {
		scan := &models.ScanDBSchema{}
		err := cursor.Decode(scan)

		if err != nil {
			return nil, err
		}

		scans = append(scans, scan)
	}
	if err := cursor.Err(); err != nil {
		return nil, err
	}

	if len(scans) == 0 {
		return []*models.ScanDBSchema{}, nil
	}

	return scans, nil
}
