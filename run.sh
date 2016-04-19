#!/bin/bash

PORT=3000 nohup node bin/www > logs/N3000.log &
PORT=3001 nohup node bin/www > logs/N3001.log &
