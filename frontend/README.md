# Frontend
**React + Vite + TypeScript + Chakra UI**.

---

## Getting Started 
- Access the app at: **http://localhost** 
- Access the Swagger Docs at **http://localhost/docs** or **http://localhost:5173/docs**

### Prerequisites
- Node.js 18+
- npm 9+
- Docker 20+ (optional)

### 1. Clone the repo

```bash
git clone git@github.com:Morgan-Ngetich/skillLink.git
cd mentaspace/frontend
```

### 2.  Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the example file and update with your credentials:
```bash
cp .env.example .env
```
Required Environment Variables
```bash
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=/api/v1
```

### 4. Docker Development
```bash
docker compose build
docker compose up -d
```
Access the app at: **http://localhost**

Common Docker Commands
Command	Description
- `docker compose logs -f`	View container logs
- `docker compose down` containers
- `docker compose restart`	Hot-reload containers


### 5. Development Workflow
Local Development (without Docker)
```bash
npm run dev
```

### 💡 Notes
- Never commit your `.env` file.
- This app uses Supabase for authentication and backend services.
- Ensure your Supabase project has email/password auth enabled.


### License [MIT]
- [https://github.com/Morgan-Ngetich/skillLink/blob/main/LICENSE](https://github.com/Morgan-Ngetich/killLink/blob/main/LICENSE)
