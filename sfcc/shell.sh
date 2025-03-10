#!/usr/bin/env bash

npx sfcc-ci auth:login "<client ID>"
npx sfcc-ci instance:export -i "<instance domain>" -d "./config/data_units.json" -s -f "ci-cd/sfcc-ci-site"
npx sfcc-ci auth:logout