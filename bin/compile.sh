#!/bin/bash

cd "${0%/*}" && \
./build.sh && \
./doc.sh
