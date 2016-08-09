#!/bin/bash

idcs=(idc50 idc51 idc52)

for idc in "${idcs[@]}"
do
ssh "$idc" << EOF
    cd ScriptStore
    kill $(ps aux | grep 'node' | awk '{print $2}')
    sh run.sh &
EOF
done