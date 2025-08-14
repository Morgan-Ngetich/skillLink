#!/bin/bash
set -e

echo "ENTRYPOINT script received arguments: $@"

case "$1" in
  "celery_worker")
    echo "🐇 Starting Celery worker..."
    shift
    
    # Check for --llm flag
    if [[ "$1" == "--llm" ]]; then
      echo "🧠 Starting LLM-specific worker (concurrency: 2)"
      shift
      exec celery -A app.core.celery worker -Q llm --loglevel=info --concurrency=2 --hostname=llm_worker@%h "$@"
    else
      echo "🔄 Starting default worker (concurrency: 4)"
      exec celery -A app.core.celery worker -Q default --loglevel=info --concurrency=4 --hostname=default_worker@%h "$@"
    fi
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