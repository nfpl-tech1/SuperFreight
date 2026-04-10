# Vendor Database Import — Design Plan

## 1. Data Sources

| File | Sheet | Rows | What It Contains |
|---|---|---|---|
| `Carrier Master.xlsx` | EXPORT SERVICE LIST | 7,592 | Destination port -> carrier -> contact (134 unique carriers, 1,209 ports) |
| `Carrier Master.xlsx` | Mumbai CARRIER MASTER | 162 | POL=Mumbai, carrier type (NVOCC/SL), contacts |
| `Carrier Master.xlsx` | Chennai Carrier Master | 141 | POL=Chennai, carrier type (NVOCC/SL), contacts |
| `Carrier Master.xlsx` | Egypt Carrier Master | 91 | POL=Sokhna, carrier type, contacts |
| `Carrier Master.xlsx` | BackendRef | 268 | Port-to-country mapping, unique carrier list, POL list |
| `Regular WCA Agents.xlsx` | 12 country sheets | 136 | Overseas agents by country with capability flags |
| `Data Base- Export.xlsx` | Transporter | 66 | Domestic transporters: company, contact, location, speciality |
| `Data Base- Export.xlsx` | CFS Buffer Yard | 43 | CFS/Buffer Yard facilities with addresses |
| `Data Base- Export.xlsx` | CHA | 11 | Custom House Agents with location |
| `Data Base- Export.xlsx` | IATA (Mum) | 63 | Air freight agents in Mumbai (1 contact per row) |
| `Data Base- Export.xlsx` | IATA (Del) | 210 | Air freight agents in Delhi (2-5 contacts per company) |
| `Data Base- Export.xlsx` | IATA (Ahm) | 36 | Air freight agents in Ahmedabad (multi-contact) |
| `Data Base- Export.xlsx` | IATA (Maa) | 163 | Air freight agents in Chennai (multi-contact) |
| `Data Base- Export.xlsx` | Co-Loader | 23 | Sea consolidators |
| `Data Base- Export.xlsx` | Carrier Master | 304 | Carriers for Mumbai/Chennai/Kattupalli with type |
| `Data Base- Export.xlsx` | Packers | 3 | Packing service providers |
| `Data Base- Import.xlsx` | Co-Loader | 29 | Import co-loaders (4 overlap with export) |
| `Data Base- Import.xlsx` | Transporter | 4 | Import transporters (1 overlap with export) |
| `Data Base- Import.xlsx` | Shipping Line | 20 | Shipping lines for import |

### Cross-file overlap summary
- **Carrier Master.xlsx** EXPORT SERVICE LIST vs **Export DB** Carrier Master: 105 common carriers (after normalization), 69 only in Export DB, 26 only in Carrier Master.xlsx
- **WCA Agents** vs **Export DB**: zero overlap (entirely different companies)
- **IATA** vs **Carriers**: 1 overlap ("Transglobal") — essentially disjoint vendor pools
- **Export Transporters** vs **Import Transporters**: 1 overlap ("Fast Roadways")
- **Mumbai vs Chennai Carrier Masters**: 126 common carriers, but only 3 have different contacts per city

---

## 2. Entity-by-Entity Field Analysis

### 2.1 VendorMaster

| Field | Keep? | Reasoning |
|---|---|---|
| `id` (UUID PK) | **Yes** | Standard PK |
| `companyName` | **Yes** | Display name as originally entered (e.g., "Aahil Shipping and Logistics") |
| `normalizedName` (unique) | **Yes** | Uppercase, stripped of punctuation/suffixes — the dedup key. "AAHIL SHIPPING AND LOGISTICS" matches across all sheets regardless of casing or "Pvt Ltd" suffixes |
| `isActive` | **Yes** | Soft delete — some vendors may become inactive |
| `notes` | **Yes** | Free-text for human notes. Data sources have a "REMARKS" column (Mumbai Carrier Master) |
| `primaryOfficeId` | **Reconsider** | Points to one VendorOffice. **Issue**: This is a forward FK from parent to child, which is unusual and creates a circular dependency (vendor -> office -> vendor). **However**, it's useful for "which office is the HQ?" which the UI needs for quick display. **Keep but make it a convenience pointer set after offices are created, not a hard FK constraint.** |
| `createdAt` / `updatedAt` | **Yes** | Standard audit timestamps |

**Verdict: No changes needed.**

---

### 2.2 VendorOffice

| Field | Keep? | Reasoning |
|---|---|---|
| `id` (UUID PK) | **Yes** | Standard PK |
| `vendorId` (FK) | **Yes** | Parent company link |
| `officeName` | **Yes** | Unique per vendor. Derived from city: "Mumbai Office", "Shanghai Office". For carriers it's the POL city. For WCA agents it's the country-city. |
| `cityName` | **Yes** | The city where this office operates. Mumbai, Chennai, Shanghai, etc. |
| `stateName` | **Yes** | WCA agents have STATE column. IATA Delhi/Ahm/Maa contacts don't. Nullable is correct. |
| `countryName` | **Yes** | Critical for WCA agents (sheet name = country). For domestic vendors this is always "India". |
| `addressRaw` | **Yes** | CFS/Buffer Yard entries have full physical addresses. Transporters and carriers don't. Nullable is correct. |
| `externalCode` | **Yes** | WCA agents have a CODE column ("AMA", "CTS", "SHE"). Not present in other sources. Nullable is correct. |
| `specializationRaw` | **Yes** | Transporters have speciality ("FCL", "Loose Cargo", "Reefer"). WCA agents have "Specialisation (if any)". Free text is appropriate since values are inconsistent. |
| `isActive` | **Yes** | Soft delete |
| `isIataCertified` | **Yes** | WCA agents have explicit "IATA: Yes/No" column. Maps directly. |
| `doesSeaFreight` | **Yes** | WCA agents: "Sea: Yes/No" column. For carriers/shipping lines this is implicitly true. |
| `doesProjectCargo` | **Yes** | WCA agents: "Project" column. Rarely filled but worth keeping. |
| `doesOwnConsolidation` | **Yes** | WCA agents: "Own Consolidation" column. |
| `doesOwnTransportation` | **Yes** | WCA agents: "OwnTransportation" column. |
| `doesOwnWarehousing` | **Yes** | WCA agents: "Own Warehousing" column. |
| `doesOwnCustomClearance` | **Yes** | WCA agents: "Own Custom Clearance" column. |
| `createdAt` / `updatedAt` | **Yes** | Standard |

#### Overlap & Redundancy Analysis

**`cityName` + `countryName` vs `officeName`**: `officeName` is a human label derived from city/country. It's NOT redundant because `officeName` is the unique-per-vendor display key (could be "Mumbai HQ" vs "Mumbai Warehouse"), while `cityName` is for filtering/searching.

**Capability booleans (6 flags)**: These come exclusively from WCA Agent data. For all other vendor types (carriers, transporters, CHA, etc.), the vendor type itself implies the capability — a TRANSPORTER inherently "does own transportation", a CHA inherently "does own custom clearance". **However**, the booleans are still useful because a WCA agent might offer MULTIPLE capabilities that don't map to a single vendor type. A WCA agent in Shanghai might do sea freight + own consolidation + own warehousing. The booleans capture this multi-capability profile that the type system alone cannot.

**`isIataCertified`**: Only meaningful for WCA agents and IATA vendors. For carriers it's irrelevant. But it's a simple boolean and doesn't hurt to have it nullable-false (default false). No change needed.

**`specializationRaw`**: Free text is correct. Transporter specialities ("FCL", "Loose Cargo", "Reefer Transporter") are too inconsistent to enum-ify. Same for WCA "Specialisation (if any)".

**Verdict: No changes needed. All fields serve distinct purposes.**

---

### 2.3 VendorContact

| Field | Keep? | Reasoning |
|---|---|---|
| `id` (UUID PK) | **Yes** | |
| `officeId` (FK) | **Yes** | Every contact belongs to one office |
| `contactName` | **Yes** | Full name. Assembled from First+Last for WCA/Chennai. Single "Name" column for others. |
| `salutation` | **Yes** | WCA agents have "Salutation" column ("Mr", "Ms"). Most other sources don't. Nullable. |
| `designation` | **Yes** | WCA: "DESIGNATION" column. IATA Del/Ahm/Maa: "Designation" column. Carrier Masters: none. Nullable. |
| `emailPrimary` | **Yes** | The TO email. Every source has this. |
| `emailSecondary` | **Yes** | IATA Mumbai has "Email id 2" column. Some sources have "Additional IDs". |
| `mobile1` | **Yes** | Contact number / mobile. |
| `mobile2` | **Yes** | Some sources have a second mobile column. |
| `landline` | **Yes** | Some contacts have office landlines (CFS entries, some IATA). |
| `whatsappNumber` | **Yes** | Not present in any current source data, but relevant for freight industry communication. Keep for manual entry. |
| `isPrimary` | **Yes** | One primary contact per office. First contact listed in a source is typically primary. |
| `isActive` | **Yes** | Soft delete |
| `notes` | **Yes** | Mumbai Carrier Master has "REMARKS" column. |
| `createdAt` / `updatedAt` | **Yes** | Standard |

#### Overlap Analysis

**`emailPrimary` vs `emailSecondary`**: Not redundant. emailPrimary is the TO address for RFQs. emailSecondary is a fallback or alternate. Source data clearly distinguishes these (separate columns).

**`mobile1` vs `mobile2`**: Same pattern. Some sources list two mobile numbers in separate columns.

**`contactName` vs `salutation`**: Not redundant. `contactName` = "Rajiv Vishwakarma", `salutation` = "Mr". Salutation is for email greeting ("Dear Mr. Vishwakarma"). Name is for display/search.

**`landline` vs `mobile1`**: Different number types. CFS/Buffer Yard entries often have office landlines, not mobiles.

**`whatsappNumber`**: No source data populates this currently. It's a forward-looking field for manual entry. Keep — freight industry heavily uses WhatsApp.

**Verdict: No changes needed. No true redundancy.**

---

### 2.4 VendorCcRecipient

| Field | Keep? | Reasoning |
|---|---|---|
| `id` (UUID PK) | **Yes** | |
| `officeId` (FK) | **Yes** | CC recipients are per-office |
| `email` | **Yes** | The CC email address |
| `isActive` | **Yes** | Can deactivate a CC recipient |
| `createdAt` / `updatedAt` | **Yes** | Standard |

#### Why a separate entity vs VendorContact.emailSecondary?

CC recipients are NOT contacts — they're email addresses that should be CC'd on RFQ emails but may not be people you'd call or address by name. Example: "crmlogistics14@acplcargo.com" is a department inbox, not a person. The Export DB "CC Id" column often has these generic addresses. A VendorContact represents a person; a CcRecipient represents an email endpoint.

**Also**: One office can have multiple CC recipients (some entries have "email1; email2; email3" in the CC column). The separate entity handles this cleanly.

**Verdict: No changes needed. Correctly separated from VendorContact.**

---

### 2.5 VendorTypeMaster

| Type Code | Maps To Source | Reasoning |
|---|---|---|
| `TRANSPORTER` | Export/Import DB "Transporter" tabs | Road freight vendors |
| `CFS_BUFFER_YARD` | Export DB "CFS Buffer Yard" tab | Container freight stations, buffer yards, warehouses |
| `CHA` | Export DB "CHA" tab | Custom House Agents |
| `IATA` | Export DB "IATA (Mum/Del/Ahm/Maa)" tabs | Air freight forwarding agents with IATA certification |
| `CO_LOADER` | Export/Import DB "Co-Loader" tabs | Sea freight consolidators |
| `CARRIER` | Carrier Master Type="NVOCC" | NVOCCs (Non-Vessel Operating Common Carriers) |
| `SHIPPING_LINE` | Carrier Master Type="SL", Import DB "Shipping Line" | Vessel-operating shipping lines |
| `PACKER` | Export DB "Packers" tab | Packing service providers |
| `LICENSING` | Export DB "Licensing" tab (empty) | Licensing agents — placeholder for future |
| `WCA_AGENT` | Regular WCA Agents (all sheets) | Overseas freight forwarding partners |

#### Do we need more types?

**No.** Every sheet in every source file maps to exactly one of these 10 types. The Import DB "Shipping Line" maps to the existing `SHIPPING_LINE` type. No source data introduces a vendor category not covered.

#### Could types be consolidated?

- **CARRIER vs SHIPPING_LINE**: These are genuinely different. NVOCCs don't own vessels; shipping lines do. They have different contract terms, pricing, and the RFQ process differs. Keep separate.
- **IATA vs WCA_AGENT**: Both are freight forwarders, but IATA agents are domestic (Mumbai/Delhi/etc.) while WCA agents are overseas. Different sourcing contexts. Keep separate.
- **CHA vs CO_LOADER**: Different services entirely. Keep separate.

**Verdict: No changes needed. 10 types are correct and complete.**

---

### 2.6 VendorOfficeTypeMap

| Field | Keep? | Reasoning |
|---|---|---|
| `id` (UUID PK) | **Yes** | |
| `officeId` (FK) | **Yes** | |
| `vendorTypeId` (FK) | **Yes** | |
| `isActive` | **Yes** | Can deactivate a type assignment |
| `createdAt` / `updatedAt` | **Yes** | Standard |

**Why many-to-many?** A single office could be both a CARRIER and a CO_LOADER (some NVOCCs also do consolidation). The Export DB "Carrier Master" sheet has carriers that also appear in "Co-Loader". The junction table handles this without duplicating the office.

**Verdict: No changes needed.**

---

### 2.7 PortMaster

| Field | Keep? | Reasoning |
|---|---|---|
| `id` (UUID PK) | **Yes** | |
| `code` | **Yes** | Synthetic code (e.g., "SEA-0001"). Unique per portMode. |
| `name` | **Yes** | Display name: "Nhava Sheva", "Ho Chi Minh" |
| `normalizedName` | **Yes** | For matching: "NHAVASHEVA", "HOCHIMINH". Critical for dedup against messy source data. |
| `cityName` | **Overlaps with `name`** | For many ports, cityName = name (e.g., port "Chennai", city "Chennai"). **However**, for ports like "Nhava Sheva" the city is "Navi Mumbai". For "JNPT" the city is also "Navi Mumbai". Port name != city name. **Keep — not redundant.** |
| `normalizedCityName` | **Yes** | For city-based searching/matching |
| `stateName` | **Yes** | Nullable. Useful for Indian ports (Maharashtra, Gujarat, Tamil Nadu). |
| `countryName` | **Yes** | Essential. BackendRef gives us port->country. |
| `normalizedCountryName` | **Yes** | For country-based filtering |
| `portMode` (AIRPORT/SEAPORT) | **Yes** | The same city can have both (e.g., Mumbai has a seaport and an airport). Different entities. |
| `regionId` (FK) | **Yes** | Links to RegionMaster for geographic grouping |
| `unlocode` | **Yes** | UN/LOCODE (e.g., "INMAA" for Chennai). Port master.xlsx has IATA codes. Nullable — not all ports have standard codes. |
| `sourceConfidence` | **Yes** | Tracks data quality: "MANUAL_MINIMAL" for seed data, "IMPORT_CARRIER_MASTER" for imported. Helps prioritize manual review. |
| `isActive` | **Yes** | |
| `notes` | **Yes** | |
| `createdAt` / `updatedAt` | **Yes** | |

#### Overlap Analysis

**`name` vs `normalizedName`**: Not redundant. `name` is for display ("Ho Chi Minh City"), `normalizedName` is for matching ("HOCHIMINHCITY"). Both needed.

**`cityName` vs `name`**: Overlaps ~70% of the time but genuinely different for multi-port cities and ports with non-city names.

**`countryName` vs `normalizedCountryName`**: Same pattern as name/normalizedName. Display vs matching. "Ivory Coast" vs "IVORYCOAST".

**`code` vs `unlocode`**: `code` is our internal synthetic ID ("SEA-0275"). `unlocode` is the international standard ("INMAA"). Different namespaces.

**Verdict: No changes needed. All fields serve distinct purposes.**

---

### 2.8 PortAlias

| Field | Keep? | Reasoning |
|---|---|---|
| `id` (UUID PK) | **Yes** | |
| `portId` (FK) | **Yes** | Points to canonical port |
| `alias` | **Yes** | The variant name as found in source: "AAHUS", "Aarhus" |
| `normalizedAlias` | **Yes** | For lookup: "AAHUS" |
| `countryName` | **Yes** | Disambiguates: "Alexandria" could be Egypt or USA |
| `portMode` | **Yes** | Disambiguates: same name could be airport or seaport |
| `isPrimary` | **Yes** | One alias can be marked as the "preferred" display name |
| `sourceWorkbook` / `sourceSheet` | **Yes** | Audit trail: where was this alias found? |
| `createdAt` / `updatedAt` | **Yes** | |

**Verdict: No changes needed. Essential for fuzzy port matching.**

---

### 2.9 VendorOfficePort

| Field | Keep? | Reasoning |
|---|---|---|
| `id` (UUID PK) | **Yes** | |
| `officeId` (FK) | **Yes** | Which vendor office serves this port |
| `portId` (FK) | **Yes** | Which port |
| `isPrimary` | **Yes** | One primary port per office (the POL for carriers) |
| `notes` | **Yes** | |
| `createdAt` / `updatedAt` | **Yes** | |

#### Key question: What does this link mean?

For the EXPORT SERVICE LIST, each row says "carrier X can ship to port Y." The office is the carrier's local office (e.g., Mumbai). The port is the destination. So this link means **"this office serves this destination port."**

For the city carrier masters (Mumbai/Chennai), the POL (Port of Loading) IS the office's city. So the Mumbai office's `isPrimary` port would be the JNPT/Nhava Sheva port.

**This dual meaning (destination ports + home port) is fine** — the `isPrimary` flag distinguishes them. The primary port is the office's home/loading port; non-primary ports are destinations they serve.

**Verdict: No changes needed.**

---

### 2.10 ServiceLocationMaster

| Field | Keep? | Reasoning |
|---|---|---|
| `id` (UUID PK) | **Yes** | |
| `name` | **Yes** | "Bhiwandi", "PAN India", "Dronagiri Warehousing Complex" |
| `normalizedName` | **Yes** | For matching |
| `cityName` / `normalizedCityName` | **Yes** | Location city. For "PAN India" this would be null. |
| `stateName` | **Yes** | "Maharashtra", "Gujarat" |
| `countryName` / `normalizedCountryName` | **Yes** | Always "India" for current data |
| `locationKind` | **Yes** | `INLAND_CITY` for transporter locations, `CFS` for CFS facilities, `ICD` for inland depots |
| `regionId` (FK) | **Yes** | Geographic grouping |
| `isActive` | **Yes** | |
| `notes` | **Yes** | |
| `createdAt` / `updatedAt` | **Yes** | |

#### How source data maps here

- **Transporter "Location" column**: Values like "Mumbai/ Gujarat/ Pune", "PAN India" → these are service AREAS, not single points. We'd create one ServiceLocation per distinct city/region mentioned, then link the office to each via VendorOfficeServiceLocation.
- **CFS "Location" column**: Full addresses → one ServiceLocation per facility with kind=CFS, addressRaw in notes.

**Verdict: No changes needed.**

---

### 2.11 ServiceLocationAlias

Same pattern as PortAlias. Handles variant names for inland locations.

**Verdict: No changes needed.**

---

### 2.12 VendorOfficeServiceLocation

Same pattern as VendorOfficePort but for inland locations.

**Verdict: No changes needed.**

---

### 2.13 RegionMaster + CountryRegionMap

RegionMaster holds geographic sectors. CountryRegionMap links countries to sectors. BackendRef has 89 unique countries. These need to be mapped to regions during import.

**Verdict: No changes needed.**

---

### 2.14 ImportSourceAudit

| Field | Keep? | Reasoning |
|---|---|---|
| `sourceWorkbook` | **Yes** | "Carrier Master.xlsx", "Data Base- Export.xlsx", etc. |
| `sourceSheet` | **Yes** | "EXPORT SERVICE LIST", "Transporter", etc. |
| `sourceRowNumber` | **Yes** | For traceability back to the Excel row |
| `entityKind` | **Yes** | What was created/skipped |
| `action` | **Yes** | CREATED, UPDATED, SKIPPED, REVIEW_REQUIRED |
| `confidence` | **Yes** | Quality signal: exact match vs fuzzy match |
| `normalizedKey` | **Yes** | The key used for matching (normalized company name, port name) |
| `vendorId` / `officeId` / `portId` / `serviceLocationId` | **Yes** | Links to affected entities |
| `reason` | **Yes** | Human-readable explanation for SKIPPED/REVIEW_REQUIRED |
| `rawPayloadJson` | **Yes** | The original row data as JSON for debugging |
| `createdAt` | **Yes** | |

**Verdict: No changes needed. Comprehensive audit trail.**

---

## 3. Cross-Entity Redundancy Check

### 3.1 Fields that APPEAR redundant but are NOT

| Apparent Overlap | Why Both Are Needed |
|---|---|
| `VendorMaster.companyName` vs `VendorOffice.officeName` | Company = "Aahil Shipping and Logistics"; Office = "Mumbai Office". Different granularity. |
| `VendorOffice.cityName` vs `VendorOfficePort.portId→PortMaster.cityName` | Office city is WHERE the office is. Port city is what port they SERVE. A Mumbai office serves the Chennai port. |
| `VendorOffice.countryName` vs `PortMaster.countryName` | Office country (India) vs port country (Vietnam). |
| `VendorContact.emailPrimary` vs `VendorCcRecipient.email` | Contact email = TO address (a person). CC email = department inbox CC'd on communications. |
| `VendorContact.emailSecondary` vs `VendorCcRecipient.email` | emailSecondary = alternate email for the SAME person. CcRecipient = different recipient entirely. |
| `PortMaster.name` vs `PortMaster.cityName` | Port = "Nhava Sheva"; City = "Navi Mumbai". Or Port = "JNPT"; City = "Navi Mumbai". |
| `PortMaster.code` vs `PortMaster.unlocode` | Internal synthetic code vs international standard code. |
| `VendorOffice.isIataCertified` vs `VendorOfficeTypeMap(IATA)` | Subtly different. `isIataCertified` = this office has IATA certification (a property). TypeMap IATA = this vendor IS an IATA agent (a classification). A WCA agent can be IATA-certified without being classified as an IATA-type vendor. |
| `VendorOffice` capability booleans vs `VendorOfficeTypeMap` | Type = what the vendor IS (carrier, transporter). Capabilities = what they CAN DO (sea freight, warehousing). A WCA_AGENT type can do sea freight + warehousing + custom clearance. |
| `PortMaster.normalizedName` vs `PortAlias.normalizedAlias` | normalizedName is the canonical form. Aliases are variant forms that resolve to the same port. |

### 3.2 Implied fields — where one field logically follows from another

| Implied Relationship | Assessment |
|---|---|
| `VendorOffice.doesSeaFreight=true` → vendor type should include CARRIER or SHIPPING_LINE? | **No.** A WCA agent can do sea freight without being a carrier. The boolean is a capability; the type is a classification. |
| `VendorOffice.doesOwnCustomClearance=true` → vendor type should include CHA? | **No.** Same reasoning. A WCA agent doing their own custom clearance is not a CHA vendor. |
| `VendorOffice.isIataCertified=true` → `VendorOffice.doesAirFreight`? | **Possible implication**, but there IS no `doesAirFreight` boolean. The WCA data has "MODE" column (Sea/Air) and "IATA" column (Yes/No) separately. An IATA-certified office might primarily do sea freight. **No action needed — we don't have a `doesAirFreight` flag, and the IATA boolean covers it.** |
| Carrier type NVOCC → `VendorOffice.doesSeaFreight=true`? | **Yes, this IS implied.** But we only set capability booleans from WCA agent data. For carriers we just set the type. This is fine — when querying "who does sea freight?" we check BOTH the type (CARRIER/SHIPPING_LINE) AND the boolean. |

### 3.3 Missing fields — gaps revealed by source data

| Gap | Source Evidence | Recommendation |
|---|---|---|
| **No `doesAirFreight` boolean** | WCA MODE column has "Air" as a value. IATA agents are implicitly air freight. | **Not needed.** The WCA "MODE" is captured by checking if vendorType = IATA or WCA_AGENT + isIataCertified. The `doesSeaFreight` boolean exists because sea capability is the default WCA question; air is the exception captured by IATA certification. Adding `doesAirFreight` would be redundant with `isIataCertified`. |
| **No `carrierType` (NVOCC vs SL)** | Mumbai/Chennai/Egypt carrier masters have a "Type" column. | **Already handled** by VendorOfficeTypeMap: NVOCC maps to CARRIER type, SL maps to SHIPPING_LINE type. |
| **No `tradeDirection` (Export vs Import)** | Data comes from Export and Import databases. | **Not needed at entity level.** A vendor can serve both export and import. The "Export" vs "Import" distinction is about the INQUIRY, not the vendor. When creating an RFQ, the system filters vendors by capability, not by export/import label. |
| **No `remarksRaw`** on VendorOffice | Mumbai Carrier Master has "REMARKS" column with notes like "yes", "Sokhna, Saudi". | **Already covered** by `VendorOffice.specializationRaw` (for capability notes) and `VendorContact.notes` (for contact-specific remarks). |

---

## 4. Structural Assessment — What's Right About the Current Design

### 4.1 The VendorMaster → VendorOffice → VendorContact hierarchy

This is the correct 3-level hierarchy because the data proves it:
- **Same company, different cities**: "AIYER SHIPPING" has Deepanshu in Mumbai, Kalai in Chennai. One VendorMaster, two VendorOffices, one VendorContact each.
- **Same company, same city, multiple contacts**: IATA Delhi has "Aargus Global Logistics" with 5 contacts. One VendorMaster, one VendorOffice (Delhi), five VendorContacts.
- **Same company across data sources**: "Fast Roadways" appears in both Export and Import Transporter sheets. One VendorMaster, one VendorOffice, contacts merged.

### 4.2 The Type system (VendorTypeMaster + VendorOfficeTypeMap)

Correct separation of concerns:
- Types are at the OFFICE level, not the vendor level. This matters because a company's Mumbai office might be classified as CARRIER while their Delhi office might also do CO_LOADER services.
- Many-to-many handles multi-role offices correctly.

### 4.3 The Port/ServiceLocation dual-track

Correct because ports (sea/air) and inland locations (ICDs, CFS, cities) are fundamentally different:
- Carriers serve PORTS (loading/destination)
- Transporters serve SERVICE LOCATIONS (cities, inland depots)
- CFS operators ARE at service locations
- The query patterns are different: "find me a carrier to Ho Chi Minh" (port query) vs "find me a transporter in Bhiwandi" (service location query)

---

## 5. Import Pipeline Order

### Phase 1: Port Enrichment
1. Load BackendRef port→country mapping (260 entries)
2. Load existing PortMaster entries
3. For each of 1,209 EXPORT SERVICE LIST port names:
   - Normalize → try match existing port (by normalizedName or PortAlias)
   - If match → create PortAlias for the variant
   - If no match → create new PortMaster (using BackendRef for country), sourceConfidence = "IMPORT_CARRIER_MASTER"
4. Write ImportSourceAudit for each action

### Phase 2: Domestic Vendors (Export DB)
Process each tab:
- **Transporter** (66 rows) → VendorMaster + VendorOffice + VendorContact + TypeMap(TRANSPORTER) + ServiceLocation links for coverage areas
- **CFS Buffer Yard** (43 rows) → VendorMaster + VendorOffice + VendorContact + TypeMap(CFS_BUFFER_YARD) + ServiceLocation for facility
- **CHA** (11 rows) → VendorMaster + VendorOffice + VendorContact + TypeMap(CHA)
- **IATA (Mum/Del/Ahm/Maa)** → Group by company+city → VendorMaster + VendorOffice per city + multiple VendorContacts per office + TypeMap(IATA)
- **Co-Loader** (23 rows) → VendorMaster + VendorOffice + VendorContact + TypeMap(CO_LOADER)
- **Packers** (3 rows) → VendorMaster + VendorOffice + VendorContact + TypeMap(PACKER)

### Phase 3: Carriers (Carrier Master.xlsx)
1. Process Mumbai/Chennai/Egypt city masters → create/update VendorMaster + VendorOffice per POL city + VendorContact + TypeMap(CARRIER or SHIPPING_LINE)
2. Process Export DB Carrier Master (304 rows) → merge with above
3. Process EXPORT SERVICE LIST (7,592 rows) → create VendorOfficePort links (carrier office → destination port)

### Phase 4: WCA Agents (Regular WCA Agents.xlsx)
- 12 country sheets → VendorMaster + VendorOffice (city+country) + VendorContact + TypeMap(WCA_AGENT) + set capability booleans + externalCode from CODE column

### Phase 5: Import DB
- Co-Loader (29) → merge with Phase 2 co-loaders where overlap exists
- Transporter (4) → merge with Phase 2 transporters
- Shipping Line (20) → VendorMaster + VendorOffice + VendorContact + TypeMap(SHIPPING_LINE)

### Phase 6: Audit & Report
- Generate summary report: entities created/updated/skipped per source
- Flag REVIEW_REQUIRED entries for manual inspection
- Report unmatched ports that need manual country assignment

---

## 6. Estimated Data Volume

| Entity | Estimated Rows |
|---|---|
| VendorMaster | ~550 unique companies |
| VendorOffice | ~700 |
| VendorContact | ~1,200 |
| VendorCcRecipient | ~150 |
| VendorOfficeTypeMap | ~750 |
| VendorOfficePort | ~8,000 |
| PortMaster (new) | ~900 new (on top of existing ~275) |
| PortAlias (new) | ~500 |
| ServiceLocationMaster | ~80 |
| VendorOfficeServiceLocation | ~120 |
| ImportSourceAudit | ~12,000 |

---

## 7. Final Verdict

**The existing schema requires ZERO structural changes.** All 15 entities, their fields, relationships, and indexes are correctly designed for the data at hand. The schema was built anticipating exactly these import patterns.

The work ahead is purely in the **import pipeline**: parsing Excel files, normalizing names, matching/creating entities, and writing audit trails.
