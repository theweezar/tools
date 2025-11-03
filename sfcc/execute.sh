#!/usr/bin/env bash

print() {
    echo -e "\n\033[1;32m$$1\033[0m"
}

src_instance="development-asia-samsonite.demandware.net"

impex_base="impex/src/instance"

file_name="20250620_dev_ss-catalogs"

local_folder="./webdav"

# target_instance="***"

npx sfcc-ci auth:login

print "Exporting data to file $impex_base/sfcc-ci/$file_name.zip"

node ./cli.js data:delete -i $src_instance -p $impex_base/sfcc-ci -f $file_name.zip

npx sfcc-ci instance:export -i $src_instance -d ./config/data_units.json -s -f sfcc-ci/$file_name

node ./cli.js data:download -i $src_instance -p $impex_base/sfcc-ci/$file_name.zip -t $local_folder/$file_name.zip -o 1

# has_file=$(ls $local_folder | grep $file_name)

# if [ -z "${has_file}" ]; then
#     print "File $local_folder/$file_name.zip does not exist"
#     print "Exit shell"
#     exit 1
# fi

# node cli.js zip -m extract -p $local_folder/$file_name.zip -r 1

# node cli.js start -m development -p $local_folder/$file_name

# node cli.js zip -m compress -p $local_folder/$file_name -r 1

# print "Upload file $local_folder/$file_name.zip to instance $target_instance"

# npx sfcc-ci data:upload -i $target_instance -t $impex_base -f $local_folder/$file_name.zip

# print "Import $local_folder/$file_name.zip to instance $target_instance"

# npx sfcc-ci instance:import $file_name.zip -i $target_instance -s

npx sfcc-ci auth:logout
