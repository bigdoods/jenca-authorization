#!/bin/bash

echo "starting Postgres"

export POSTGRES_HOST=172.17.8.150

docker run \
  --name postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_USER=username \
  -e POSTGRES_DB=jenca-authorisation \
  -d \
  -p 5432:5432 \
  postgres

echo "postgres running on ${POSTGRES_HOST}"

DATABASE_URL="postgres://username:password@${POSTGRES_HOST}/jenca-authorisation" ./node_modules/.bin/pg-migrate up

npm test