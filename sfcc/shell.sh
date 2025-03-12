#!/usr/bin/env bash

print() {
    echo "⭐⭐⭐$1⭐⭐⭐"
}

src_ins="development-asia-samsonite.demandware.net"

impex_base="impex/src/instance"

file_name="site_MonoSamsoniteNZ"

local="./webdav"

target_ins="aawq-008.dx.commercecloud.salesforce.com"

npx sfcc-ci auth:login

print "Exporting data to file $impex_base/sfcc-ci/$file_name.zip"

npx sfcc-ci instance:export -i $src_ins -d ./config/data_units.json -s -f sfcc-ci/$file_name

node ./cli.js data:download -i $src_ins -p $impex_base/sfcc-ci/$file_name.zip -t $local/$file_name.zip -o 1

has_file=$(ls $local | grep $file_name)

if [ -z "${has_file}" ]; then
    print "File $local/$file_name.zip does not exist"
    print "Exit shell"
    exit 1
fi

print "Upload file $local/$file_name.zip to instance $target_ins"

npx sfcc-ci data:upload -i $target_ins -t $impex_base -f $local/$file_name.zip

print "Import $local/$file_name.zip to instance $target_ins"

npx sfcc-ci instance:import $file_name.zip -i $target_ins -s

npx sfcc-ci auth:logout
