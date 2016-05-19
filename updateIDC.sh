#!/bin/bash

idcs=(idc50 idc51 idc52)

for idc in "${idcs[@]}"
do
ssh "$idc" << EOF
    cd ScriptStore
    git pull
EOF
done