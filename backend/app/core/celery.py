from celery import Celery
from app.core.config import settings

celery_user = settings.RABBITMQ_DEFAULT_USER
celery_password = settings.RABBITMQ_DEFAULT_PASS
celery_port = settings.RABBITMQ_PORT
celery_host = settings.RABBITMQ_HOST

celery_broker_url = f"amqp://{celery_user}:{celery_password}@{celery_host}:{celery_port}/"
celery_backend_url = "rpc://"

celery_app = Celery(
    settings.PROJECT_NAME,
    broker=celery_broker_url,
    backend=celery_backend_url,
)

celery_app.conf.update(
    timezone=settings.TIMEZONE,
    enable_utc=True,
    broker_connection_retry_on_startup=True,
    task_track_started=True,
    task_time_limit=300,
    task_soft_time_limit=240, # Catch SoftTimeLimitExceeded exception in your task fro best practice
    task_acks_late=True,
    result_serializer="json",
    task_serializer="json",
    accept_content=["json"],
    worker_concurrency=4, # Remove this if the app gets bigger. It would defaukt the user sysytem CPU's cores
    worker_max_tasks_per_child=100,
    task_default_queue="default",
    beat_schedule_filename="celerybeat-schedule.db",
    task_routes={
        "app.tasks.*": {"queue": "default"},
        "app.tasks.long_running": {"queue": "long_running"},
        "app.tasks.email": {"queue": "email"},
        "app.tasks.sync_user_from_supabase_task": {"queue": "sync"},
        # LLM-related routes
        "app.tasks.process_goal_completion": {"queue":"llm"},
        "app.tasks.process_llm_generation": {"queue": "llm"},
        "app.tasks.process_progressive_update": {"queue": "default"},
    },
    task_annotations={
        "app.tasks.long_running": {"rate_limit": "10/m"},
        "app.tasks.email": {"rate_limit": "20/m"},
        "app.tasks.sync_user_from_supabase_task": {"rate_limit": "5/m"},
        # LLM-related annotations
        "app.tasks.process_goal_completion": {
            "rate_limit": "5/m",
            "acks_late": True,
            "time_limit": 300,
            "soft_time_limit": 240
        },        
        "app.tasks.process_llm_generation": {
            "rate_limit": "5/m",
            "acks_late": True,
            "time_limit": 300,
            "soft_time_limit": 240
        },
        "app.tasks.process_progressive_update": {
            "rate_limit": "30/m"
        }
    },
    worker_log_format="[%(asctime)s: %(levelname)s/%(processName)s] %(message)s",
    worker_task_log_format="[%(asctime)s: %(levelname)s/%(processName)s] [%(task_name)s:%(task_id)s] %(message)s",
)

celery_app.conf.beat_schedule = {
    "sync_users": {
        "task": "app.tasks.sync_user_from_supabase_task",
        "schedule": 60.0,
        "args": (),
    }
}


# rpc:// is a lightweight, real-time reply backend using RabbitMQ queues.
# It’s best for short-lived tasks and callbacks where you don’t need persistent result storage.
# For production systems with monitoring, long-running tasks, or retry logic, use redis:// or a database result backend instead


# # Force-load task modules so Celery registers them
# # manual import = manual registration
# import app.tasks.sync

celery_app.autodiscover_tasks(["app.tasks"])