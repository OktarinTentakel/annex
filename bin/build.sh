#!/bin/bash

cd "${0%/*}" && \
cd .. && \
docker-compose run --rm -u $(id -u):$(id -g) annex bash -c "yarn; gulp --color build"
