#!/bin/bash

git pull gitlab master:master
git push origin


idcs=(idc50 idc51 idc52)

for idc in "${idcs[@]}"
do
ssh "$idc" << EOF
    cd ScriptStore
    git pull
    kill $(ps aux | grep 'node bin/www' | awk '{print $2}')
    sh run.sh &
EOF
done