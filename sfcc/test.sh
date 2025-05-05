#!/usr/bin/env bash

src_instance="development-asia-samsonite.demandware.net"

impex_base="impex/src/instance"

file_name="20250505_SE20-594_configs.zip"

npx sfcc-ci auth:login

node ./cli.js data:delete -i $src_instance -p $impex_base/sfcc-ci -f $file_name

npx sfcc-ci auth:logout
