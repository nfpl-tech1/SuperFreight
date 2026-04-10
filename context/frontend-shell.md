# Frontend Shell

## Auth Flow

- `/login`
  - OS credential login form
- `/sso`
  - consumes OS launch token
- `/onboarding`
  - mandatory Outlook connect gate
- protected routes
  - redirect to onboarding until Outlook is connected

## Current Protected Pages

- `/dashboard`
- `/inquiries`
- `/rfq`
- `/comparison`
- `/customer-quote`
- `/rate-sheets`
- `/profile`
- `/admin/users`
- `/admin/roles`

## Live Data Pages

The mock-driven pages were replaced with API-backed pages for:

- dashboard
- inquiries
- comparison
- customer quote
- rate sheets
- admin/users
- admin/roles

RFQ wizard still reuses the original UI structure, but its inquiry/vendor sources and send action now call the backend.
