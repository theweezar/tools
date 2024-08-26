#!/bin/bash

for D in ./*
do
	if [ -d "$D" ]; then
		echo "$D"
		cd "$D"
		CURRENT_URL=`git remote get-url origin`
		NEW_URL=`echo $CURRENT_URL | sed 's/globee-hk/globee-software/'`
		git remote set-url origin `echo $NEW_URL`
		cd ..
		echo -e "-- done --\n\n"
	fi
done
