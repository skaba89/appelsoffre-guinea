#!/bin/bash
cd /home/z/my-project
PORT=3000 HOSTNAME=0.0.0.0 NODE_ENV=production node .next/standalone/server.js
