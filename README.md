# CRM Application (Full Stack)

Multi-tenant CRM built with:
- Backend: Django + DRF + PostgreSQL
- Frontend: React + Vite + TypeScript
- Optional AWS S3 for media/logo storage

## Repository structure
- `backend/` Django REST API
- `frontend/` React web app
- `docker-compose.yml` Full stack local orchestration

## Quick start with Docker Compose
From repository root:

```bash
docker compose up --build
```

Services:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

To stop:

```bash
docker compose down
```

To remove volumes too:

```bash
docker compose down -v
```

## Important fallback note
If Docker Compose fails due to local Docker/network/credentials/platform issues, run each app separately:

1. Go to `backend/` and follow [backend README](/c:/Users/U%20S%20E%20R/Downloads/CRM%20Applicaton/backend/README.md)
2. Go to `frontend/` and follow [frontend README](/c:/Users/U%20S%20E%20R/Downloads/CRM%20Applicaton/frontend/README.md)

Those READMEs contain direct run instructions and environment setup for each service.

## Environment files
- Backend sample: `backend/.env.example`
- Frontend sample: `frontend/.env.example`

Create actual env files:
- `backend/.env`
- `frontend/.env`



