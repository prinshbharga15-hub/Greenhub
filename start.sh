#!/bin/bash
set -e

# Default PORT to 10000 if not set by Render
PORT=${PORT:-10000}
export PORT

# Replace ${PORT} placeholder in Nginx config
sed "s/\${PORT}/$PORT/g" /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Ensure required directories exist
mkdir -p /app/backend/uploads /app/backend/tmp/rate_limits

# Start Node.js Database Bridge in background
echo "Starting Node.js MongoDB Bridge..."
cd /app/backend && node db_bridge.js &

# Start PHP Built-in Server on port 8000 in background
echo "Starting PHP Backend Server on 127.0.0.1:8000..."
php -S 127.0.0.1:8000 -t /app/backend /app/backend/index.php &

# Start Nginx in foreground
echo "Starting Nginx Reverse Proxy on port $PORT..."
exec nginx -g "daemon off;"
