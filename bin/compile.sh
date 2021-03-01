#!/bin/bash

cd "${0%/*}" && \
./build.sh && \
./docs.sh
