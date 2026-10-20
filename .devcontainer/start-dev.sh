#!/bin/bash

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=== start-dev.sh $(date) ===" > /tmp/start-dev.log

# FastAPI
cd "$PROJECT_ROOT/backend" || exit 1

echo "Python: $(which python)" >> /tmp/start-dev.log
echo "Starting FastAPI..." >> /tmp/start-dev.log

setsid -f bash -c "
  cd '$PROJECT_ROOT/backend'
  exec python -m uvicorn main:app \
    --reload \
    --host 0.0.0.0 \
    --port 8000
" </dev/null > /tmp/backend.log 2>&1

# Vite
cd "$PROJECT_ROOT/frontend" || exit 1

echo "Node: $(which node)" >> /tmp/start-dev.log
echo "NPM: $(which npm)" >> /tmp/start-dev.log
echo "Starting Vite..." >> /tmp/start-dev.log

setsid -f bash -c "
  cd '$PROJECT_ROOT/frontend'
  exec npm run dev -- --host 0.0.0.0
" </dev/null > /tmp/frontend.log 2>&1

echo "=== start-dev.sh finished ===" >> /tmp/start-dev.log
