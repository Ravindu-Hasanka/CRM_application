# CRM Backend (Django + DRF)

Multi-tenant CRM backend for the Associate Full Stack Developer technical exam.

## Tech stack
- Django 6
- Django REST Framework
- PostgreSQL
- drf-spectacular (Swagger/OpenAPI)
- django-cors-headers
- Optional AWS S3 storage (`django-storages`, `boto3`)

## Core features
- Multi-tenant data isolation by `organization` scope
- Custom user model with roles: `SystemAdmin`, `Admin`, `Manager`, `Staff`
- JWT authentication + refresh
- RBAC-enforced CRUD for Companies and Contacts
- Soft delete (`is_deleted`) for Companies and Contacts
- Activity logging for `CREATE`, `UPDATE`, `DELETE`
- API versioning under `/api/v1/`
- Organization and company logo upload

## Project structure
- `backend/` Django project settings and URLs
- `crm/` domain app (models, serializers, permissions, views, services)

## Environment setup
1. Copy env sample:
```bash
cp .env.example .env
```

2. Configure DB:
- Use `DATABASE_URL` **or** `POSTGRES_*` values

3. Optional S3 storage:
- Set `USE_S3=true`
- Configure AWS variables in `.env`

## Install and run
```bash
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## API docs
- Swagger UI: `http://127.0.0.1:8000/api/docs/swagger/`
- ReDoc: `http://127.0.0.1:8000/api/docs/redoc/`
- Schema: `http://127.0.0.1:8000/api/docs/schema/`

## Main endpoints
- Auth:
  - `POST /api/v1/auth/login/`
  - `POST /api/v1/auth/refresh/`
  - `GET /api/v1/auth/me/`
- Public org registration:
  - `POST /api/v1/auth/register-organization/`
- Users:
  - `POST /api/v1/users/`
  - `GET /api/v1/users/list/`
- Organization profile/logo:
  - `GET /api/v1/organization/me/`
  - `PATCH /api/v1/organization/me/` (multipart)
- Companies:
  - `GET|POST /api/v1/companies/`
  - `GET|PATCH|DELETE /api/v1/companies/{id}/`
- Contacts:
  - `GET|POST /api/v1/contacts/`
  - `GET|PATCH|DELETE /api/v1/contacts/{id}/`
- Activity logs:
  - `GET /api/v1/activity-logs/`
  - `GET /api/v1/activity-logs/{id}/`

## S3 notes
- If `USE_S3=true`, uploaded logos are stored in S3.
- For private bucket + signed URLs, set `AWS_QUERYSTRING_AUTH=true`.
- For public URLs, set `AWS_QUERYSTRING_AUTH=false` and bucket policy accordingly.


