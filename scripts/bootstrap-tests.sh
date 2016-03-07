#!/bin/bash

export POSTGRES_HOST=${POSTGRES_HOST:="172.17.8.150"}

echo "waiting for postgres"
sleep 5
DATABASE_URL="postgres://username:password@${POSTGRES_HOST}/jenca-authorisation" pg-migrate up
echo "waiting for tests"
sleep 5
node test.js