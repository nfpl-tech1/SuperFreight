# Quote Capture and Comparison Plan

## Goal
Implement automatic capture, review, editing, and comparison of vendor quotations received by email, with the comparison flow anchored on `Inquiry -> RFQ -> Vendor Quotes`.

Longer term, this should evolve into one reusable email processing engine that can classify and route:
- client inquiry emails
- vendor quote emails
- ignored / irrelevant mail

For this V1 plan, we are intentionally implementing only the vendor quote lane and the comparison workflow.

This plan is based on the agreed product direction:
- RFQ sending is already in place.
- Each RFQ can define its own response fields.
- The inquiry number in the subject, such as `E123456`, is the primary signal that a mail belongs to an inquiry.
- Sent-mail tracking, thread metadata, and sender identity should improve confidence, but should not be a hard gate for counting a quote reply against an inquiry.
- Mail should be scanned automatically every 1 minute.
- The scanner must resume from the last processed Outlook receive timestamp after restart.
- Extracted quotes must remain editable in the application.
- Quote extraction should use Gemini and consider both mail body and attachments.

## Agreed Product Decisions

### 1. Comparison is RFQ-specific, not globally normalized
- We should not force every quote into one universal fixed-column comparison grid.
- The comparison screen must load the selected `RFQ` and build columns from that RFQ's `rfq_field_specs`.
- One inquiry can have multiple RFQs such as `CHA`, `TRANSPORT`, `FF`, and each RFQ can have different requested fields.

### 2. Mail matching should be inquiry-first
- If the subject contains a valid inquiry number such as `E123456`, the message should count as belonging to that inquiry.
- Matching the inquiry should place the message into the inquiry's quote intake flow even when RFQ or vendor resolution is still incomplete.
- Sender email and sender domain should then help identify the vendor.
- Thread metadata and tracked outbound refs should be treated as confidence boosters, not as the only path to a usable match.
- This protects the workflow when a user sends an RFQ manually through Outlook instead of through the app.

### 3. The scanner watermark should use Outlook receive time
- The persisted checkpoint should be based on Outlook `receivedDateTime`, not local server time.
- We should still keep message-level dedupe by Outlook message ID or `internetMessageId`.
- Each run should re-scan with a small overlap buffer and dedupe by message ID to avoid misses around the checkpoint boundary.

### 4. Users must review and edit extracted quotes
- Gemini extraction should create a draft quote record, not silently finalize business data with no review path.
- Users should be able to edit extracted values after intake.
- Earlier received revisions should not be lost if a vendor replies again on the same chain.

### 5. One email processing engine, quote lane first
- We should build one shared email intake engine that scans mailbox messages, dedupes them, classifies them, and routes them to business workflows.
- In the future that engine should support both client-inquiry capture and vendor-quote capture.
- For now, we will only fully implement the vendor-quote capture route and ignore the rest.
- The current comparison-table milestone should not expand into full client inquiry capture yet.

## Do We Need A Mail Ignoring Feature?
Short answer: not for correctness, but yes for usability.

### What is required for correctness
- Persist the mailbox scan checkpoint.
- Persist scanned message IDs so already-seen mails are not reprocessed.
- Persist message processing status such as `ignored`, `unmatched`, `extracted`, `needs_review`, `finalized`, or `failed`.

If we do those three things properly, we do not need a separate "ignore processed mails" mechanism just to prevent duplicate work.

### Why an ignore feature is still useful
- Mailboxes will contain auto-replies, internal chatter, signatures-only replies, delivery failures, and unrelated follow-ups.
- Without ignore rules, the quote intake queue will get noisy and users will spend time reviewing messages that were never real vendor quotations.

### Recommendation
Implement a lightweight ignore-rules layer in the first functional slice, but use it to mark messages as `ignored` rather than deleting them or hiding them without trace.

Recommended ignore sources:
- System heuristics:
  - self-sent mail
  - automatic replies / out-of-office
  - delivery failure / bounce notifications
  - duplicate message IDs already recorded
- User-defined rules:
  - sender email equals
  - sender domain equals
  - subject contains
  - body contains
  - attachment presence yes/no
  - only apply when no known inquiry or RFQ match exists

This gives us controllable noise reduction without risking silent data loss.

## Current State

### Backend
- `backend-nest/src/modules/shipments/shipments.service.ts`
  - quote support is currently limited to `listQuotes(inquiryId?)` and `createQuote(dto)`.
- `backend-nest/src/modules/shipments/entities/freight-quote.entity.ts`
  - stores a small editable quote record with a few fixed commercial fields plus `extractedFields`.
- `backend-nest/src/modules/rfqs/entities/rfq-field-spec.entity.ts`
  - already stores the selected response fields per RFQ.
- `backend-nest/src/modules/inquiries/entities/external-thread-ref.entity.ts`
  - already stores `conversationId`, `messageId`, and `internetMessageId`, which is a strong starting point for reply matching.
- Outlook support currently covers mailbox connection and sending, not inbound quote ingestion.

### Frontend
- `frontend-next/src/app/(protected)/comparison/page.tsx`
  - current comparison flow is manual and inquiry-level only.
- `frontend-next/src/app/(protected)/comparison/components/quote-capture-dialog.tsx`
  - quote entry is still hand-entered through a fixed-form dialog.
- `frontend-next/src/app/(protected)/comparison/components/vendor-quotes-table.tsx`
  - table columns are fixed rather than RFQ-driven.

## Target State

### Functional flow
1. User opens comparison.
2. User selects an `Inquiry`.
3. User selects one of that inquiry's `RFQs`.
4. The system loads:
   - RFQ field specs
   - received mail queue for that RFQ
   - extracted and reviewed quote versions
   - comparison table with RFQ-specific columns
5. A background mailbox scanner runs every 1 minute:
   - fetches newly received mail since the persisted Outlook watermark
   - records the scanned message
   - classifies it for the quote-capture lane or ignore lane
   - applies ignore rules
   - matches the message to inquiry/RFQ/vendor
   - runs Gemini extraction for viable quote messages
   - creates or updates editable quote drafts
6. Users review extracted quotes, edit values if needed, and compare vendor responses for the selected RFQ.

### Data lifecycle
`scanned -> ignored | unmatched | extraction_pending -> extracted -> needs_review -> finalized`

More precisely for V1 quote capture:
- `ignored`
- `unmatched` for messages with no usable inquiry number
- `needs_review` for messages that match an inquiry but still need RFQ/vendor confirmation
- `extraction_pending` only when inquiry, RFQ, and vendor are resolved well enough to extract

### Quote revision handling
- A vendor may reply multiple times on the same RFQ thread.
- We should not overwrite the previous quote blindly.
- Keep the inbound message record and create a new quote version.
- The comparison screen should show the latest active version per `RFQ + vendor`, with access to earlier revisions if needed.

## Recommended Backend Structure

Keep the feature under the existing `shipments` area for now, but split responsibilities instead of growing `shipments.service.ts`.

Target structure:

```text
backend-nest/src/modules/shipments/
  shipments.module.ts
  shipments.controller.ts
  shipments.service.ts
  dto/
    create-freight-quote.dto.ts
    update-freight-quote.dto.ts
    list-quotes.dto.ts
    list-quote-inbox.dto.ts
    create-quote-ignore-rule.dto.ts
  entities/
    freight-quote.entity.ts
    quote-inbound-message.entity.ts
    quote-mailbox-scan-state.entity.ts
    quote-ignore-rule.entity.ts
  services/
    email-processing-engine.service.ts
    quote-intake.service.ts
    quote-matching.service.ts
    quote-ignore.service.ts
    quote-extraction.service.ts
    quote-comparison.service.ts
  prompts/
    quote-extraction.prompt.ts
```

## Proposed Data Model

### 1. `quote_mailbox_scan_states`
Purpose:
- Persist mailbox intake checkpoint per mailbox owner.

Suggested fields:
- `id`
- `mailboxOwnerUserId`
- `lastReceivedAt`
- `lastMessageId`
- `lastScanStartedAt`
- `lastScanCompletedAt`
- `lastScanStatus`
- `lastError`

### 2. `quote_inbound_messages`
Purpose:
- Keep a durable ledger of every scanned mail relevant to quote intake, including ignored and unmatched messages.

Suggested fields:
- `id`
- `mailboxOwnerUserId`
- `outlookMessageId`
- `internetMessageId`
- `conversationId`
- `receivedAt`
- `fromEmail`
- `fromName`
- `subject`
- `hasAttachments`
- `matchedInquiryId`
- `matchedRfqId`
- `matchedVendorId`
- `status`
- `ignoreReason`
- `failureReason`
- `rawMetadata`
- `attachmentMetadata`
- `processedAt`

Recommended metadata to retain:
- `inquiryNumber`
- `matchReason`
- `matchConfidence`
- `matchedBy`
- `suggestedVendorIds`
- `suggestedRfqIds`
- `manuallyLinked`

Suggested statuses:
- `ignored`
- `unmatched`
- `extraction_pending`
- `extracted`
- `needs_review`
- `finalized`
- `failed`

### 3. `quote_ignore_rules`
Purpose:
- Support configurable mailbox noise filtering.

Suggested fields:
- `id`
- `mailboxOwnerUserId` nullable for global rules
- `name`
- `priority`
- `isActive`
- `conditions` jsonb
- `createdByUserId`

### 4. `freight_quotes` changes
Purpose:
- Promote it from a mostly manual record into the editable reviewed quote layer.

Suggested additions:
- `inboundMessageId`
- `receivedAt`
- `reviewStatus`
- `versionNumber`
- `isLatestVersion`
- `extractionConfidence`
- `comparisonFields` jsonb
- `reviewedByUserId`
- `reviewedAt`

Keep:
- current commercial fields for downstream customer quote generation
- `extractedFields`
- `quotePromptSnapshot`

## Matching Strategy

### 1. Inquiry anchor
- Extract inquiry number from subject, for example `E123456`.
- If a valid inquiry number is found, count the message as belonging to that inquiry.
- This is the primary match and should not depend on tracked outbound sends.

### 2. Vendor resolution
- First try exact sender-email match against vendor contacts and cc recipients.
- Then try sender-domain match when exact email does not resolve the vendor.
- If the inquiry is matched but vendor is ambiguous, keep the message in `needs_review`.

### 3. RFQ resolution
- Once inquiry and vendor are known, try to resolve the RFQ under that inquiry.
- Prefer a single RFQ where that vendor is already part of the RFQ vendor list.
- If only one RFQ under the inquiry exists, use it.
- If multiple RFQs are plausible, keep the message in `needs_review`.

### 4. Confidence boosters
- Use tracked outbound mail refs, `conversationId`, `internetMessageId`, sent recipient history, and subject-line similarity as supporting evidence.
- These signals should increase confidence, but should not be the only way a message becomes usable.

### 5. Manual Outlook-send case
- If a user manually sends an RFQ through Outlook and the vendor replies with the inquiry number in the subject, we should still count the message against that inquiry.
- In that case the system should prefer `needs_review` over discarding the mail.

### 6. Fallback behavior
- If inquiry is known but RFQ or vendor is unresolved, keep message as `needs_review`.
- If no inquiry number is found, keep message as `unmatched` unless a future classifier explicitly routes it elsewhere.

## Gemini Extraction Strategy

### Input sources
- mail body
- attachment text extracted from supported files

### Prompt scope
- Build the Gemini prompt from:
  - inquiry number
  - RFQ department
  - RFQ form values
  - RFQ selected response fields from `rfq_field_specs`

### Output contract
- Gemini should return structured values only for the selected RFQ fields plus a small fixed envelope:
  - currency
  - validity
  - remarks
  - confidence notes

### Post-processing
- Map Gemini output into:
  - `comparisonFields` for dynamic RFQ comparison
  - current top-level commercial fields when there is a direct mapping
  - raw extraction payload for auditability

### Safety rule
- Low-confidence extraction should not block intake.
- It should create a reviewable draft rather than fail the pipeline unless parsing is completely unusable.

## API Changes

### RFQ APIs
- Extend RFQ listing to support filtering by inquiry:
  - `GET /rfqs?inquiryId=...`

### Quote APIs
- Extend quote listing:
  - `GET /quotes?inquiryId=...&rfqId=...`
- Add quote update:
  - `PATCH /quotes/:id`
- Add quote selection/version endpoints later only if needed.

### Quote inbox APIs
- Add inbox listing:
  - `GET /quote-inbox?inquiryId=...&rfqId=...&status=...`
- Add inbox action endpoints:
  - `POST /quote-inbox/:id/reprocess`
  - `POST /quote-inbox/:id/ignore`
  - `POST /quote-inbox/:id/link`

### Ignore rule APIs
- `GET /quote-ignore-rules`
- `POST /quote-ignore-rules`
- `PATCH /quote-ignore-rules/:id`
- `DELETE /quote-ignore-rules/:id`

## Frontend Changes

### 1. Comparison screen flow
Replace the current inquiry-only flow with:
1. select inquiry
2. select RFQ under that inquiry
3. view received quote queue and comparison grid for that RFQ

### 2. Dynamic comparison table
- Build columns from `rfq_field_specs`.
- Keep a small fixed prefix area:
  - vendor
  - received at
  - version
  - status
  - currency
  - remarks
- Then render RFQ-specific comparison fields dynamically.

### 3. Quote review and editing
- Replace the fixed manual capture dialog with an edit/review drawer or dialog that can:
  - open an extracted quote
  - show source message metadata
  - show extracted field values
  - allow user edits
  - save reviewed quote

### 4. Intake queue panel
- Show message statuses:
  - `ignored`
  - `unmatched`
  - `needs review`
  - `finalized`
- Provide actions:
  - ignore
  - reprocess
  - manually link to RFQ/vendor

### 5. Ignore-rule settings
- Provide a small settings UI for creating and managing ignore rules.
- Keep v1 intentionally simple.

## Execution Plan

### Phase 1: Data Model and Scheduler Foundation
- [ ] Create `quote_mailbox_scan_states` entity and migration.
- [ ] Create `quote_inbound_messages` entity and migration.
- [ ] Create `quote_ignore_rules` entity and migration.
- [ ] Extend `freight_quotes` with review/version/source fields.
- [ ] Add scheduler support for a 1-minute polling job.
- [ ] Extend Outlook mail service with inbox listing and attachment metadata retrieval methods.

Verify:
- migrations run cleanly
- scheduler can execute without duplicate inserts
- watermark persists after a successful scan

### Phase 2: Intake Ledger and Ignore Pipeline
- [ ] Implement message persistence before extraction.
- [ ] Add system ignore heuristics for auto-replies, self-mail, failures, and duplicates.
- [ ] Implement configurable ignore rule evaluation.
- [ ] Ensure ignored messages are recorded with `ignored` status instead of disappearing.

Verify:
- duplicate messages do not create duplicate intake rows
- ignored messages remain visible in the ledger with reason captured

### Phase 3: Inquiry, RFQ, and Vendor Matching
- [ ] Make inquiry-number extraction the primary match anchor.
- [ ] Add sender-email and sender-domain vendor matching.
- [ ] Resolve RFQ from inquiry plus vendor where possible.
- [ ] Use thread refs and outbound history as confidence boosters.
- [ ] Mark inquiry-matched but unresolved results as `needs_review`.

Verify:
- subject `E123456` causes the mail to appear under that inquiry
- manual Outlook-send replies are still captured when the inquiry number is present
- ambiguous vendor or RFQ cases do not auto-finalize

### Phase 4: Gemini Extraction and Quote Versioning
- [ ] Build RFQ-aware Gemini prompt generation from `rfq_field_specs`.
- [ ] Extract from body and supported attachments.
- [ ] Persist raw extraction payload and confidence metadata.
- [ ] Create or append editable `freight_quotes` versions linked to inbound messages.
- [ ] Mark the newest version as active for comparison.

Verify:
- extraction only returns requested RFQ fields
- a second vendor reply creates a new version instead of overwriting old data
- failed extraction leaves inbox row traceable for retry

### Phase 5: Backend Query and Review APIs
- [ ] Extend `GET /rfqs` to filter by inquiry.
- [ ] Extend `GET /quotes` to filter by `rfqId`.
- [ ] Add quote update endpoint.
- [ ] Add quote inbox listing and action endpoints.
- [ ] Add ignore-rule CRUD endpoints.

Verify:
- inquiry -> RFQ -> quote drill-down works through API only
- inbox actions update message status correctly

### Phase 6: Frontend Comparison Rebuild
- [ ] Update comparison page to require inquiry then RFQ selection.
- [ ] Load RFQ field specs and render dynamic columns.
- [ ] Add intake queue panel with statuses and actions.
- [ ] Replace fixed quote capture with extracted-quote review/edit UI.
- [ ] Add ignore-rule settings UI.

Verify:
- users can compare different RFQs under the same inquiry with different column sets
- users can edit extracted quote values and see the table update immediately
- ignored messages do not clutter the review queue

### Phase 7: Testing, Monitoring, and Rollout
- [ ] Add unit tests for ignore rules, matching logic, extraction mapping, and version resolution.
- [ ] Add integration tests for mailbox scan checkpoint behavior.
- [ ] Add frontend tests for dynamic comparison column rendering.
- [ ] Add logging/metrics for scan runs, ignored messages, unmatched messages, and extraction failures.

Verify:
- restart resumes scanning from persisted Outlook receive watermark
- overlap re-scan does not duplicate work
- core flows pass build and test gates

## Affected Files

| File | Change Type | Notes |
|------|-------------|-------|
| `backend-nest/src/modules/shipments/shipments.module.ts` | modify | register new entities/services |
| `backend-nest/src/modules/shipments/shipments.controller.ts` | modify | add inbox, update, and ignore-rule endpoints |
| `backend-nest/src/modules/shipments/shipments.service.ts` | thin/facade | keep orchestration light |
| `backend-nest/src/modules/shipments/entities/freight-quote.entity.ts` | modify | add review/version/source fields |
| `backend-nest/src/modules/shipments/entities/quote-inbound-message.entity.ts` | create | mail intake ledger |
| `backend-nest/src/modules/shipments/entities/quote-mailbox-scan-state.entity.ts` | create | Outlook receive watermark |
| `backend-nest/src/modules/shipments/entities/quote-ignore-rule.entity.ts` | create | user-configurable ignore rules |
| `backend-nest/src/modules/shipments/services/quote-intake.service.ts` | create | scheduled polling + intake orchestration |
| `backend-nest/src/modules/shipments/services/quote-ignore.service.ts` | create | ignore rule evaluation |
| `backend-nest/src/modules/shipments/services/quote-matching.service.ts` | create | inquiry/RFQ/vendor matching |
| `backend-nest/src/modules/shipments/services/quote-extraction.service.ts` | create | Gemini extraction and mapping |
| `backend-nest/src/modules/shipments/services/quote-comparison.service.ts` | create | latest-version comparison view |
| `backend-nest/src/modules/outlook/outlook-mail.service.ts` | modify | inbox read helpers and attachment fetch support |
| `backend-nest/src/modules/inquiries/entities/external-thread-ref.entity.ts` | reuse | primary matching anchor |
| `backend-nest/src/modules/rfqs/entities/rfq-field-spec.entity.ts` | reuse | dynamic comparison columns |
| `frontend-next/src/lib/api/client.ts` | modify | new inbox, rule, RFQ-filter, and quote-update APIs |
| `frontend-next/src/lib/api/types.ts` | modify | add inbox/rule/review types |
| `frontend-next/src/app/(protected)/comparison/page.tsx` | rebuild | inquiry -> RFQ comparison flow |
| `frontend-next/src/app/(protected)/comparison/components/vendor-quotes-table.tsx` | rebuild | dynamic RFQ-driven columns |
| `frontend-next/src/app/(protected)/comparison/components/quote-capture-dialog.tsx` | replace/repurpose | review-edit UI instead of fixed manual capture |
| `frontend-next/src/app/(protected)/comparison/components/*` | create/modify | inbox queue, RFQ selector, review panel, rule manager |

## Risks and Mitigations
- Thread metadata may be incomplete on some replies.
  - Mitigation: inquiry-number match remains primary; thread data only boosts confidence.
- Users may send RFQs manually through Outlook instead of through the app.
  - Mitigation: inquiry-number matches still count and route to `needs_review` when auto-link confidence is lower.
- Attachment extraction quality may vary by file type.
  - Mitigation: support a small known set first and keep drafts editable.
- Polling overlap can create duplicates if dedupe is weak.
  - Mitigation: unique constraints on message identifiers plus ledger-first persistence.
- Ignore rules can accidentally hide useful mail.
  - Mitigation: mark as `ignored` with audit trail, and allow reprocess.
- Different RFQs under the same inquiry may confuse users if mixed in one table.
  - Mitigation: require RFQ selection before loading the comparison grid.

## Rollback Plan
If any slice becomes unstable:
1. Disable the 1-minute scanner via configuration flag and keep manual review endpoints only.
2. Keep the inbox ledger tables and stop auto-extraction while preserving recorded messages.
3. Fall back to the existing manual quote creation flow for comparison until the affected slice is fixed.

## Recommended Delivery Order
1. Mailbox ledger + watermark
2. Ignore pipeline
3. Inquiry-first matching with vendor/RFQ resolution
4. Gemini extraction
5. Quote versioning and update API
6. Inquiry -> RFQ frontend comparison rebuild
7. Ignore-rule settings

## Definition of Done For V1
- Mailbox scanner runs every 1 minute.
- Restart resumes from persisted Outlook `receivedDateTime`.
- Duplicate mails are not reprocessed.
- Incoming replies with a valid inquiry number are counted against that inquiry.
- Vendor and RFQ are auto-resolved when confidence is good, otherwise the message remains reviewable.
- RFQ comparison columns are generated from that RFQ's selected fields.
- Gemini extraction creates editable quote drafts from body and attachments.
- Users can review, edit, compare, and select quotes per RFQ.
- Ignore rules reduce queue noise without silently deleting messages.
