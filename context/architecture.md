# Architecture Notes

## Databases

SuperFreight is now wired for two PostgreSQL connections:

- default app DB:
  - local users
  - custom app roles
  - Outlook connection/subscription state
  - consumed SSO tokens
  - RFQs
  - freight quotes
  - customer drafts
  - audit logs
- named `business` DB:
  - inquiries
  - jobs
  - service parts
  - ownership history
  - external thread refs
  - rate sheets

## Shared Business Core Model

- `Inquiry`
- `Job`
- `JobServicePart`
- `OwnershipAssignment`
- `ExternalThreadRef`
- `RateSheet`

## App-Specific Workflow Model

- `Rfq`
- `RfqFieldSpec`
- `FreightQuote`
- `CustomerDraft`
- `OutlookConnection`
- `OutlookSubscription`
- `AppRole`
- `RolePermission`
- `RoleScopeRule`
- `UserRoleAssignment`

## Current Delivery Shape

- Freight workflow is live end-to-end in the current repo.
- CHA and Transportation are not implemented as active modules yet.
- The shared model leaves room for future CHA application reuse.
