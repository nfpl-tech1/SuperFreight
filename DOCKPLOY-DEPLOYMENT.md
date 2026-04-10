# SuperFreight Dockploy Deployment

This project is ready to be deployed in the same pattern as your other
in-house apps:

- separate `frontend-next` service
- separate `backend-nest` service
- separate PostgreSQL service

## Service Layout

### 1. Database

Provision one PostgreSQL service in Dockploy.

You can use either:

- one PostgreSQL instance with two databases:
  - `superfreight_app`
  - `logistics_business_core`
- or two separate PostgreSQL services if that matches your current internal pattern

Recommended for simplicity:

- one PostgreSQL service
- two databases inside it

### 2. Backend

Deploy `backend-nest` as a Dockerfile-based service using:

- `backend-nest/Dockerfile`

Exposed port:

- `8000`

Health check:

- `GET /api/health`

Startup behavior:

- runs app and business migrations automatically
- then starts the Nest API

Production start command inside the container:

- `node dist/scripts/migrations.js run all && node dist/src/main.js`

### 3. Frontend

Deploy `frontend-next` as a Dockerfile-based service using:

- `frontend-next/Dockerfile`

Exposed port:

- `3000`

The frontend is built in standalone mode and proxies `/api` to the backend
through `BACKEND_API_ORIGIN`.

For Dockploy, treat the frontend variables as build-time inputs too:

- `NEXT_PUBLIC_*` values are compiled into the Next.js bundle
- `BACKEND_API_ORIGIN` is used while building the Next.js rewrite config
- set them as Docker build args and keep the same values as runtime env vars

## Required Environment Variables

### Frontend service

Set these as both Docker build args and runtime env vars:

- `NEXT_PUBLIC_MICROSOFT_CLIENT_ID`
- `NEXT_PUBLIC_MICROSOFT_TENANT_ID`
- `NEXT_PUBLIC_REDIRECT_URI`
- `BACKEND_API_ORIGIN`

Typical production example:

```env
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your_azure_client_id
NEXT_PUBLIC_MICROSOFT_TENANT_ID=your_azure_tenant_id
NEXT_PUBLIC_REDIRECT_URI=https://app.superfreight.yourdomain.com
BACKEND_API_ORIGIN=https://api.superfreight.yourdomain.com
```

### Backend service

Use `backend-nest/.env.example` as the base reference.

Minimum production variables:

- `PORT=8000`
- `HOST=0.0.0.0`
- `NODE_ENV=production`
- `APP_DB_HOST`
- `APP_DB_PORT`
- `APP_DB_USERNAME`
- `APP_DB_PASSWORD`
- `APP_DB_NAME`
- `BUSINESS_DB_HOST`
- `BUSINESS_DB_PORT`
- `BUSINESS_DB_USERNAME`
- `BUSINESS_DB_PASSWORD`
- `BUSINESS_DB_NAME`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `OS_APP_SLUG`
- `OS_BACKEND_URL`
- `INTERNAL_API_KEY`
- `MICROSOFT_CLIENT_ID`
- `MICROSOFT_TENANT_ID`
- `MICROSOFT_CLIENT_SECRET`
- `MICROSOFT_REDIRECT_URI`
- `FRONTEND_URL`

Typical production example:

```env
PORT=8000
HOST=0.0.0.0
NODE_ENV=production

APP_DB_HOST=postgres.internal
APP_DB_PORT=5432
APP_DB_USERNAME=postgres
APP_DB_PASSWORD=change_me
APP_DB_NAME=superfreight_app
APP_DB_MIGRATIONS_RUN=false

BUSINESS_DB_HOST=postgres.internal
BUSINESS_DB_PORT=5432
BUSINESS_DB_USERNAME=postgres
BUSINESS_DB_PASSWORD=change_me
BUSINESS_DB_NAME=logistics_business_core
BUSINESS_DB_MIGRATIONS_RUN=false

JWT_SECRET=replace_with_long_random_secret
JWT_EXPIRES_IN=30m

OS_APP_SLUG=super-freight
OS_BACKEND_URL=https://os.yourdomain.com
INTERNAL_API_KEY=shared_internal_key
OS_JWT_PUBLIC_KEY=

MICROSOFT_CLIENT_ID=your_azure_client_id
MICROSOFT_TENANT_ID=your_azure_tenant_id
MICROSOFT_CLIENT_SECRET=your_azure_client_secret
MICROSOFT_REDIRECT_URI=https://app.superfreight.yourdomain.com/onboarding
MICROSOFT_WEBHOOK_URL=

GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-pro

FRONTEND_URL=https://app.superfreight.yourdomain.com
```

## Domains / Routing

Recommended internal production shape:

- frontend: `https://app.superfreight.yourdomain.com`
- backend: `https://api.superfreight.yourdomain.com`

The frontend should point `BACKEND_API_ORIGIN` at the backend public origin:

- `https://api.superfreight.yourdomain.com`

The backend should set:

- `FRONTEND_URL=https://app.superfreight.yourdomain.com`

## Deployment Order

1. Provision PostgreSQL and create the two databases.
2. Deploy backend with all required env vars.
3. Confirm backend health:
   - `GET /api/health`
4. Deploy frontend with matching build args and runtime env vars.
5. Test login and protected app pages.

## First Smoke Tests

After deploy, verify:

### Backend

- `GET /api/health` returns `ok` or `degraded` with DB details
- migrations completed on startup
- `/api/auth/*` routes respond

### Frontend

- app loads
- login page loads
- `/api` requests resolve through the rewrite
- protected pages render after login

## Notes

- Synthetic port and service-location reconciliation is already encoded in business migrations, so backend startup migration runs will carry that cleanup into deployed environments.
- Curated alias and seaport master fixes are still script-based today, so if we want fully automatic parity for every local business-data correction, those should be promoted into migrations next.
- Rebuild the frontend image whenever any `NEXT_PUBLIC_*` value or `BACKEND_API_ORIGIN` changes, because those values become part of the built artifact.
