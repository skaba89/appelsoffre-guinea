#!/bin/bash
cd /home/z/my-project
while true; do
  if ! pgrep -f "next-server" > /dev/null 2>&1; then
    echo "[$(date)] Server not found, starting..." >> /home/z/my-project/server-watchdog.log
    PORT=3000 HOSTNAME=0.0.0.0 NODE_ENV=production node .next/standalone/server.js >> /home/z/my-project/prod.log 2>&1 &
    sleep 5
  fi
  sleep 10
done
