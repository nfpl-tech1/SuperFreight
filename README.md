# FreightShakti — Freight Pricing & RFQ Platform

Internal logistics pricing and RFQ management tool for **Nagarkot Forwarders Private Limited**.

Built with **NestJS** (backend) and **Next.js** (frontend), authenticated via **Microsoft Azure AD**.

---

## Project Structure

```
FreightShakti/
├── backend-nest/   NestJS API (port 8000)
├── frontend-next/  Next.js App Router UI (port 3000)
├── backend/        Legacy Python FastAPI (reference only, not used)
└── frontend/       Legacy React/Vite (reference only, not used)
```

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | 18 or 20 LTS |
| npm | 9+ |
| PostgreSQL | 14+ (running locally) |

---

## 1. Database Setup

1. Open pgAdmin (or psql) and create a database:
   ```sql
   CREATE DATABASE "FreightPriceEngine";
   ```
2. Make sure PostgreSQL is running on `localhost:5432` with user `postgres`.

> **Tables are created automatically** by TypeORM on first backend startup (`DB_SYNCHRONIZE=true` in `.env`).

---

## 2. Backend — NestJS

```bash
cd backend-nest
```

### Environment

Copy the example file and fill in your values:

```bash
copy .env.example .env
```

The `.env` needs these variables (already pre-filled for local dev):

```env
PORT=8000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=<your pg password>
DB_NAME=FreightPriceEngine
DB_SYNCHRONIZE=true

JWT_SECRET=<random secret string>
JWT_EXPIRES_IN=30m

MICROSOFT_CLIENT_ID=<Azure App client ID>
MICROSOFT_TENANT_ID=<Azure tenant ID>
MICROSOFT_CLIENT_SECRET=<Azure client secret>

INITIAL_SUPERADMIN_EMAIL=<first admin email>
FRONTEND_URL=http://localhost:3000
```

### Install & Run

```bash
npm install
npm run start:dev
```

API is now live at `http://localhost:8000/api`.

---

## 3. Frontend — Next.js

```bash
cd frontend-next
```

### Environment

```bash
copy .env.example .env.local
```

`.env.local` variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=<Azure App client ID>
NEXT_PUBLIC_MICROSOFT_TENANT_ID=<Azure tenant ID>
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000
```

### Install & Run

```bash
npm install
npm run dev
```

App is now live at `http://localhost:3000`.

---

## 4. First Login

1. Open `http://localhost:3000` — you are redirected to `/login`.
2. Click **Sign In with Microsoft** and authenticate with the account whose email matches `INITIAL_SUPERADMIN_EMAIL`.
3. On first login that email is automatically created as an **ADMIN** user.
4. All subsequent users who sign in are created with the **USER** role. An admin can manage their departments from **User Management**.

---

## 5. Key Routes

| Route | Description | Role required |
|---|---|---|
| `/dashboard` | Enquiry overview & summary cards | All |
| `/rfq` | RFQ drafting wizard | All |
| `/comparison` | Vendor quote comparison engine | All |
| `/customer-quote` | Generate customer quote draft | All |
| `/profile` | Current user profile | All |
| `/admin/users` | User & department management | ADMIN only |

---

## 6. API Endpoints

| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/login/microsoft` | Exchange MS id_token for JWT | Public |
| GET | `/api/users/me` | Current user profile | JWT |
| GET | `/api/users` | List all users | ADMIN |
| POST | `/api/users` | Create a user | ADMIN |
| PUT | `/api/users/:id` | Update a user | ADMIN |
| POST | `/api/users/:id/departments` | Set user departments | ADMIN |

---

## 7. Tech Stack

**Backend**
- NestJS + TypeScript
- TypeORM + PostgreSQL
- Passport JWT authentication
- `class-validator` request validation
- Global audit interceptor (logs all mutating actions)

**Frontend**
- Next.js 16 (App Router)
- shadcn/ui (Tailwind v4 + Radix UI)
- MSAL Browser + React for Azure AD auth
- TanStack React Query
- Sonner toast notifications

---

## 8. Development Notes

- `DB_SYNCHRONIZE=true` auto-creates/alters tables — **set this to `false` in production** and use migrations instead.
- JWT tokens expire in 30 minutes by default (`JWT_EXPIRES_IN`).
- The Microsoft redirect URI for local dev is `http://localhost:3000` — this must be registered in your Azure App Registration.
