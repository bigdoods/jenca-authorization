.PHONY: images test postgres

VERSION = 1.0.0
SERVICE = jenca-authorization
HUBACCOUNT = jenca

ROOT_DIR := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

# build the docker images
# the dev version includes development node modules
images:
	docker build -t $(HUBACCOUNT)/$(SERVICE):latest .
	docker build -f Dockerfile.dev -t $(HUBACCOUNT)/$(SERVICE):latest-dev .
	docker rmi $(HUBACCOUNT)/$(SERVICE):$(VERSION) $(HUBACCOUNT)/$(SERVICE):$(VERSION)-dev || true
	docker tag $(HUBACCOUNT)/$(SERVICE):latest $(HUBACCOUNT)/$(SERVICE):$(VERSION)
	docker tag $(HUBACCOUNT)/$(SERVICE):latest-dev $(HUBACCOUNT)/$(SERVICE):$(VERSION)-dev

test: postgres
	docker run -ti --rm \
		--entrypoint npm \
		-e POSTGRES_HOST=postgres \
		--link postgres:postgres \
		$(HUBACCOUNT)/$(SERVICE):$(VERSION)-dev test
	docker rm -f postgres || true

postgres:
	bash scripts/start-postgres.sh