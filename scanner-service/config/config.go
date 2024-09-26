package config

import (
	_ "time"

	"github.com/spf13/viper"
)

type Config struct {
	ZeromqPublishURL   string `mapstructure:"ZEROMQ_PUBLISH_URL"`
	ZeromqSubscribeURL string `mapstructure:"ZEROMQ_SUBSCRIBE_URL"`
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
