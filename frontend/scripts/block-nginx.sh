#!/bin/bash
# Prevent committing nginx.conf from frontend directory

if git diff --cached --name-only | grep -q "^frontend/nginx.conf$"; then
  echo "🚫 Commit rejected: frontend/nginx.conf should not be committed."
  exit 1
fi
