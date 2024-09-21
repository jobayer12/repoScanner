package config

import (
	"github.com/spf13/viper"
	_ "time"
)

type Config struct {
	ZeromqPort string `mapstructure:"ZEROMQ_PORT"`
	ZeromqHost string `mapstructure:"ZEROMQ_HOST"`

	MongoDBConnectionURI string `mapstructure:"MONGO_CONNECTION_URL"`

	AuthServiceURL string `mapstructure:"AUTH_SERVICE_URL"`
}

func LoadConfig(path string) (config Config, err error) {
	viper.AddConfigPath(path)
	viper.SetConfigType("env")
	viper.SetConfigName(".env")

	viper.AutomaticEnv()

	err = viper.ReadInConfig()
	if err != nil {
		return
	}

	err = viper.Unmarshal(&config)
	return
}
