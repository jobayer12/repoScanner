package config

import (
	"log"

	"github.com/spf13/viper"
)

type Config struct {
	ZeromqPublishURL     string `mapstructure:"ZEROMQ_PUBLISH_URL"`
	ZeromqSubscribeURL   string `mapstructure:"ZEROMQ_SUBSCRIBE_URL"`
	MongoDBConnectionURI string `mapstructure:"MONGO_CONNECTION_URL"`
}

func LoadConfig(path string) (config Config, err error) {
	// Set the path where viper will look for the file
	viper.AddConfigPath(path)
	viper.SetConfigType("env")
	viper.SetConfigName(".env")

	// Automatically read environment variables
	viper.AutomaticEnv()

	// Try to read the config file if it exists
	if err := viper.ReadInConfig(); err == nil {
		log.Println("Using .env file for configuration")
	} else {
		log.Fatal("No .env file found, relying on environment variables")
	}

	// Unmarshal the config from environment variables
	err = viper.Unmarshal(&config)
	return
}
