#!/bin/bash

cd "${0%/*}" && \
./build.sh && \
./documentation.sh
