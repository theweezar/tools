#!/usr/bin/env bash

datetime=$(date +"%Y%m%d%H%M%S")
filename="/d/anime.zip"
filename_datetime="/d/${datetime}_anime.zip"

cd ~/OneDrive/Pictures/
rar a -r "$filename" ./anime
