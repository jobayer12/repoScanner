package internal

import (
	"context"
	amqp "github.com/rabbitmq/amqp091-go"
)

func ConnectRabbitMQ(url string) (*amqp.Connection, error) {
	return amqp.Dial(url)
}

type RabbitMQClient struct {
	conn *amqp.Connection
}

func NewRabbitMQClient(conn *amqp.Connection) (*RabbitMQClient, error) {
	return &RabbitMQClient{conn: conn}, nil
}

func (client *RabbitMQClient) Consume(queue, consumer string, autoAck bool) (<-chan amqp.Delivery, error) {
	ch, err := client.conn.Channel()
	if err != nil {
		return nil, err
	}
	return ch.Consume(queue, consumer, autoAck, false, false, false, nil)
}

func (client *RabbitMQClient) Close() error {
	ch, err := client.conn.Channel()
	if err != nil {
		return err
	}
	return ch.Close()
}

func (client *RabbitMQClient) Send(ctx context.Context, exchange string, routingKey string, options amqp.Publishing) error {
	ch, err := client.conn.Channel()
	if err != nil {
		return err
	}
	defer ch.Close()
	return ch.PublishWithContext(ctx,
		exchange,   // exchange
		routingKey, // routing key
		// Mandatory is used when we HAVE to have the message return an error, if there is no route or queue then
		// setting this to true will make the message bounce back
		// If this is False, and the message fails to deliver, it will be dropped
		true, // mandatory
		// immediate Removed in MQ 3 or up https://blog.rabbitmq.com/posts/2012/11/breaking-things-with-rabbitmq-3-0§
		false,   // immediate
		options, // amqp publishing struct
	)
}
