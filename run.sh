#!/bin/bash

NODE_ENV=production PORT=3000 nohup node bin/www > logs/N3000.log &
NODE_ENV=proudction PORT=3001 nohup node bin/www > logs/N3001.log &
