#!/usr/bin/env bash

node ./js/fetch.js -p "ignore" -s "BTCUSDT" -i "5m" -f 3 -D
python ./py/main.py ./ignore