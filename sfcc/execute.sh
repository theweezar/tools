#!/usr/bin/env bash

print() {
    local message="$1"
    local max_length=50  # Max characters per line
    local border_char="="  # Border character
    local padding="  "     # Left and right padding

    # Split the message into lines of max_length
    local lines=()
    while [[ ${#message} -gt $max_length ]]; do
        lines+=("${message:0:$max_length}")
        message="${message:$max_length}"
    done
    lines+=("$message")  # Add the remaining part

    # Determine the longest line for the border
    local max_line_length=$((max_length + ${#padding} * 2))
    for line in "${lines[@]}"; do
        (( ${#line} + ${#padding} * 2 > max_line_length )) && max_line_length=$(( ${#line} + ${#padding} * 2 ))
    done

    # Generate border
    local border=$(printf "%${max_line_length}s" | tr ' ' "$border_char")

    # Print the message with the border
    echo -e "\n\033[1;34m$border\033[0m"
    for line in "${lines[@]}"; do
        printf "\033[1;32m%s%-*s%s\033[0m\n" "$padding" "$((max_line_length - ${#padding} * 2))" "$line" "$padding"
    done
    echo -e "\033[1;34m$border\033[0m\n"
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

node cli.js zip -m extract -p $local/$file_name.zip -r 1

node cli.js start -m development -p $local/$file_name

node cli.js zip -m compress -p $local/$file_name -r 1

print "Upload file $local/$file_name.zip to instance $target_ins"

npx sfcc-ci data:upload -i $target_ins -t $impex_base -f $local/$file_name.zip

print "Import $local/$file_name.zip to instance $target_ins"

npx sfcc-ci instance:import $file_name.zip -i $target_ins -s

npx sfcc-ci auth:logout
