#!/usr/bin/env bash

node ./js/fetch.js -p "ignore" -s "PEPE" -i "1m" -f 6 -D
python ./py/processor.py ./ignore
# python ./py/main.py ./ignore
python ./py/deep_learning_model.py ./ignore