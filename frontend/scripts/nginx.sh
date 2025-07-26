#!/bin/sh

if [ -n "$RAILWAY_ENVIRONMENT" ]; then
  echo "Running in production environment. Using nginx.prod.conf"
  cp /etc/nginx/nginx.prod.conf /etc/nginx/nginx.conf
else
  echo "Running in local environment. Using nginx.local.conf"
  cp /etc/nginx/nginx.local.conf /etc/nginx/nginx.conf
fi

echo "Current nginx.conf:"
cat /etc/nginx/nginx.conf

exec nginx -g "daemon off;"
