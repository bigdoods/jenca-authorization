#!/bin/bash

export POSTGRES_HOST=${POSTGRES_HOST:="172.17.8.150"}
export POSTGRES_USERNAME=${POSTGRES_USERNAME:="username"}
export POSTGRES_PASSWORD=${POSTGRES_PASSWORD:="password"}

echo "waiting for postgres"
sleep 5
DATABASE_URL="postgres://${POSTGRES_USERNAME}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}/jenca-authorisation" pg-migrate up
echo "waiting for tests"
sleep 5
node test.js