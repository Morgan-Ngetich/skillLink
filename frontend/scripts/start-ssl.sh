#!/bin/sh

# Check if we're in production (Railway) or development
if [ -n "$RAILWAY_ENVIRONMENT" ]; then
  echo "🚀 Running in production environment. Using nginx.prod.conf"
  cp /etc/nginx/nginx.prod.conf /etc/nginx/nginx.conf
else
  echo "💻 Running in local development environment. Using nginx.local.conf"
  cp /etc/nginx/nginx.local.conf /etc/nginx/nginx.conf
fi

# Start Node.js SSR server in BOTH environments
echo "Starting Node.js SSR server on port 8080..."
cd /app
node scripts/server.js &

# Wait for Node.js to start
sleep 3

# Check if Node.js is running
if curl -f http://localhost:8080/health >/dev/null 2>&1; then
    echo "✅ Node.js SSR server is healthy"
else
    echo "⚠️  Warning: Node.js SSR server may not be responding"
    # Continue anyway - nginx will try to proxy
fi

echo "📋 Validating nginx configuration..."
nginx -t

echo "🚀 Starting nginx..."
exec nginx -g "daemon off;"