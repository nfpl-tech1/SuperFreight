# OG DB Source Analysis

## Source Folder

- `OG DB/Data Base- Export.xlsx`
- `OG DB/Data Base- Import.xlsx`
- `OG DB/WCA Mail Merge Nagarkot.xlsx`

Treat this folder as the original operational vendor source, not as a database schema dump.

## What These Files Actually Are

### 1. `Data Base- Export.xlsx`

This is the main domestic / operational vendor source.

Observed sheets:

- `Transporter`
- `CFS Buffer Yard`
- `CHA`
- `IATA (Mum)`
- `IATA (Del)`
- `IATA (Ahm)`
- `IATA (Maa)`
- `Co-Loader`
- `Carrier Master`
- `Packers`
- `Licensing`

This workbook is highly denormalized:

- one row is usually one contact, not one vendor
- the same company appears many times
- sheet name often implies category / service
- `CC Id` is already important operational data
- `Location` is often free text and may represent city, port cluster, or PAN India coverage

### 2. `Data Base- Import.xlsx`

This is a smaller operational workbook and should be treated as a supplemental source, not just a blank template.

Observed sheets:

- `Co-Loader`
- `Transporter`
- `Shipping Line`

The sample rows contain real contact data, so phase 1 import can reuse it for additional transporter, co-loader, and shipping-line contacts.

### 3. `WCA Mail Merge Nagarkot.xlsx`

This is the international / WCA source.

Observed structure:

- one sheet per country or local hub (`USA`, `Germany`, `Thailand`, `UAE `, `Mumbai`, etc.)
- repeated company rows, one per contact/email
- fields include:
  - `COMPANY NAME`
  - `CODE`
  - `EMAIL ID 1`
  - `Contact No.`
  - `Salutation`
  - `First Name`
  - `Surname`
  - `STATE`
  - `DESIGENATION`
  - capability flags like `IATA`, `Sea`, `Project`, `Own Consolidation`, `OwnTransportation`, `Own Warehousing`, `Own Custom Clearance`
  - `Specialisation (if any)`

There is also a `PROFILING RULES` sheet which behaves more like business logic guidance than raw master data.

## Important Modeling Insight

The OG data confirms that the true business grain is:

1. vendor company
2. vendor office / location
3. office contacts
4. office CC recipients
5. office capabilities / categories / certifications

It is not:

- one row per contact pretending to be one vendor
- one vendor record per country sheet row
- one flat table with duplicated contact columns

## Agreed Phase 1 Schema

This is the simplified phase 1 model agreed after discussing the OG workbooks:

- no `vendor_office_coverage`
- no `vendor_contact_routing`
- no `source_type` in the core vendor table
- port master comes from an external clean source
- local / WCA sheet names drive vendor types
- WCA capability columns become office-level boolean fields

### `port_master`

This is not seeded from the OG workbooks. It should come from a proper external port source.

Suggested fields:

- `id`
- `code`
- `name`
- `city_name`
- `state_name`
- `country_name`
- `port_mode`
  - `AIRPORT`
  - `SEAPORT`
- `is_active`
- `notes`
- `created_at`
- `updated_at`

### `vendor_master`

One row per company / organization.

Suggested fields:

- `id`
- `company_name`
- `normalized_name`
- `is_active`
- `notes`
- `primary_office_id`
- `created_at`
- `updated_at`

Notes:

- do not store operational country here
- do not store vendor type here
- do not store contact data here
- `primary_office_id` is the single source of truth for the vendor's main office

### `vendor_offices`

One row per office / branch.

Suggested fields:

- `id`
- `vendor_id`
- `office_name`
- `city_name`
- `state_name`
- `country_name`
- `address_raw`
- `external_code`
  - useful for WCA code / imported office code where available
- `specialization_raw`
- `is_active`
- `is_iata_certified`
- `does_sea_freight`
- `does_project_cargo`
- `does_own_consolidation`
- `does_own_transportation`
- `does_own_warehousing`
- `does_own_custom_clearance`
- `created_at`
- `updated_at`

Why these booleans live here:

- they describe what that office can do
- they come directly from WCA columns like `IATA`, `Sea`, `Project`, `Own Consolidation`, etc
- the main office is selected via `vendor_master.primary_office_id`, not a duplicate boolean on this table

### `vendor_office_ports`

This replaces the more complex `vendor_office_coverage` idea for phase 1.

Purpose:

- link an office to one or more ports
- allow one office to support multiple air / sea ports

Suggested fields:

- `id`
- `office_id`
- `port_id`
- `is_primary`
- `notes`
- `created_at`
- `updated_at`

Practical rules:

- one vendor should not have two offices with the same `office_name`
- one office can have many ports, but only one can be marked primary

### `vendor_contacts`

One row per contact person.

Suggested fields:

- `id`
- `office_id`
- `contact_name`
- `salutation`
- `designation`
- `email_primary`
- `email_secondary`
- `mobile_1`
- `mobile_2`
- `landline`
- `whatsapp_number`
- `is_primary`
- `is_active`
- `notes`
- `created_at`
- `updated_at`

Practical rule:

- one office can have many contacts, but only one should be marked primary

### `vendor_cc_recipients`

Keep this simple in phase 1.

Purpose:

- store extra CC email IDs that are not necessarily the main contact person

Suggested fields:

- `id`
- `office_id`
- `email`
- `is_active`
- `created_at`
- `updated_at`

### `vendor_type_master`

This is the list of vendor categories / types.

Suggested fields:

- `id`
- `type_code`
- `type_name`
- `description`
- `sort_order`
- `is_active`
- `created_at`
- `updated_at`

Initial type candidates from OG data:

- `TRANSPORTER`
- `CFS_BUFFER_YARD`
- `CHA`
- `IATA`
- `CO_LOADER`
- `CARRIER`
- `SHIPPING_LINE`
- `PACKER`
- `LICENSING`
- `WCA_AGENT`

### `vendor_office_type_map`

This connects an office to one or more types.

Suggested fields:

- `id`
- `office_id`
- `vendor_type_id`
- `is_active`
- `created_at`
- `updated_at`

Why this stays separate:

- the same company can appear in multiple sheet categories
- different offices of the same company may support different functions

## What To Normalize vs Keep Raw

### Normalize

- company identity
- office identity
- contacts
- cc emails
- office to port linkage
- office type linkage
- capability flags

### Keep raw for traceability

- original location text
- original specialization text
- imported office / WCA code

This gives us an auditable import trail without forcing the live schema to remain messy.

## Recommended Import Strategy

### Domestic workbook (`Data Base- Export.xlsx`)

Interpretation:

- sheet name contributes vendor type
- company name maps to `vendor_master`
- location maps to `vendor_offices`
- name/email/mobile maps to `vendor_contacts`
- `CC Id` maps to `vendor_cc_recipients`

### WCA workbook (`WCA Mail Merge Nagarkot.xlsx`)

Interpretation:

- country sheet contributes geography and vendor type `WCA_AGENT`
- company name + state/city cluster maps to `vendor_master` + `vendor_offices`
- email/name/designation/contact maps to `vendor_contacts`
- capability columns map directly to office boolean fields
- `CODE` should be stored as `external_code`

### Import workbook (`Data Base- Import.xlsx`)

Use this later as the outbound/inbound managed template for admin bulk uploads, not as the initial data source.

## Practical Rebuild Plan

### Phase 1

- build `port_master` from an external source
- rebuild vendor schema using the agreed simplified model
- import domestic + WCA source into normalized tables
- expose admin CRUD on top of this model

### Phase 2

- improve office-to-port linking quality
- add stronger dedupe / merge workflow for same vendor across sheets
- only add smarter quote routing if operations actually need automation later

## Key Recommendation

When we rebuild vendor master, the OG Excel files should be treated as:

- source-of-truth seed data
- input to a normalization pipeline
- not a shape to reproduce table-for-table in Postgres

The right system is:

- normalized in the database
- traceable back to workbook/sheet/row source
- editable in app after import
