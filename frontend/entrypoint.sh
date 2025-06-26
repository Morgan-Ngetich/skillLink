#!/bin/sh

if [ -z "$BACKEND_HOST" ]; then
  echo "ERROR: BACKEND_HOST is not set"
  exit 1
fi

envsubst '$BACKEND_HOST' < /etc/nginx/nginx.template.conf > /etc/nginx/nginx.conf

echo "===== Generated nginx.conf ====="
cat /etc/nginx/nginx.conf
echo "==============================="

nginx -g 'daemon off;'
