#!/bin/sh
set -e

# Check if we're in production (Railway) or development
if [ -n "$RAILWAY_ENVIRONMENT" ]; then
  echo "🚀 Running in production environment. Using nginx.prod.conf"
  cp /etc/nginx/nginx.prod.conf /etc/nginx/nginx.conf
  PORT=8080  # Production port
  
  # In production, run the built app
  echo "🚀 Starting production server..."
  cd /app
  node .output/server/index.mjs &
else
  echo "💻 Running in local development environment. Using nginx.local.conf"
  cp /etc/nginx/nginx.local.conf /etc/nginx/nginx.conf
  PORT=3000  # Development port
  
  # In development, run dev server
  echo "🚀 Starting TanStack Start dev server..."
  cd /app
  npm run dev &
fi

# Wait for server to be ready
echo "⏳ Waiting for server on port $PORT..."
max_attempts=60
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if wget -q --spider http://localhost:$PORT 2>/dev/null; then
        echo "✅ Server is ready on port $PORT!"
        break
    fi
    
    attempt=$((attempt + 1))
    if [ $attempt -eq $max_attempts ]; then
        echo "❌ Server failed to start after $max_attempts seconds"
        echo "📋 Checking running processes..."
        ps aux
        exit 1
    fi
    
    echo "Attempt $attempt/$max_attempts..."
    sleep 1
done

echo "📋 Validating nginx configuration..."
nginx -t

echo "🚀 Starting nginx..."
exec nginx -g "daemon off;"