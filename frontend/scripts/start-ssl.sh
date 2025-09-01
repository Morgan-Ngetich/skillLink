#!/bin/sh

# Start Node.js SSR server in background
echo "Starting Node.js SSR server on port 3000..."
cd /app
node scripts/server.js &

# Wait for Node.js to start
sleep 3

# Check if Node.js is running
if curl -f http://localhost:3000/health >/dev/null 2>&1; then
    echo "Node.js SSR server is healthy"
else
    echo "Warning: Node.js SSR server may not be responding"
    # Continue anyway - nginx will serve static files
fi

# Start nginx in foreground
echo "Starting nginx with SSL on port 80..."
nginx -g "daemon off;"