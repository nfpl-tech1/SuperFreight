# Auth Contracts

## OS Identity Ownership

- `OS` is the identity source for users.
- SuperFreight now authenticates by calling OS internal APIs instead of using Microsoft as primary login.
- Direct login path:
  - `POST /api/auth/login`
  - SuperFreight calls `OS /auth/verify-password`
  - Requires `app_slug = "super-freight"`
- SSO launch path:
  - `OS` dashboard still launches apps with a short-lived SSO token.
  - SuperFreight consumes the token at `POST /api/auth/sso`.

## Session Shape

- SuperFreight issues its own JWT after successful OS verification.
- `GET /api/auth/me` returns:
  - `user`
  - `onboarding_required`

## Local User Cache

SuperFreight user cache now stores:

- `osUserId`
- email
- name
- base role (`ADMIN` if `is_app_admin`, otherwise `USER`)
- `isAppAdmin`
- `isTeamLead`
- `userType`
- department/org cache
- Outlook onboarding state

## Reference Source

- `OS/apps/os-backend/src/auth/*`
- `training-module/backend/app/sso.py`
- `training-module/backend/app/main.py`
