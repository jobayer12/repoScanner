#!/bin/bash
# Ensure the script is executable
# chmod +x setup.sh
set -a
source /tmp/rabbitmq.env
set +a

/tmp/rabbitmq.env


rabbitmqctl set_user_tags $RABBITMQ_DEFAULT_USER administrator
rabbitmqctl set_permissions -p / $RABBITMQ_DEFAULT_USER ".*" ".*" ".*"

# Create exchange
rabbitmqadmin -u $RABBITMQ_DEFAULT_USER -p $RABBITMQ_DEFAULT_PASS declare exchange name=reposcanner type=topic

# Create queues
rabbitmqadmin -u $RABBITMQ_DEFAULT_USER -p $RABBITMQ_DEFAULT_PASS declare queue name=$SCAN_QUEUE_NAME
rabbitmqadmin -u $RABBITMQ_DEFAULT_USER -p $RABBITMQ_DEFAULT_PASS declare queue name=$EMAIL_QUEUE_NAME
rabbitmqadmin -u $RABBITMQ_DEFAULT_USER -p $RABBITMQ_DEFAULT_PASS declare queue name=$RPC_QUEUE_NAME

# Bind queues to exchange
rabbitmqadmin -u $RABBITMQ_DEFAULT_USER -p $RABBITMQ_DEFAULT_PASS declare binding source=reposcanner destination=$SCAN_QUEUE_NAME routing_key="repo.scan.*"
rabbitmqadmin -u $RABBITMQ_DEFAULT_USER -p $RABBITMQ_DEFAULT_PASS declare binding source=reposcanner destination=$EMAIL_QUEUE_NAME routing_key="repo.email.*"
rabbitmqadmin -u $RABBITMQ_DEFAULT_USER -p $RABBITMQ_DEFAULT_PASS declare binding source=reposcanner destination=$RPC_QUEUE_NAME routing_key="repo.rpc.scan"