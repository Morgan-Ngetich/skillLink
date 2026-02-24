# MENTspace

A full-stack mentor–mentee matching platform built with microservices architecture.

---

## Project Structure

```
skillLink/
├── frontend/   — React Vite app (TypeScript, TanStack, Chakra UI)
└── backend/    — FastAPI app (PostgreSQL, RabbitMQ, Celery, Docker)
```

- `frontend/` — [Frontend README](./frontend/README.md)
- `backend/` — [Backend README](./backend/README.md)

---

## Quickstart

### Prerequisites
- [Docker](https://www.docker.com/) and Docker Compose installed

### Run the full stack

```bash
# 1. Clone the repo
git clone git@github.com:Morgan-Ngetich/skillLink.git
cd skillLink

# 2. Copy environment files (credentials shared separately)
cp .env.example .env

# 3. Build and start all services
docker compose build
docker compose up -d
```

The application will be available at **http://localhost**.

> **Note:** You will need Supabase credentials to run the app. Contact the maintainer to get the required `.env` values.

---

## Development

For local frontend development with hot reload, see the [Frontend README](./frontend/README.md).

For backend development including migrations and dependency management, see the [Backend README](./backend/README.md).

---

## License

[MIT](https://github.com/Morgan-Ngetich/skillLink/blob/main/LICENSE)
