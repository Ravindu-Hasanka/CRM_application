# CRM Frontend (React + Vite + TypeScript)

Frontend application for the multi-tenant CRM technical exam.

## Tech stack
- React 19
- TypeScript
- Vite
- React Router
- React Icons

## Core features
- Public pages:
  - Landing
  - Login
  - Subscription selection
  - Organization registration
- Authenticated app:
  - Dashboard
  - Companies list/create/edit/detail
  - Nested contacts on company detail
  - Activity logs
  - Profile
  - Team members management
- JWT auth integration with automatic access token refresh
- Role-based protected routes
- Loading states and toast notifications
- Pagination/search/filter UI integration
- Organization and company logo upload + preview

## Environment setup
1. Create env file from sample:
```bash
cp .env.example .env
```

2. Set backend API base URL:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

## Install and run
```bash
npm install
npm run dev
```

App URL: `http://127.0.0.1:5173`

## Build
```bash
npm run build
```

## Notes
- API client auto-appends trailing slashes to match Django behavior.
- If access token expires, client uses refresh token and retries once.
- If refresh fails, auth storage is cleared and user must log in again.
