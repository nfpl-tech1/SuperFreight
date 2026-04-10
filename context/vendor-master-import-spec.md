# Vendor Master Import Spec

## Purpose

This document captures the current agreed direction for vendor master import,
merge, conflict review, and GUI workflow so the team can implement it without
re-deciding the same rules later.

This spec builds on:

- `context/og-db-source-analysis.md`
- the current vendor master schema and importer implementation
- the current `/vendors` admin UI

## Scope

This spec covers:

- vendor master source files
- how bulk import should work from the GUI
- how duplicates should be handled
- when imported data should auto-merge vs require user review
- what should happen when imported data conflicts with existing system data
- the proposed import job model for the backend

This spec does not cover:

- full port master import
- RFQ vendor selection behavior
- spreadsheet-style per-cell editing UI

## Source Files

The GUI should support **fixed source slots**, not arbitrary file uploads.

### Slot 1: Domestic Master

- file: `OG DB/Data Base- Export.xlsx`
- purpose: India / domestic operational source

### Slot 2: WCA Master

- file: `OG DB/WCA Mail Merge Nagarkot.xlsx`
- purpose: international / WCA source

### Slot 3: Vendor Template / Patch File

- file: `OG DB/Data Base- Import.xlsx`
- purpose: curated supplemental import, small patch file, or future controlled
  import template

## Agreed Source Roles

- Domestic workbook is the main India/local operational source.
- WCA workbook is the main international source.
- Template workbook is the most likely place for curated corrections or smaller
  batches.

The import GUI should make these roles explicit so users do not upload files
into the wrong slot.

## Agreed Vendor Master Shape

Phase 1 vendor master data model remains:

- `port_master`
- `vendor_master`
- `vendor_offices`
- `vendor_office_ports`
- `vendor_contacts`
- `vendor_cc_recipients`
- `vendor_type_master`
- `vendor_office_type_map`

Important modeling rules:

- `vendor_master` = company / organization
- `vendor_offices` = branch / office
- `vendor_contacts` = people in that office
- `vendor_cc_recipients` = operational CC email IDs
- vendor types come from sheet/source membership
- WCA capability flags live at office level

See `context/og-db-source-analysis.md` for the detailed schema rationale.

## Import Modes

The import workflow should support 3 modes:

### 1. Preview

- dry-run only
- no DB writes
- always happens before apply

### 2. Merge

- safest default apply mode
- create/update/merge data into existing vendor master
- do **not** delete existing records just because the new file does not contain
  them

### 3. Replace Existing Vendor Master

- truncate vendor master tables, then rebuild from uploaded files
- use only with strong confirmation
- still run preview before applying

## Important Rule About Apply

Even when the user intends to merge or replace, the GUI should first run a
preview pass. In practice:

- every import starts as preview
- the user then chooses whether to apply as `MERGE` or `REPLACE`

This keeps the workflow safe while still supporting full rebuilds.

## Duplicate Handling

There are two kinds of duplicates:

### A. Duplicates inside the uploaded files

These should be merged automatically where matching is unambiguous.

### B. Duplicates against existing system data

These should normally be handled through upsert/merge rules, and only escalate
to user review when the match is ambiguous.

## Agreed Matching Keys

### Vendor match

Use:

- normalized company name

### Office match

Use:

- vendor
- normalized office name

### Contact match

Use a contact identity key built from available stable fields such as:

- contact name
- primary / secondary email
- mobile / landline

### CC recipient match

Use:

- normalized email

## What Should Auto-Merge

These should not interrupt the user with review prompts:

- exact duplicate rows
- same vendor after normalization
- same office under the same vendor after normalization
- same contact identity under the same office
- same CC email under the same office
- adding missing contacts
- adding missing CC recipients
- adding vendor type links
- capability booleans changing from `false -> true`

These are normal merge cases, not review-worthy conflicts.

## Existing Data vs Imported Data

### Merge Mode Policy

In `MERGE` mode:

- missing import values should **not** erase existing DB values
- existing records should **not** be deleted automatically
- imported data may enrich the record
- imported data may update values when the new value is better or clearly more
  complete

### Replace Mode Policy

In `REPLACE` mode:

- vendor master data is rebuilt from the uploaded files
- vendor master tables are cleared first
- this is the only mode where full reset is expected

## Field Update Policy

### Additive fields

These should merge:

- vendor types
- CC recipients
- contacts
- office capabilities

### Text fields

These should update only when:

- imported value is non-empty
- imported value is better or more complete
- conflict rules do not require user review

Examples:

- office address
- specialization
- external code
- designation

### Missing values

Blank imported values should **not** wipe existing values in merge mode.

## Source Precedence

When auto-merging safe data, use this precedence order:

1. Template workbook
2. Domestic workbook
3. WCA workbook
4. existing DB as baseline

This precedence is only for safe merges.

If two non-empty values disagree in an important way, the record should move to
conflict review instead of silently choosing a winner.

## Conflict Review Model

The GUI should ask the user only for **real conflicts**, not for every repeated
row.

Import outcomes should be grouped into:

- `Safe Create`
- `Safe Update`
- `Needs Review`
- `Skipped`

## Conflict Types

### 1. Vendor Match Conflict

Meaning:

- imported vendor could match an existing vendor, but the confidence is not high
  enough for automatic merge

Examples:

- similar company names with different office/country patterns
- possible duplicate organization with unclear identity

Allowed actions:

- merge into existing vendor
- create as new vendor
- skip

### 2. Office Match Conflict

Meaning:

- vendor match looks correct, but office match is ambiguous

Examples:

- existing office `Mumbai`
- imported office `Nhava Sheva`
- could be the same office or a separate office

Allowed actions:

- merge into existing office
- create new office
- skip

### 3. Field Value Conflict

Meaning:

- existing and imported values are both non-empty and different

Examples:

- different country
- different external code
- different office label with important identity impact

Allowed actions:

- keep existing
- use imported
- merge both
- skip field

This should only be used for important fields, not for every minor text
difference.

### 4. Contact Ownership Conflict

Meaning:

- same contact/email appears under different vendors or different offices

Allowed actions:

- keep existing contact placement
- add as new contact anyway
- move to imported office
- skip

### 5. Inferred Identity Conflict

Meaning:

- the importer had to infer identity, for example from email domain

Allowed actions:

- accept inferred match
- create separate vendor
- skip

## What Should Trigger Review

Review-worthy:

- vendor name ambiguity
- office identity ambiguity
- country mismatch
- city/state mismatch when it affects office identity
- external code mismatch
- same email under different vendors/offices
- inferred company identity

Usually auto-merge:

- notes
- extra CC recipients
- extra phones/emails
- additive vendor types
- capability booleans

## Review Unit

Do **not** show raw spreadsheet rows as the primary review unit.

The review UI should be organized by:

- vendor
- office
- contact
- field diff only when needed

The user should see:

- existing record snapshot
- imported record snapshot
- why the conflict exists
- available actions

## Batch Actions

The review UI should support batch decisions where possible, for example:

- keep existing for all field conflicts of the same type
- create new office for all unmatched office conflicts
- accept inferred matches for all template-file rows

This prevents the review experience from becoming too manual.

## GUI Workflow

Recommended flow for `/vendors`:

### Step 1. Upload Files

- fixed upload slots:
  - Domestic Master
  - WCA Master
  - Vendor Template / Patch File

### Step 2. Preview

Show:

- files uploaded
- sheets processed
- rows read
- rows skipped
- safe creates
- safe updates
- merged duplicates
- warnings
- conflicts needing review

### Step 3. Review Conflicts

Show only `Needs Review` items.

Allow:

- per-conflict resolution
- optional batch actions

### Step 4. Apply Import

Modes:

- merge
- replace existing vendor master

### Step 5. Results

Show:

- completed status
- summary counts
- warnings
- skipped rows
- downloadable review report

## Backend Job Model

The importer should be exposed through a job-based backend flow.

### `vendor_import_jobs`

Suggested fields:

- `id`
- `status`
  - `UPLOADED`
  - `PREVIEW_READY`
  - `AWAITING_REVIEW`
  - `READY_TO_APPLY`
  - `APPLYING`
  - `COMPLETED`
  - `FAILED`
  - `CANCELLED`
- `mode`
  - `DRY_RUN`
  - `MERGE`
  - `REPLACE`
- `created_by_user_id`
- `source_summary_json`
- `result_summary_json`
- `error_message`
- `created_at`
- `updated_at`
- `started_at`
- `completed_at`

### `vendor_import_files`

Suggested fields:

- `id`
- `job_id`
- `file_role`
  - `DOMESTIC`
  - `WCA`
  - `TEMPLATE`
- `original_name`
- `stored_path`
- `file_hash`
- `uploaded_at`

### `vendor_import_conflicts`

Suggested fields:

- `id`
- `job_id`
- `conflict_type`
- `severity`
  - `LOW`
  - `MEDIUM`
  - `HIGH`
- `status`
  - `PENDING`
  - `RESOLVED`
  - `SKIPPED`
- `import_entity_type`
  - `VENDOR`
  - `OFFICE`
  - `CONTACT`
- `existing_entity_type`
- `import_snapshot_json`
- `existing_snapshot_json`
- `field_conflicts_json`
- `suggested_action`
- `allowed_actions_json`
- `resolution_action`
- `resolution_payload_json`
- `resolved_by_user_id`
- `resolved_at`

### `vendor_import_reports`

Optional but recommended for audit/download support.

Suggested fields:

- `id`
- `job_id`
- `report_type`
  - `SKIPPED`
  - `WARNINGS`
  - `SUMMARY`
- `stored_path`
- `created_at`

## API Shape

Recommended API flow:

- `POST /vendors/import-jobs`
  - create job and upload files
- `POST /vendors/import-jobs/:jobId/preview`
  - run preview
- `GET /vendors/import-jobs/:jobId`
  - get status and summary
- `GET /vendors/import-jobs/:jobId/conflicts`
  - get review items
- `PATCH /vendors/import-jobs/:jobId/conflicts/:conflictId`
  - save a user decision
- `POST /vendors/import-jobs/:jobId/apply`
  - apply import after preview/review
- `GET /vendors/import-jobs/:jobId/reports/:type`
  - download reports
- `GET /vendors/import-jobs`
  - import history

## Reuse Rule

The GUI import flow must reuse the same backend logic as the CLI importer.

That means:

- one shared normalization pipeline
- one shared validation pipeline
- one shared dedupe / merge pipeline
- one shared conflict detection pipeline

The GUI should never implement its own import logic independently.

## Current Implementation Alignment

Current backend already supports:

- the 3-source-file model
- dry-run and apply modes
- replace-existing option
- normalized vendor/office/contact/CC matching
- additive merge behavior for types, capabilities, contacts, and CC recipients
- skipped-row reporting

Current backend does **not yet** support:

- persisted import jobs
- persisted conflict review records
- GUI preview/apply endpoints
- user-driven conflict resolution

## Recommended Next Build Order

1. Refactor the current importer into a reusable import service.
2. Add `vendor_import_jobs`, `vendor_import_files`, and
   `vendor_import_conflicts`.
3. Implement preview output with conflict generation.
4. Implement conflict decision persistence.
5. Implement apply flow using those decisions.
6. Add the `/vendors` GUI import workflow.

## Final Agreed Principles

- Support the 3 known Excel sources through fixed slots.
- Start every import with preview.
- Use `MERGE` as the normal apply path.
- Use `REPLACE` only when the user explicitly wants a full rebuild.
- Auto-merge obvious duplicates.
- Ask the user only for ambiguous conflicts.
- Never delete existing records automatically in merge mode.
- Reuse backend import logic for both CLI and GUI.
