#! /usr/bin/env bash

docker run -d \
    --name hewkawjang-db \
    -e POSTGRES_PASSWORD=postgres \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_DB=hewkawjang \
    -p 5432:5432 \
    postgres