#!/usr/bin/env bash

SRC_DOMAIN=""
FILE_NAME=""

npx sfcc-ci auth:login

npx sfcc-ci instance:export -i $SRC_DOMAIN --data "./config/data_units.json" -s -f "sfcc-ci/$FILE_NAME"
node ./cli.js data:download -i $SRC_DOMAIN -p "impex/src/instance/sfcc-ci/$FILE_NAME.zip" -t "./webdav/$FILE_NAME.zip" -o 1

npx sfcc-ci auth:logout
