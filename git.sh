#!/bin/bash

git pull gitlab master:master
git push origin master:master


idcs=(idc50 idc51 idc52)

for idc in "${idcs[@]}"
do
ssh "$idc" << EOF
    cd ScriptStore
    git pull
    npm install
EOF
done