#!/bin/bash

set -e -u

cd $(dirname $0)

mkdir -p /tmp
LOG_FILE='./logs/sockets.log'

echo "Initializing person identifier"
npm run person-identifier &>> $LOG_FILE &

echo "Waiting few seconds"
sleep 3

echo "Initializing entrace manager"
npm run entrace-manager &>> $LOG_FILE &

echo "Waiting few seconds"
sleep 3

echo "Initializing cam mediator"
npm run cam-mediator &>> $LOG_FILE &

tail -f $LOG_FILE

wait
