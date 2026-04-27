## Refactor Backlog

### Purpose
This artifact tracks the parts of the codebase that should be refactored for maintainability, modularity, scalability, reusability, and testability.

The current strategy is:
- Break monolithic files into focused subfiles and subdirectories where responsibilities are clearly separable.
- Prefer in-place helper extraction first, then promote extracted helpers to their own files once the split boundary is stable.
- Extract view-independent logic out of React component files whenever that logic can be reused or tested separately.
- Extract workflow-independent logic out of Nest services whenever that logic can live as a pure helper, formatter, resolver, or domain service.
- Add focused unit tests alongside each refactor slice.
- Avoid touching frontend files that already have unrelated local edits until the safer backend slices are done.
- Verify every slice with fresh lint, build, and test runs before marking it complete.

### Current Constraints
- `frontend-next/src/...` already contains in-progress local edits and should not be mixed with broad cleanup work.
- The backend still has limited automated coverage.
- The largest backend files are importers and service files with long orchestration methods, so they should be tackled in slices rather than with one large rewrite.

### Completed
- [x] `backend-nest/src/modules/customer-quotes/customer-quotes.service.ts`
  Reduced `generate` into smaller helpers for loading context, margin resolution, pricing, subject construction, and draft-body construction.
- [x] `backend-nest/src/modules/customer-quotes/customer-quotes.service.spec.ts`
  Added focused unit coverage for the refactored draft generation flow.
- [x] `backend-nest/src/modules/rfqs/rfqs.controller.ts`
  Extracted create-payload mapping and validation helpers.
- [x] `backend-nest/src/modules/rfqs/rfqs.controller.spec.ts`
  Added controller tests for multipart-style parsing and validation failures.
- [x] `backend-nest/src/modules/rfqs/rfqs.service.ts`
  Reduced recipient resolution mutation and clarified the resolution flow.
- [x] `backend-nest/src/modules/rfqs/rfqs.service.spec.ts`
  Added service tests for draft creation, send path, missing inquiry, and missing recipient behavior.
- [x] `backend-nest/src/modules/outlook/outlook.service.ts`
  Extracted connection validation, token refresh, Graph payload building, status shaping, and subscription upsert helpers to make the service read as a clear orchestration flow.
- [x] `backend-nest/src/modules/outlook/outlook-auth.service.ts`
  Promoted Outlook auth, token exchange, connection refresh, status, and reconnect orchestration into a dedicated auth-focused service.
- [x] `backend-nest/src/modules/outlook/outlook-mail.service.ts`
  Promoted Graph mail payload building and retrying send flow into a dedicated mail-focused service while leaving `OutlookService` as a thin facade.
- [x] `backend-nest/src/modules/outlook/outlook.service.spec.ts`
  Kept focused coverage for legacy reconnect detection, complete connection, send-mail refresh retry, and reconnect behavior after the service split.
- [x] `backend-nest/src/common/utils/collection.helpers.ts`
  Extracted shared `groupBy`, `groupMappedBy`, and `isNonEmpty` helpers and rewired current backend callers away from file-local duplicates.
- [x] `backend-nest/src/common/pagination/pagination.helpers.ts`
  Extracted shared pagination parsing and meta builders and rewired the current vendors pagination flows to use them.
- [x] `backend-nest/src/common/persistence/find-or-throw.helpers.ts`
  Extracted shared repository lookup-or-throw helpers and applied them in vendors, RFQs, inquiries, and users without changing current error contracts.
- [x] `backend-nest/src/common/utils/collection.helpers.spec.ts`
  Added focused coverage for collection grouping and non-empty string guards.
- [x] `backend-nest/src/common/pagination/pagination.helpers.spec.ts`
  Added focused coverage for pagination normalization and metadata shaping.
- [x] `backend-nest/src/common/persistence/find-or-throw.helpers.spec.ts`
  Added focused coverage for entity-name and custom-message not-found behavior.
- [x] `frontend-next/src/lib/api/error-handler.ts`
  Extracted shared API-aware error handling helpers and rewired repeated toast fallback handling in non-blocked frontend pages and hooks.
- [x] `frontend-next/src/lib/api/query-builder.ts`
  Extracted a shared query-string builder and removed duplicate vendor/location/port query serialization logic from the API client.
- [x] `frontend-next/src/lib/formatting/display.ts`
  Started a shared display-formatting layer for route and inquiry labels in non-blocked frontend consumers.
- [x] `frontend-next/src/lib/payload/payload-helpers.ts`
  Extracted shared trim-to-undefined payload cleanup and reused it in vendor and port payload builders.

## Quality Review

### Refactors Already Done

#### Customer Quotes Refactor
Score: `7.5/10`

What improved:
- `generate` now reads as a clear orchestration flow.
- Defaults were named and centralized.
- The behavior is covered by focused unit tests.

What is still missing:
- The draft-body builder is still string-template heavy and could later move into a shared template helper.
- The required-entity lookup pattern is still duplicated in multiple backend services.
- The extracted helpers are still local to the file instead of promoted to shared domain utilities.

Verdict:
- Good first slice.
- Keep it as-is.
- Treat it as the minimum bar for future slices, not the final shape.

#### RFQ Controller Refactor
Score: `8/10`

What improved:
- Payload parsing and validation responsibilities are clearer.
- Multipart normalization now has direct test coverage.
- The helper extraction is a solid controller-level cleanup.

What is still missing:
- JSON-field parsing and DTO validation could become shared controller utilities for other multipart endpoints.
- The helpers still live inside the controller file instead of a reusable request-mapping module.

Verdict:
- Strong tactical cleanup.
- Good model for future controller refactors.

#### RFQ Service Refactor
Score: `8/10`

What improved:
- Recipient resolution is less mutation-heavy and easier to follow.
- The public create/send path now has useful tests.
- Missing-recipient aggregation is explicit.

What is still missing:
- Shared collection helpers are still duplicated elsewhere in the backend.
- Recipient resolution still lives inside the main service instead of a reusable resolver/helper.
- Mail-send orchestration and recipient resolution are still coupled in one class.

Verdict:
- Good structural improvement.
- The next iteration should promote reusable pieces out of the service.

#### Current Plan Quality
Score: `8.5/10`

What is already strong:
- It identifies the largest hotspots correctly.
- It plans file splits instead of only tiny helper extractions.
- It accounts for blocked frontend areas and repo constraints.

What needed to be added:
- A stronger emphasis on extracting helpers from component files and large hooks/pages.
- More explicit shared-utility tracks across frontend and backend.
- Clearer rules for when to extract locally, promote to shared helpers, or split into domain modules.

Verdict:
- The direction is good.
- The next improvement is to bias the plan harder toward reusable shared abstractions.

## Refactor Principles
- [ ] Preserve behavior first; do not combine feature work with refactoring.
- [ ] Keep refactors surgical and reviewable.
- [ ] Prefer helper extraction, clearer naming, and reduced branching depth.
- [ ] When a helper is used in 2+ files, promote it to a shared module instead of re-copying it.
- [ ] Prefer thin React components and thin Nest facades over large orchestration files.
- [ ] Add tests before or alongside each change to lock in behavior.
- [ ] Do not expand write scope into unrelated dirty files.

## Modularity Ladder

Use this escalation path consistently:

1. Inline cleanup
- Rename variables.
- Flatten branches.
- Remove dead code.

2. File-local extraction
- Extract pure helper functions inside the same file.
- Extract small internal render/helper sections from long functions or components.

3. Shared module promotion
- If a helper is reused or likely reusable, move it into `lib/`, `common/`, `domain/`, `helpers/`, or `formatters/`.

4. Domain split
- If a file contains multiple responsibility clusters, split it into separate files or services with clear ownership.

5. Facade thinning
- Keep the original public API stable while moving logic behind smaller modules.

## Phase 0: File Split Targets

These files are large enough that helper extraction alone will not solve the maintainability problem. This phase defines the target structure before the larger refactor slices begin.

### Rule: when to split vs. when to extract in-place
- If a group of methods has no dependency on the rest of the class and could be injected separately, split it into a new service file.
- If a group of functions are pure utilities with no DI dependencies, split them into `*.helpers.ts`, `*.util.ts`, `*.formatter.ts`, or `*.mapper.ts`.
- If a file exceeds about 500 lines and contains 2 or more distinct responsibility clusters, it is a split candidate.

### A. `outlook/`: split auth and mail responsibilities

Current:
- `backend-nest/src/modules/outlook/outlook.service.ts`

Target structure:
```text
backend-nest/src/modules/outlook/
  outlook.module.ts
  outlook.controller.ts
  outlook-auth.service.ts
  outlook-mail.service.ts
  outlook.service.ts
  outlook.service.spec.ts
  dto/
  entities/
```

Split boundary:
- `getScopes`, `getMicrosoftConfig`, `exchangeToken`, `fetchMailboxProfile`, `refreshConnectionAccessToken`, `getValidConnectionForUser`, `completeConnection`, `reconnect`
  move toward `outlook-auth.service.ts`.
- `sendGraphMailRequest`, `sendMail`
  move toward `outlook-mail.service.ts`.
- `getStatus`
  can stay in the facade or auth service.

### B. `vendors/`: split service into domain-focused services

Current:
- `backend-nest/src/modules/vendors/vendors.service.ts`

Target structure:
```text
backend-nest/src/modules/vendors/
  vendors.module.ts
  vendors.controller.ts
  vendors.service.ts
  services/
    catalog.service.ts
    port-master.service.ts
    location-options.service.ts
    vendor-crud.service.ts
    vendor-office.service.ts
    vendor-graph.service.ts
  importers/
    vendor-importer.ts
    vendor-location-importer.ts
    carrier-export-coverage-importer.ts
    parsers/
      vendor-workbook-parser.ts
      location-workbook-parser.ts
    helpers/
      synthetic-port-reconciler.ts
      alias-manager.ts
      office-location-linker.ts
      port-upsert.helpers.ts
  formatters/
    vendor-response.formatters.ts
  domain/
  dto/
  entities/
```

Split sequence:
1. Extract `catalog.service.ts`.
2. Extract `port-master.service.ts`.
3. Extract `location-options.service.ts`.
4. Extract `vendor-crud.service.ts`.
5. Extract `vendor-office.service.ts`.
6. Extract `vendor-graph.service.ts`.
7. Extract importer helpers and parsers after importer test scaffolding exists.

### C. `vendor-location-importer.ts`: extract pure function helper groups

Current:
- `backend-nest/src/modules/vendors/vendor-location-importer.ts`

Target helper groups:
- `synthetic-port-reconciler.ts`
- `alias-manager.ts`
- `office-location-linker.ts`
- `port-upsert.helpers.ts`
- `location-workbook-parser.ts`

### D. Frontend large-file split targets

These are the frontend equivalents of the backend service hotspots.

Target files:
- `frontend-next/src/components/rfq/hooks/use-rfq-wizard.ts`
- `frontend-next/src/app/(protected)/admin/ports/page.tsx`
- `frontend-next/src/app/(protected)/vendors/page.tsx`
- `frontend-next/src/app/(protected)/inquiries/page.tsx`
- `frontend-next/src/components/rfq/steps/Step3VendorSelection.tsx`

Target structure pattern:
```text
feature/
  page.tsx
  feature.helpers.ts
  feature.mappers.ts
  feature.payload.ts
  feature.factories.ts
  hooks/
    use-feature-data.ts
    use-feature-dialog.ts
  components/
    ...
```

## Phase 1: Cross-Cutting Backend Reuse Extraction

These are shared abstractions that should exist before the largest backend splits continue.

### B1. Collection Utilities
Status: `Completed`

Created:
- `backend-nest/src/common/utils/collection.helpers.ts`

Extract:
- `groupBy<T>(items, keySelector)`
- `groupMappedBy<T, U>(items, keySelector, mapper)`
- `isNonEmpty(value)`

Current sources:
- `vendors.service.ts`
- `rfqs.service.ts`

### B2. Pagination Helpers
Status: `Completed`

Created:
- `backend-nest/src/common/pagination/pagination.helpers.ts`

Extract:
- `parsePaginationParams(page?, pageSize?, defaults?)`
- `buildPaginationMeta(total, page, pageSize)`
- `PaginatedResult<T>`

Current sources:
- repeated in `vendors.service.ts`

### B3. Find-or-Throw Helpers
Status: `Completed`

Created:
- `backend-nest/src/common/persistence/find-or-throw.helpers.ts`

Extract:
- `findByIdOrThrow(repo, id, entityName)`
- `findOneOrThrow(repo, where, entityName)`

Current sources:
- `vendors.service.ts`
- `rfqs.service.ts`
- `inquiries.service.ts`
- `users.service.ts`
- `customer-quotes.service.ts`

### B4. Query Builder Helpers
Create:
- `backend-nest/src/common/persistence/query-builder.helpers.ts`

Extract:
- `applyILikeSearch(qb, term, fields)`
- `fetchPaginatedIds(qb, alias, page, pageSize)`

Current sources:
- repeated in `vendors.service.ts`

### B5. Response Formatter Layer
Create:
- `backend-nest/src/modules/vendors/formatters/vendor-response.formatters.ts`

Move:
- vendor type, vendor list item, vendor detail, office summary/detail, contact, cc recipient, port, service location, port master admin, port alias formatters

### B6. Port Normalization Domain Helpers
Create:
- `backend-nest/src/modules/vendors/domain/port-normalization.ts`

Move:
- `normalizePortValue`
- `normalizePortLookupKey`
- `requirePortCode`
- `requirePortName`
- `requirePortCountryName`
- `normalizePortCode`
- `normalizePortNotes`

### B7. HTML/Text Utilities
Create:
- `backend-nest/src/common/text/html.helpers.ts`

Move:
- `escapeHtml`
- `humanizeKey`

Current source:
- `rfq-mail-builder.ts`

### B8. Mapper/Builder Pattern Standardization

New rule:
- Every non-trivial response shaping or payload-building cluster should live in `mappers/`, `builders/`, or `formatters/`, not inside controller/service bodies.

Immediate candidates:
- `vendors.service.ts`
- `rfq-builders.ts`
- `inquiry-workflow.helpers.ts`
- future Outlook Graph request builders

### B9. Resolver/Policy Extraction

New rule:
- If logic answers a domain question rather than performing I/O, move it to `domain/`.

Immediate candidates:
- RFQ recipient and office fallback decisions
- Outlook reconnect and token-refresh eligibility
- Vendor office primary/fallback selection
- Inquiry workflow transition checks

## Phase 2: Safe Backend Slices

### 1. RFQ Controller Payload Parsing
Status: `Completed`

Files:
- `backend-nest/src/modules/rfqs/rfqs.controller.ts`
- `backend-nest/src/modules/rfqs/rfqs.controller.spec.ts`

### 2. RFQ Service Recipient Resolution
Status: `Completed`

Files:
- `backend-nest/src/modules/rfqs/rfqs.service.ts`
- `backend-nest/src/modules/rfqs/rfqs.service.spec.ts`

### 3. Outlook Connection and Mail Sending Flow
Status: `Completed`

Files:
- `backend-nest/src/modules/outlook/outlook-auth.service.ts`
- `backend-nest/src/modules/outlook/outlook-mail.service.ts`
- `backend-nest/src/modules/outlook/outlook.service.ts`
- `backend-nest/src/modules/outlook/outlook.service.spec.ts`

Refactor goals:
- [x] Step 1: extract guard/helper methods for connection state checks in-place.
- [x] Step 2: add focused unit coverage.
- [x] Step 3: promote to `outlook-auth.service.ts` and `outlook-mail.service.ts`.

### 4. Roles and Inquiry Workflow Services
Status: `Ready after Outlook`

Files:
- `backend-nest/src/modules/users/roles.service.ts`
- `backend-nest/src/modules/inquiries/inquiries.service.ts`

Refactor goals:
- Extract validation helpers.
- Extract mutation-plan helpers.
- Add missing unit coverage around not-found/conflict behavior and side-effect ordering.

## Phase 3: Large Backend Hotspots

### 5. Vendor Service
Status: `High priority, staged`

Files:
- `backend-nest/src/modules/vendors/vendors.service.ts`

Refactor goals:
- Start by extracting common helpers and formatters first.
- Then split `catalog`, `port-master`, `location-options`, `vendor-crud`, `vendor-office`, and `vendor-graph` service clusters.

### 6. Vendor Importer
Status: `High priority, defer until test scaffolding exists`

Files:
- `backend-nest/src/modules/vendors/vendor-importer.ts`

Refactor goals:
- Move to `importers/`.
- Extract parser helpers.
- Extract persistence helpers.
- Add fixture-driven tests before behavior changes.

### 7. Vendor Location Importer
Status: `High priority, defer until importer test scaffolding exists`

Files:
- `backend-nest/src/modules/vendors/vendor-location-importer.ts`

Refactor goals:
- Move to `importers/`.
- Extract helper groups one at a time.
- Add regression-style tests around extracted pure logic before behavior changes.

### 8. Carrier Export Coverage Importer
Status: `Medium priority`

Files:
- `backend-nest/src/modules/vendors/carrier-export-coverage-importer.ts`

Refactor goals:
- Move to `importers/`.
- Extract office-matching and port-resolution helpers.
- Use it as the importer-test template for larger importer files.

## Phase 4: Frontend RFQ Refactor Queue

Important note:
- These files already have local edits in the working tree.
- Refactor them only after the current in-progress changes are understood or merged.

### 9. RFQ Wizard Hook and Helpers
Status: `Blocked by existing local edits`

Files:
- `frontend-next/src/components/rfq/hooks/use-rfq-wizard.ts`
- `frontend-next/src/components/rfq/hooks/use-rfq-wizard.helpers.ts`
- `frontend-next/src/components/rfq/lib/rfq-wizard.helpers.ts`

Refactor goals:
- Separate derived-state helpers from imperative actions.
- Reduce per-render branching.
- Promote reusable sub-hooks once the local edits stabilize.

### 10. RFQ Page and Step Components
Status: `Blocked by existing local edits`

Files:
- `frontend-next/src/app/(protected)/rfq/page.tsx`
- `frontend-next/src/components/rfq/steps/Step3VendorSelection.tsx`
- `frontend-next/src/components/rfq/VendorTable.tsx`
- `frontend-next/src/components/rfq/VendorFilterForm.tsx`

Refactor goals:
- Extract presentational decision helpers from render bodies.
- Move pure UI calculations into helper files.
- Keep state ownership clear between page, hook, and step components.

## Phase 5: Frontend Function Extraction and Shared Utilities

These are suitable for reuse-oriented extraction even before the blocked RFQ frontend files are revisited.

### F1. Error Handling Utility
Status: `Completed`

Created:
- `frontend-next/src/lib/api/error-handler.ts`

Extract:
- `getErrorMessage(error, fallback?)`
- `isApiError(error)`

Current repeated pattern:
- `error instanceof Error ? error.message : "Failed to ..."` across login, sso, profile, rate-sheets, comparison, customer-quote, onboarding, rfq, roles, inquiries, and more.

### F2. Dialog State Hook
Create:
- `frontend-next/src/hooks/useDialogState.ts`

Use in:
- `admin/ports/page.tsx`
- `vendors/page.tsx`
- `inquiries/page.tsx`
- `comparison/page.tsx`
- `admin/roles/page.tsx`

### F3. Paginated List Hook
Create:
- `frontend-next/src/hooks/usePaginatedList.ts`

Use in:
- `admin/ports/page.tsx`
- `vendors/page.tsx`
- `admin/roles/page.tsx`
- `inquiries/page.tsx`
- later in `use-rfq-wizard.ts`

### F4. Shared Pagination and Filter Constants
Create:
- `frontend-next/src/lib/constants/pagination.ts`
- `frontend-next/src/lib/constants/filters.ts`

Current repeated pattern:
- `PAGE_SIZE`
- `ALL_FILTER`
- duplicated filter state defaults

### F5. API Query Builder
Status: `Completed`

Created:
- `frontend-next/src/lib/api/query-builder.ts`

Current repeated pattern:
- `buildQueryString`
- `buildLocationOptionsQueryString`
- `buildPortMasterQueryString`
inside `lib/api/client.ts`

### F6. Display Formatting Helpers
Status: `Started`

Created:
- `frontend-next/src/lib/formatting/display.ts`

Extract:
- `formatRoute(origin, destination)`
- `formatFileSize(bytes)`
- `formatInquiryLabel(...)`

### F7. Draft Factory Helpers
Status: `Started`

Created:
- `frontend-next/src/lib/factories/`
- `frontend-next/src/lib/payload/payload-helpers.ts`

Current repeated pattern:
- empty draft factories
- detail-to-draft mappers
- trim-to-undefined helpers
- payload builders

Targets:
- `admin/ports/page.tsx`
- `vendors/vendors.helpers.ts`
- `inquiries/inquiry-form.helpers.ts`
- `comparison/comparison.helpers.ts`

### F8. Page-Level Data Loader Hooks
Create:
- `frontend-next/src/hooks/usePageBootData.ts`
or domain-specific variants

Current repeated pattern:
- cancellation, loading, toast, and setter choreography inside page files

Targets:
- `vendors/page.tsx`
- `admin/ports/page.tsx`
- `profile/page.tsx`

### F9. Component-Local Pure View Helpers

Rule:
- Long JSX files should not keep complex placeholder, label, chip-visibility, or display-calculation logic inline once it becomes reusable or hard to scan.

First targets:
- `Step3VendorSelection.tsx`
  move pure calculations to `step3-vendor-selection.helpers.ts`
- `app/(protected)/rfq/page.tsx`
  move compact header and step selection helpers to `rfq-page.helpers.ts` after local edits stabilize
- `app/(protected)/inquiries/page.tsx`
  move route summary and dialog helpers to `inquiries-page.helpers.ts`

### F10. Reusable View Model Mappers

Create:
- per-feature `*.mappers.ts`

Use for:
- card row labels
- table row display models
- chip/status text

Targets:
- `inquiries/page.tsx`
- `vendors.catalog.tsx`
- `comparison/helpers.ts`

### F11. RFQ Wizard Sub-Hook Extraction
Status: `Blocked by existing local edits`

Target hooks:
- `hooks/rfq/useVendorCatalog.ts`
- `hooks/rfq/useLocationOptions.ts`
- `hooks/rfq/useQuoteDrafts.ts`
- `hooks/rfq/useRfqInitialization.ts`

Goal:
- make `use-rfq-wizard.ts` an orchestrator instead of a monolith.

### F12. Attachment and File Helpers
Status: `Blocked by existing local edits`

Create:
- `frontend-next/src/lib/files/attachment-helpers.ts`

Extract:
- `generateFileKey(file)`
- `mergeAttachments(existing, incoming)`

## Phase 6: Cross-Layer Reuse and Scalability Track

This phase aligns the architectural style across frontend and backend.

### X1. Shared Naming and File Conventions
- Adopt consistent folders: `helpers`, `formatters`, `mappers`, `factories`, `domain`, `services`.
- Avoid storing pure logic inside UI files or DI-heavy service files when it can live in one of those folders.

### X2. Reuse Promotion Rule
- First use: local helper is acceptable.
- Second use: move to a shared module.
- Third use: treat it as infrastructure and document it here.

### X3. Thin Shell / Rich Helpers Pattern
- Frontend:
  pages and large components should mostly compose hooks, mappers, and presentational components.
- Backend:
  controllers should mostly validate and delegate;
  services should mostly orchestrate repositories and domain helpers;
  pure logic should move to domain, mapper, formatter, or common helpers.

### X4. Testability Rule
- If extracted logic can be tested without React rendering or Nest dependency injection, it should usually be extracted.
- Prioritize:
  - pure selectors
  - payload builders
  - formatters
  - fallback-resolution policies
  - pagination/query-string builders

### X5. Scale Risk Markers
Treat these as automatic extraction signals:
- more than 3 `useEffect` blocks
- more than 8 `useState` calls in one hook/component
- more than 2 unrelated async workflows in one file
- more than 400 to 500 lines in a React page/component
- more than 500 to 700 lines in a backend service
- repeated inline error handling or formatting logic

## Recommended Execution Order
- [x] Customer quotes service cleanup
- [x] RFQ controller payload parsing
- [x] RFQ service recipient resolution
- [x] Outlook service in-place helper extraction and unit coverage
- [x] Outlook service: promote the current helper extraction into auth/mail service split
- [x] Extract reusable backend collection, pagination, and find-or-throw helpers from current hotspots
- [ ] Frontend shared utility pass: error handler, query builder, factories, formatting, dialog-state hook
- [ ] Roles service
- [ ] Inquiries service
- [ ] Carrier export coverage importer
- [ ] Vendors service helper promotion, then domain service splits
- [ ] Vendor importer parser/helper extraction
- [ ] Vendor location importer helper extraction
- [ ] Frontend RFQ queue after current local edits are stabilized

## Current Active Refactor
- [ ] `frontend-next/src/lib/`
  Step 1: [x] extract `api/error-handler.ts` from repeated frontend error-message handling.
  Step 2: [x] extract `api/query-builder.ts` from the current API client query-string helpers.
  Step 3: [ ] continue shared formatting and factory helper promotion from non-blocked page-local utility clusters.

## Next Planning Candidates After Outlook
- [ ] `frontend-next/src/lib/api/client.ts`
  Replace duplicate query builders with one generic query-string utility.
- [ ] `frontend-next/src/app/(protected)/admin/ports/page.tsx`
  Move page-local factories, payload builders, and error helpers to shared frontend utility modules.
- [ ] `backend-nest/src/modules/vendors/vendors.service.ts`
  Start with helper and formatter promotion before splitting whole services.
