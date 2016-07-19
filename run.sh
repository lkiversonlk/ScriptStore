#!/bin/bash

NODE_ENV=production PORT=3000 nohup node bin/www &
NODE_ENV=proudction PORT=3001 nohup node bin/www &
