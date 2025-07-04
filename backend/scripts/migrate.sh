#!/bin/bash

# Exit on error
set -e

echo "⏳ Waiting for the database to be ready..."

# Retry logic: try to connect every 2s, max 30s
RETRIES=15
until alembic upgrade head; do
  echo "❌ DB not ready yet. Retrying in 2s..."
  sleep 2
  ((RETRIES--))
  if [ $RETRIES -le 0 ]; then
    echo "💥 Failed to connect to DB after retries. Exiting."
    exit 1
  fi
done

echo "✅ Alembic migration completed!"