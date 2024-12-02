package config

import (
	"log"

	"github.com/joho/godotenv"
	"github.com/spf13/viper"
)

// Config struct to hold application configurations
type Config struct {
	MongoDBConnectionURI string `mapstructure:"MONGO_CONNECTION_URI"`
	RabbitMQURI          string `mapstructure:"RABBITMQ_URI"`
	ScanQueueName        string `mapstructure:"SCAN_QUEUE_NAME"`
	RpcQueueName         string `mapstructure:"RPC_QUEUE_NAME"`
	AuthServiceURI       string `mapstructure:"AUTH_SERVICE_URI"`
}

// LoadConfig loads the configuration from .env or system environment variables
func LoadConfig(path string) (config Config, err error) {
	// Load the .env file first if it exists
	err = godotenv.Load(".env")
	if err != nil {
		log.Println("No .env file found, relying on system environment variables")
	} else {
		log.Println("Loaded configuration from .env file")
	}

	// Use Viper to read environment variables
	viper.AutomaticEnv()

	// Manually set .env variables into Viper (as godotenv loads them into os.Env)
	for _, key := range []string{
		"MONGO_CONNECTION_URI",
		"RABBITMQ_URI",
		"SCAN_QUEUE_NAME",
		"RPC_QUEUE_NAME",
		"AUTH_SERVICE_URI",
	} {
		viper.BindEnv(key) // Bind Viper to the environment variable
	}

	// Unmarshal the configuration into the Config struct
	err = viper.Unmarshal(&config)
	if err != nil {
		log.Fatalf("Failed to unmarshal config: %v", err)
	}

	// Return the configuration
	return config, err
}
