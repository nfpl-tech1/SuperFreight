# Port Backlog Status Report

Generated: 2026-04-10

## Current Snapshot

Source of truth at this checkpoint:

- `reports/carrier-export-coverage.summary.json`
- `reports/port_unresolved.unresolved.json`
- `reports/port_unresolved.grouped.json`
- `reports/port_unresolved.manual-review.json`

Current dry-run totals:

- `matched`: 8536
- `port_unresolved`: 887
- `port_ambiguous`: 36
- `vendor_not_in_master`: 428
- `office_unresolved`: 184
- `rowsReadyToLink`: 8536
- `uniqueOfficePortPairsReady`: 7578
- `linksAlreadyPresent`: 8499

Current unresolved seaport queue split:

- total unresolved rows: 887
- grouped unresolved labels: 243
- manual-review rows: 275
- manual-review labels: 38
- active rows still needing resolution work: 612
- active labels still needing resolution work: 205

## What Has Been Done

### 1. Report cleanup and working-set reduction

Historical and resolved report artifacts were removed from `reports/` so the folder now centers on the active backlog and the reports we actually use to drive the cleanup.

Removed or archived from the active working set:

- old resolved/unresolved split artifacts from earlier checkpoints
- old ambiguity report outputs
- old synthetic-port audit outputs
- other historical-only JSON and CSV files that were no longer part of the live queue

### 2. New helper scripts were added to make the backlog easier to work

Created:

- `scripts/apply-curated-port-aliases.ts`
- `scripts/export-port-unresolved-from-review.ts`
- `scripts/apply-curated-seaport-master-fixes.ts`

Package scripts added:

- `ports:apply-curated-aliases`
- `ports:apply-curated-master-fixes`
- `vendors:export:port-unresolved`

These let us:

- apply safe alias fixes repeatedly
- regenerate unresolved reports from a fresh dry-run review JSON
- add or update canonical seaport master records when the issue is master-data coverage rather than text cleanup

### 2a. Synthetic seaport and service-location cleanup is now deployment-safe

The local synthetic cleanup work is no longer just local DB state. It has now
been promoted into a real business migration:

- `src/database/migrations/business/2026041009000-BusinessSyntheticLocationReconciliation.ts`

This migration captures the previously local reconciliations for:

- synthetic seaport to service-location migrations:
  `SEA-0119`, `SEA-0244`, `SEA-0064`
- curated synthetic seaport splits:
  `SEA-0168`, `SEA-0217`

What that means operationally:

- fresh environments can now replay this cleanup through normal business
  migrations
- deployment parity for this synthetic-location work is now solved
- these reconciliations no longer depend on manual local post-processing

### 3. Safe alias-based backlog reduction was applied

Curated alias fixes were added for known label variants and misspellings. Examples include:

- `Ba Ria Vung Tau`
- `Ba Ria Vung Tau (Cai Mep)`
- `Port Said West`
- `Port Said East`
- `Da Chen Bay`
- `Lazaro Cardinas`
- `Lazaro Cardinos`
- `King Abdullah`
- `Khalifa - Auh`
- `Khalifa (Abu Dhabhi)`
- `Sanshui New Port`
- `Bandar Bushehr`
- `North Manila`
- `Port Everglades / Miami`

Measured effect of the alias pass:

- `matched` improved from 8469 to 8517
- `port_unresolved` dropped from 959 to 906

### 4. Canonical seaport master fixes were applied where the DB only had airport coverage

Master-data fixes were applied for cases where the seaport importer could not match because the same UN/LOCODE existed only as an airport or did not yet have the needed seaport alias in the live DB.

Applied:

- created canonical `SEAPORT` record for `CHBSL Basel`
- created canonical `SEAPORT` record for `PYASU Asuncion`
- added `Freeport` alias to the existing `BSFPO` seaport record

Measured effect of the master-data pass:

- `matched` improved from 8517 to 8536
- `port_unresolved` dropped from 906 to 887

Resolved by this pass:

- `BASEL`
- `ASUNCION`
- `FREEPORT`

### 5. Manual-review classification was expanded using official sources

The manual-review report was expanded to pull out labels that should not be auto-mapped as seaports. These are mainly:

- inland cities
- ICD or dry-port labels
- airport-only locations
- country-only labels
- province-only labels
- broad region/state labels
- labels with no defensible one-to-one seaport mapping

The manual-review set now includes 38 labels and 275 rows. High-volume examples:

- `RIYADH` 20
- `ICD DHAKA` 18
- `JOHANNESBURG` 15
- `DHAKA` 12
- `YUNFU` 10
- `LILONGWE` 8
- `FUJIAN` 7
- `ICD DHAKA KAMALAPUR` 7
- `INDONESIA` 7
- `NANCHANG` 7
- `NIGERIA` 7

Additional labels moved into manual review during the latest passes include:

- `CHRISTCHURCH`
- `CIKARANG`
- `MEXICO CITY`
- `MEXICO CITY PANTACO`
- `CANTON`
- `HANKOW HANKOU`
- `CANTON ISLAND`
- `PEKAN BARU`
- `NEW JERSEY`
- multiple country-only labels such as `JAPAN`, `KAZAKHSTAN`, `KYRGYZSTAN`, `LAOS`, `MOLDOVA`, `TAJIKISTAN`, `TURKMENISTAN`, and `UZBEKISTAN`

### 6. Current backlog math

Observed measured progression during this cleanup series:

- baseline dry-run: `matched 8469`, `port_unresolved 959`
- after curated alias pass: `matched 8517`, `port_unresolved 906`
- after curated master-data pass: `matched 8536`, `port_unresolved 887`

Net improvement from the measured baseline:

- `matched`: +67
- `port_unresolved`: -72

## What Remains

### 1. Active seaport backlog still needing real resolution work

Current active queue after removing sourced manual-review cases:

- active rows: 612
- active labels: 205

Top active labels right now:

- `CIS` 7
- `BELOW` 6
- `DE ORU` 6
- `LONGTAN` 6
- `MIKE` 6
- `NIANYUWEI` 6
- `RENTOUJI` 6
- `SANTO` 6
- `SHASHI` 6
- `VAVAU` 6
- `XINGTAN` 6
- `XIONGJIAGOU` 6
- `ZHOUWEI` 6
- `ZHUHAI CIVET` 6
- `ZHUHAI GAOLAN` 6
- `ZHUHAI JIUZHOU` 6
- `NAIROBI` 6
- `BRETAGNE` 5
- `CMA` 5
- `FOR` 5
- `KOCHI` 5
- `MIDDLE EAST` 5
- `PUERTO SEGURO` 5
- `TERPORT` 5
- `TUNIS` 5

### 2. Remaining work types

The remaining queue now appears to be mostly one of these classes:

- likely typo, junk, or workbook-noise labels:
  `BELOW`, `DE ORU`, `MIKE`, `CMA`, `FOR`
- likely real but poorly normalized port aliases:
  `SHASHI`, `XINGTAN`, `ZHUHAI GAOLAN`, `ZHUHAI JIUZHOU`, `ZHOUWEI`, `NIANYUWEI`, `RENTOUJI`
- likely inland or service-location style labels that may still need official-source review:
  `NAIROBI`, `KOCHI`, `MIDDLE EAST`
- labels that may require master-data coverage rather than alias-only fixes:
  places where UN/LOCODE or official references support a port-capable location, but the live `SEAPORT` master either lacks that row or lacks the expected alias
- labels that may remain intentionally unresolved:
  cases with no defensible one-to-one mapping even after official-source review

### 3. Non-port queues still present

These are not part of the seaport alias/master cleanup, but they are still open in the dry-run:

- `vendor_not_in_master`: 428
- `office_unresolved`: 184
- `port_ambiguous`: 36

These should be treated as separate follow-on workstreams.

## Deployment Parity Status

### Now covered by source-controlled migration flow

- synthetic seaport and service-location reconciliation

### Still needing deployment-path review

- curated port alias fixes currently applied by script
- curated seaport master fixes currently applied by script
- any other business-data corrections that exist in the local DB but not yet in
  migrations

## Recommended Next Steps

Recommended order for the next cleanup pass:

1. Clear obvious junk or non-location labels:
   `BELOW`, `DE ORU`, `MIKE`, `CMA`, `FOR`
2. Research likely real seaport aliases in the China cluster:
   `SHASHI`, `XINGTAN`, `NIANYUWEI`, `ZHOUWEI`, `ZHUHAI GAOLAN`, `ZHUHAI JIUZHOU`
3. Review geographically broad labels:
   `CIS`, `MIDDLE EAST`, `BRETAGNE`
4. Review location labels that may be inland, service, or mixed-mode:
   `NAIROBI`, `KOCHI`, `TUNIS`, `PUERTO SEGURO`
5. After each batch:
   rerun the dry-run import, export unresolved rows, rebuild grouped report, rebuild manual-review report

## Source Notes

Official-source work used during this checkpoint relied primarily on UNECE UN/LOCODE references and the function-code definition page, including country pages such as:

- `trade/locode/sa.htm`
- `trade/locode/bd.htm`
- `trade/locode/cn.htm`
- `trade/locode/mw.htm`
- `trade/locode/ch.htm`
- `trade/locode/py.htm`
- `trade/locode/bs.htm`
- `trade/locode/id.htm`
- `trade/locode/ki.htm`
- `trade/locode/usp.htm`
- `trade/locode/Service/LocodeColumn.htm`
