#!/bin/bash

# Exit on error
set -e

echo "📦 Running Alembic migrations..."
alembic upgrade head