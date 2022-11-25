#!/bin/bash

docker volume create mongodb

docker volume create mongodb_config

docker network create mongodb

docker run -it --rm -d -v mongodb:/data/db -v mongodb_config:/data/configdb -p 27017:27017 --network mongodb --name mongodb mongo

