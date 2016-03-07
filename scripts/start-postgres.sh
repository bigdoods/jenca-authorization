#!/bin/bash

echo "starting Postgres"

docker rm -f postgres || true
docker run \
  --name postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_USER=username \
  -e POSTGRES_DB=jenca-authorisation \
  -d \
  -p 5432:5432 \
  postgres

echo "postgres running"