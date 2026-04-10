# SuperFreight Deployment Plan

Generated: 2026-04-10

## Goal

Deploy the current SuperFreight stack to your company's in-house Dockploy
server using the same pattern as your other internal apps:

- separate `frontend-next` service
- separate `backend-nest` service
- separate PostgreSQL service

## Current Deployment Shape

The repo is now aligned to that structure:

- `frontend-next` is a standalone Next.js 16 app with a Dockerfile
- `backend-nest` is a NestJS 11 API with a Dockerfile
- the backend exposes `GET /api/health`
- the backend already supports two PostgreSQL databases:
  - app DB: `superfreight_app`
  - business DB: `logistics_business_core`

Important external dependency:

- OS auth/backend service via `OS_BACKEND_URL`

## What Is Already Deployment-Ready

### Frontend

Current frontend deployment state:

- `frontend-next/next.config.ts` now uses `BACKEND_API_ORIGIN`
- `frontend-next` builds in `standalone` mode
- `frontend-next/Dockerfile` is set up for a production image
- `frontend-next/.env.example` exists for tracked env documentation

Important Dockploy note:

- `NEXT_PUBLIC_*` vars and `BACKEND_API_ORIGIN` must be present as Docker
  build args, because Next.js bakes them into the built artifact

### Backend

Current backend deployment state:

- `backend-nest/Dockerfile` builds a production image
- backend startup runs migrations and then starts the API
- backend health endpoint exists at `/api/health`
- backend now binds cleanly for containers with `HOST=0.0.0.0`

### Data Parity

Synthetic seaport and service-location cleanup is now deployment-safe.

That parity is carried by:

- `backend-nest/src/database/migrations/business/2026041009000-BusinessSyntheticLocationReconciliation.ts`

Deployment implication:

- fresh deployed environments will replay that cleanup through business
  migrations
- this is no longer a local-only DB fix

## What Still Needs Attention

### Remaining deployment-parity gap

These fixes are still script-based rather than migration-based:

- curated port alias fixes
- curated seaport master fixes

Deployment implication:

- deploying code alone will not guarantee those business-data fixes exist in a
  fresh environment unless we also run their scripts or convert them into
  migrations

### External integration readiness

Production still needs confirmed values for:

- `OS_BACKEND_URL`
- `INTERNAL_API_KEY`
- Azure/Microsoft app registration
- redirect URIs for frontend and backend onboarding/auth flows

### Real Dockploy rollout inputs

We still need the actual production values for:

- frontend domain
- backend domain
- DB hostnames / credentials
- production secrets

## Recommended Dockploy Topology

Use the same internal pattern as your other apps:

### 1. PostgreSQL service

Recommended:

- one PostgreSQL service
- two databases inside it:
  - `superfreight_app`
  - `logistics_business_core`

### 2. Backend service

Deploy from:

- `backend-nest/Dockerfile`

Service characteristics:

- port `8000`
- health check `GET /api/health`
- startup command runs app and business migrations automatically

### 3. Frontend service

Deploy from:

- `frontend-next/Dockerfile`

Service characteristics:

- port `3000`
- standalone Next.js runtime
- `/api` rewrites route to the backend via `BACKEND_API_ORIGIN`

## Environment Model

### Frontend build args and env vars

These should be set in Dockploy as both build args and runtime env vars:

- `NEXT_PUBLIC_MICROSOFT_CLIENT_ID`
- `NEXT_PUBLIC_MICROSOFT_TENANT_ID`
- `NEXT_PUBLIC_REDIRECT_URI`
- `BACKEND_API_ORIGIN`

### Backend env vars

Use `backend-nest/.env.example` as the source of truth.

Minimum production set:

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

## Recommended Domains

Suggested shape:

- frontend: `https://app.superfreight.yourdomain.com`
- backend: `https://api.superfreight.yourdomain.com`

Then set:

- frontend `BACKEND_API_ORIGIN=https://api.superfreight.yourdomain.com`
- backend `FRONTEND_URL=https://app.superfreight.yourdomain.com`

## Verified Readiness Checks

Verified locally:

- `backend-nest`: `npm run build`
- `frontend-next`: `npm run build`

Artifact checks confirmed:

- frontend standalone output includes `server.js`
- backend compiled output includes `dist/scripts/migrations.js`
- backend compiled entrypoint is `dist/src/main.js`

Local limitation:

- Docker is not installed in this workstation session, so I could not run
  `docker build` to validate the images end to end here

## Rollout Order

### Phase 1. Prepare Dockploy configuration

1. Create PostgreSQL service
2. Create `superfreight_app`
3. Create `logistics_business_core`
4. Create backend service from `backend-nest/Dockerfile`
5. Create frontend service from `frontend-next/Dockerfile`

### Phase 2. Configure secrets and domains

1. Set backend env vars
2. Set frontend build args
3. Set frontend runtime env vars
4. Point domains to the two services
5. Update Azure redirect URIs
6. Confirm OS backend connectivity from the private server

### Phase 3. Deploy backend first

1. Build and deploy backend
2. Let startup migrations run
3. Verify `GET /api/health`
4. Verify auth endpoints respond

### Phase 4. Deploy frontend

1. Build and deploy frontend with production build args
2. Confirm the app loads
3. Confirm `/api` calls reach the backend
4. Test Microsoft login
5. Test a protected page

### Phase 5. Post-deploy parity checks

1. Confirm synthetic reconciliation migration is present in the business DB
2. Decide whether to run curated alias/master-fix scripts in production now
3. Smoke test vendor/port admin flows

## Highest-Risk Items

- frontend built with wrong `NEXT_PUBLIC_*` or `BACKEND_API_ORIGIN` values
- OS backend not reachable from the Dockploy server
- Azure redirect URIs not updated to the production frontend URL
- curated alias/master fixes still living outside migrations
- DB credentials or DB names mismatched between app and business connections

## Immediate Next Step

The best next step is to create the three Dockploy services and prepare the
real production env/build-arg values. Once those are available, we can deploy
the current version in the same frontend/backend/db split your team already
uses for other internal websites.
