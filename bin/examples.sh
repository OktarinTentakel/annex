#!/bin/bash

cd "${0%/*}" && \
cd .. && \
docker compose up
