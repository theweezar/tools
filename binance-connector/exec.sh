#!/usr/bin/env bash

node ./js/fetch.js -p "ignore" -s "BTCUSDT" -i "1m" -f 3 -D
python ./py/processor.py ./ignore
# python ./py/main.py ./ignore
python ./py/deep_learning_model.py ./ignore