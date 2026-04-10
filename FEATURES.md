# FreightShakti — Feature Status

**Stack:** Next.js 16 (App Router) + NestJS + PostgreSQL + Azure AD (MSAL v5)  
**Active folders:** `frontend-next/` · `backend-nest/`

---

## ✅ Done

### Auth & Shell
- [x] Microsoft Azure AD SSO (MSAL v5 redirect flow)
- [x] JWT exchange with NestJS backend, stored in localStorage
- [x] Auto-logout on 401 (expired token); redirects to /login
- [x] JWT expiry set to 8 h (dev-friendly)
- [x] Login page — spinner during `isLoading`, no flash
- [x] Protected layout — sidebar + mobile bottom nav + header
- [x] Collapsible sidebar — expanded (light/logo) / collapsed (navy/icon-only) with yellow toggle button
- [x] Mobile bottom nav

### Core protected pages
- [x] Dashboard — summary cards + enquiry table (desktop & mobile)
- [x] RFQ Drafting — full 4-step wizard (Form → Response Fields → Vendor Selection → Review & Send)
  - [x] Department-specific dynamic fields with validation
  - [x] Live email preview (contentEditable WYSIWYG)
  - [x] Response field picker + custom fields
  - [x] Vendor filter + sortable vendor table
  - [x] Step progress bar, localStorage draft persistence
- [x] Quote Comparison — select enquiry, compare vendor quotes, highlight lowest
- [x] Customer Quote — select vendor quote, set margin %, generate draft text
- [x] Profile — display name, email, role, departments
- [x] Admin / User Management — list users, toggle department assignments per user

### Backend (NestJS)
- [x] Auth: Microsoft id_token → internal JWT
- [x] Users CRUD (admin-only)
- [x] Department assignments per user
- [x] JWT guard + roles guard on all routes
- [x] Audit log table (decorator-based)

---

## 🔲 Not Yet Implemented

### High Priority
| Feature | Notes |
|---|---|
| **Real API data for all pages** | Dashboard, Comparison, Customer Quote, and RFQ inquiries still have mock-backed pieces. Need backend models + API endpoints + frontend fetch calls. |
| **RFQ / Enquiry model in backend** | `Enquiry` entity, status transitions, link to user and department. |
| **Quotes / Response model** | Store vendor quotes received against an RFQ. |

### Medium Priority
| Feature | Notes |
|---|---|
| **Send RFQ via Outlook / mailto** | Step 4 "Send" button and Step 1 "Send via Outlook" are placeholders. Should open `mailto:` link or call Graph API. |
| **RFQ draft save to backend** | Currently only saved to `localStorage`. Should persist to DB. |
| **Quote Comparison — real quotes** | Should load from DB, not from `quotes.ts`. |
| **Customer Quote — PDF / email send** | Currently only copies text. Add PDF generation or email send. |
| **User Management — create user form** | Admin can update departments but cannot create new users from UI yet (POST /users endpoint exists in backend). |

### Low Priority / Polish
| Feature | Notes |
|---|---|
| **TypeScript — zero errors** | Run `npx tsc --noEmit` in `frontend-next/` and fix remaining type errors. |
| **RFQ Step 1 layout** | Inquiry Number + Department selectors should match the screenshot layout (inline row at top, preview left / form right). |
| **Direction & Shipment Type field widths** | Select dropdowns for Direction and Shipment Type need wider min-width in the dynamic form grid. |
| **Notifications bell** | Header bell icon is decorative only. |
| **Dark mode** | Tailwind dark mode classes exist but not toggled. |
| **Breadcrumbs** | Desktop header has a `{/* Future: breadcrumbs */}` placeholder. |
| **Error boundaries** | No global error boundary for unexpected React crashes. |
| **Loading skeletons** | Pages that will hit APIs should show skeleton loaders. |

---

## Data Models Needed in Backend

```
Enquiry       id, customerId, departmentId, status, formValues (jsonb), createdAt
RFQSend       id, enquiryId, vendorIds[], responseFields[], sentAt, emailBody
VendorQuote   id, rfqSendId, vendorId, rates (jsonb), transitDays, validUntil
Vendor        id, name, email, contact, country, categories[], isActive
Customer      id, name, email, contact, country
```

---

## How to Run

```bash
# Backend
cd backend-nest
npm run start:dev          # port 8000

# Frontend
cd frontend-next
npm run dev                # port 3000
```
