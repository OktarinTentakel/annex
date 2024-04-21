#!/bin/bash

cd "${0%/*}" && \
cd .. && \
docker compose run --rm \
annex bash -c "yarn install; gulp --color test $1"
