#!/bin/bash

../node/bin/npm install

NODE_ENV=production PORT=3000 nohup ../node/bin/node bin/www > /dev/null &
NODE_ENV=proudction PORT=3001 nohup ../node/bin/node bin/www > /dev/null &
