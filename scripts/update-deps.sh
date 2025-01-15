#!/bin/bash

for dir in */; do
    if [[ $dir == *-core-connector/ ]]; then
    cd $dir 
        npm run dep:update
    cd -
    fi
done