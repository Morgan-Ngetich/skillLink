#!/bin/bash
set -e

echo "ENTRYPOINT script received arguments: $@"

case "$1" in
  "celery_worker")
    echo "🐇 Starting Celery worker..."
    shift
    exec celery -A app.core.celery worker --loglevel=info "$@"
    ;;
  "celery_beat")
    echo "⏰ Starting Celery Beat..."
    shift
    exec celery -A app.core.celery beat --loglevel=info "$@"
    ;;
  "fastapi" | "")
    echo "⏳ Waiting for DB..."
    python app/utils/init.py

    echo "🛠️ Running migrations..."
    alembic upgrade head

    echo "🌱 Seeding admin data..."
    python app/utils/initial_data.py

    echo "🚀 Starting FastAPI on port ${PORT:-8000}"
    exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
    ;;
  *)
    echo "Unknown startup command: $1"
    exec "$@"
    ;;
esac
