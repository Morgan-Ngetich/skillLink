# Frontend

Built with **React + Vite + TypeScript + Chakra UI + TanStack (Query, Router, Start)**.

---

## Project Structure

```
frontend/
├── src/           — Application source code
├── docker/        — NGINX and startup configs
│   ├── nginx.prod.conf
│   ├── nginx.local.conf
│   └── start-ssl.sh
├── Dockerfile
├── .env.example
└── package.json
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 22+ |
| npm | 9+ |
| Docker | 20+ (for containerized setup) |

---

## Quickstart (Docker)

This is the recommended way to run the frontend alongside the full stack.

```bash
# From the project root
docker compose build
docker compose up -d
```

| URL | Description |
|-----|-------------|
| http://localhost | Application (HTTP) |
| https://localhost | Application (HTTPS) |
| http://localhost/docs | Swagger API Docs |

> **Note:** The Docker setup uses a self-signed SSL certificate for local HTTPS. Your browser may show a security warning — this is expected in development.

---

## Local Development (Hot Reload)

For frontend development with instant hot reload, run the dev server locally while keeping the backend running in Docker.

```bash
# 1. Ensure the backend is running
docker compose up -d

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# 4. Start the dev server
npm run dev
```

- Access the app at **http://localhost:5174**
- Access the app's openAPI docs at **http://localhost:5174/api/v1/docs**

---

## Environment Variables

```bash
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=/api/v1
```

> Never commit your `.env` file. It is already in `.gitignore`.

To get the required Supabase credentials, contact the maintainer or check the shared project settings.

---

## Common Docker Commands

| Command | Description |
|---------|-------------|
| `docker compose up -d` | Start all services in the background |
| `docker compose build` | Rebuild containers after Dockerfile changes |
| `docker compose restart` | Restart containers |
| `docker compose logs -f` | Stream container logs |
| `docker compose down -v` | Stop and remove containers |

---

## Notes

- This app uses **Supabase** for authentication. Ensure your Supabase project has email/password auth enabled.
- The backend must be running for API calls to work. Start it with `docker compose up -d` before running the frontend locally.
- NGINX is used as a reverse proxy in both local and production Docker builds.

---

## License

[MIT](https://github.com/Morgan-Ngetich/skillLink/blob/main/LICENSE)
