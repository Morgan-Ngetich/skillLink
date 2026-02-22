# Backend

Built with **FastAPI + PostgreSQL + RabbitMQ + Celery + Redis**, fully containerized with Docker.

---

## Project Structure

```
backend/
├── app/
│   ├── api/           — Route handlers
│   ├── models/        — SQLAlchemy models
│   ├── schemas/       — Pydantic schemas
│   ├── services/      — Business logic
│   └── main.py        — FastAPI entrypoint
├── alembic/           — Database migrations
├── alembic.ini
├── pyproject.toml     — Poetry dependency management
├── Dockerfile
└── .env.example
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Docker | 20+ |
| Docker Compose | 2+ |
| Poetry | 1.8+ (for local dependency management only) |

---

## Quickstart

All backend services — FastAPI, PostgreSQL, RabbitMQ, Redis, and Celery — are fully containerized. Everything starts with a single command from the project root:

```bash
docker compose build
docker compose up -d
```

| Service | URL |
|---------|-----|
| API | http://localhost/api/v1 |
| Swagger Docs | http://localhost/docs |
| RabbitMQ Management | http://localhost:15672 |

---

## Database

### Access the database

```bash
docker exec -it db sh
psql -U postgres -d railway
```

### Run migrations

Exec into the backend container first:

```bash
docker exec -it backend sh
```

Then inside the container:

```bash
# Generate a new migration after model changes
alembic revision --autogenerate -m "your message here"

# Apply migrations
alembic upgrade head
```

> Always run `alembic upgrade head` after pulling new changes that include model updates.

---

## Dependency Management (Poetry)

Dependencies are managed with **Poetry**. Never manually edit `pyproject.toml` or install packages with `pip`.

### Adding a new dependency

```bash
# 1. Navigate to the backend directory
cd skillLink/backend

# 2. Activate the Poetry virtual environment
poetry shell

# 3. Add the dependency
poetry add package-name

# 4. Restart the backend container to apply changes
docker compose restart backend
```

> After adding a dependency, the `pyproject.toml` and `poetry.lock` files will be updated. Commit both files.

---

## Common Docker Commands

| Command | Description |
|---------|-------------|
| `docker compose up -d` | Start all services in the background |
| `docker compose build` | Rebuild containers after Dockerfile changes |
| `docker compose restart backend` | Restart the backend container |
| `docker compose logs -f backend` | Stream backend logs |
| `docker compose down` | Stop and remove all containers |
| `docker exec -it backend sh` | Shell into the backend container |
| `docker exec -it db sh` | Shell into the database container |

---

## Environment Variables

```bash
DATABASE_URL=postgresql://postgres:password@db:5432/railway
SUPABASE_URL=your-project-url.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/
REDIS_URL=redis://redis:6379
SECRET_KEY=your-secret-key
```

> Never commit your `.env` file. Copy from `.env.example` and fill in your values.

---

## Notes

- All migrations must be run manually inside the backend container — they are not applied automatically on startup.
- When adding dependencies, always use Poetry. Direct `pip install` will not persist inside the container.
- The Celery worker runs as a separate container and picks up tasks via RabbitMQ automatically on startup.

---

## License

[MIT](https://github.com/Morgan-Ngetich/skillLink/blob/main/LICENSE)
