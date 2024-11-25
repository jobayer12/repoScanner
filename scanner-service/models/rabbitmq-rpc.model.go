package models

// RpcResponse type
type RpcResponse struct {
	Data  interface{} `json:"data,omitempty"`
	Error string      `json:"error,omitempty"`
}

// RpcPayload type
type RpcPayload struct {
	ID     string `json:"id,omitempty"`
	UserID int    `json:"userId"`
}
