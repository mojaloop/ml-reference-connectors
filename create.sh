#!/bin/bash

# Usage: ./create.sh -c country_code -n connector_name

while getopts c:n: flag
do
    case "${flag}" in
        c) country_code=${OPTARG};;
        n) connector_name=${OPTARG};;
    esac
done

# Validate inputs
if [ -z "$country_code" ] || [ -z "$connector_name" ]; then
    echo "Usage: ./create.sh -c country_code -n connector_name"
    exit 1
fi

# Define the new directory name
new_dir="${connector_name}-${country_code}-core-connector"

# Copy the template and rename
cp -r core-connector-template "$new_dir"

git checkout -b "ft/$new_dir"

echo "Core connector created: $new_dir"
