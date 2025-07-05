#!/bin/bash
set -e

echo "⏳ Waiting for DB..."
python app/utils/init.py

echo "🛠️ Running migrations..."
alembic upgrade head

echo "🌱 Seeding admin data..."
python app/utils/initial_data.py

echo "🚀 Starting FastAPI on port ${PORT:-8000}"
echo "Listing processes before Uvicorn"
ps aux
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
