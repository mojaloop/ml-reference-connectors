#!/bin/bash

for dir in */; do
    if [[ $dir == *-core-connector/ ]]; then
    cd $dir 
        npm i
    cd -
    fi
done