#!/bin/sh
echo "--- ENTRYPOINT STARTUP ---"
env | grep BACKEND_HOST || echo "No BACKEND_HOST in env"

if [ -z "$BACKEND_HOST" ]; then
  echo "ERROR: BACKEND_HOST is not set"
  exit 1
fi

# ✅ Correct use of single quotes with envsubst
envsubst '${BACKEND_HOST}' < /etc/nginx/nginx.template.conf > /etc/nginx/nginx.conf

echo "===== Generated nginx.conf ====="
cat /etc/nginx/nginx.conf
echo "==============================="

# ✅ Explicit config path, and daemon stays in foreground
nginx -c /etc/nginx/nginx.conf -g 'daemon off;'
