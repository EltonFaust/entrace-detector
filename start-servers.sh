#!/bin/bash

set -e -u

cd $(dirname $0)

mkdir -p /tmp
LOG_FILE='./logs/sockets.log'

echo '' > $LOG_FILE


echo "Initializing entrace manager"
npm run entrace-manager &>> $LOG_FILE &
echo "Initializing person identifier"
python3 person-identifier.py




# echo "Initializing person identifier"
# python3 person-identifier.py &>> $LOG_FILE &

# echo "Waiting few seconds"
# sleep 5

# echo "Initializing entrace manager"
# npm run entrace-manager &>> $LOG_FILE &

tail -f $LOG_FILE

wait
