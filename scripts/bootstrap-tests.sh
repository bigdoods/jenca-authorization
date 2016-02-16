#!/bin/bash

echo "starting Postgres"

export POSTGRES_HOST=172.17.8.150

vagrant ssh -c "docker rm -f postgres"
vagrant ssh -c "bash /vagrant/scripts/docker-postgres.sh"

echo "postgres running on ${POSTGRES_HOST}"

DATABASE_URL="postgres://username:password@${POSTGRES_HOST}/jenca-authorisation" ./node_modules/.bin/pg-migrate up

npm test