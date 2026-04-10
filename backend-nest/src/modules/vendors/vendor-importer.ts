import * as path from 'node:path';
import * as XLSX from 'xlsx';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import {
  extractEmails as extractNormalizedEmails,
  extractPhoneNumbers as extractNormalizedPhones,
  normalizeEmail as normalizeSharedEmail,
  normalizePhone as normalizeSharedPhone,
  normalizeTextKey as normalizeSharedTextKey,
  optionalText as optionalNormalizedText,
  parseYesFlag as parseSharedYesFlag,
} from '../../common/normalization';
import {
  normalizeVendorAddress,
  normalizeVendorCompanyName,
  normalizeVendorContactName,
  normalizeVendorDesignation,
  normalizeVendorEmail,
  normalizeVendorExternalCode,
  normalizeVendorFreeText,
  normalizeVendorLocationName,
  normalizeVendorNameKey,
  normalizeVendorOfficeName,
  normalizeVendorPhone,
  normalizeVendorSalutation,
  normalizeVendorSheetTitle,
} from './domain/vendor-normalization';
import { inferVendorCompanyNameFromEmail } from './domain/vendor-warnings';
import { VendorCcRecipient } from './entities/vendor-cc-recipient.entity';
import { VendorContact } from './entities/vendor-contact.entity';
import {
  ImportSourceAudit,
  ImportSourceAuditAction,
  ImportSourceAuditEntityKind,
} from './entities/import-source-audit.entity';
import { VendorMaster } from './entities/vendor-master.entity';
import { VendorOfficeTypeMap } from './entities/vendor-office-type-map.entity';
import { VendorOffice } from './entities/vendor-office.entity';
import {
  VendorTypeCode,
  VendorTypeMaster,
} from './entities/vendor-type-master.entity';
import {
  applyRegularWcaOverlay,
  createVendorLocationImportContext,
  DEFAULT_ALLOWED_WCA_COUNTRIES,
  isAllowedWcaSheet,
  resolveWcaSheetCountry,
  splitLocationCandidates,
  type LocationImportSummary,
  type PortLinkReviewItem,
  type RegularWcaOverlaySummary,
  type VendorLocationImportContext,
} from './vendor-location-importer';

export type { PortLinkReviewItem } from './vendor-location-importer';

type ImportMode = 'dry-run' | 'apply';
type WorkbookKind = 'domestic' | 'wca' | 'regular_wca' | 'template' | 'carrier';
type RowRecord = Record<string, unknown>;

type CapabilityState = {
  isIataCertified: boolean;
  doesSeaFreight: boolean;
  doesProjectCargo: boolean;
  doesOwnConsolidation: boolean;
  doesOwnTransportation: boolean;
  doesOwnWarehousing: boolean;
  doesOwnCustomClearance: boolean;
};

type ParsedContact = {
  contactName: string;
  salutation: string | null;
  designation: string | null;
  emailPrimary: string | null;
  emailSecondary: string | null;
  mobile1: string | null;
  mobile2: string | null;
  landline: string | null;
  whatsappNumber: string | null;
  isPrimaryHint: boolean;
};

type ParsedOfficeRow = {
  companyName: string;
  officeName: string;
  countryName: string | null;
  cityName: string | null;
  stateName: string | null;
  addressRaw: string | null;
  externalCode: string | null;
  specializationRaw: string | null;
  typeCodes: VendorTypeCode[];
  capabilities: Partial<CapabilityState>;
  contacts: ParsedContact[];
  ccEmails: string[];
  locationCandidates: string[];
};

type AggregatedOffice = {
  officeName: string;
  cityName: string | null;
  stateName: string | null;
  countryName: string | null;
  addressRaw: string | null;
  externalCode: string | null;
  specializationRaw: string | null;
  typeCodes: Set<VendorTypeCode>;
  capabilities: CapabilityState;
  contacts: Map<string, ParsedContact>;
  ccEmails: Set<string>;
  locationCandidates: Set<string>;
  firstSeenOrder: number;
};

type AggregatedVendor = {
  companyName: string;
  normalizedName: string;
  offices: Map<string, AggregatedOffice>;
};

type WorkbookStats = {
  workbook: string;
  sheetsProcessed: number;
  rowsRead: number;
  rowsSkipped: number;
};

export type VendorImportOptions = {
  mode: ImportMode;
  domesticWorkbookPath: string;
  wcaWorkbookPath?: string | null;
  importTemplateWorkbookPath?: string | null;
  regionsWorkbookPath?: string | null;
  portMasterWorkbookPath?: string | null;
  carrierWorkbookPath?: string | null;
  regularWcaWorkbookPath?: string | null;
  wcaCountries?: string[];
  linkLocations?: boolean;
  replaceExisting?: boolean;
  onSkippedRow?: (row: VendorSkippedRow) => void;
  onPortLinkReviewItem?: (item: PortLinkReviewItem) => void;
};

export type VendorSkippedRow = {
  workbook: string;
  kind: WorkbookKind;
  sheetName: string;
  rowNumber: number;
  reason: 'missing_company' | 'unsupported_sheet' | 'unresolved';
  rowData: RowRecord;
};

export type VendorImportSummary = {
  mode: ImportMode;
  sourceFiles: {
    domesticWorkbookPath: string;
    wcaWorkbookPath: string | null;
    importTemplateWorkbookPath: string | null;
    regionsWorkbookPath: string | null;
    portMasterWorkbookPath: string | null;
    carrierWorkbookPath: string | null;
    regularWcaWorkbookPath: string | null;
  };
  rowsRead: number;
  rowsSkipped: number;
  warnings: string[];
  vendors: number;
  offices: number;
  contacts: number;
  ccRecipients: number;
  officeTypeLinks: number;
  portLinkReviewCount: number;
  workbookSummaries: WorkbookStats[];
  locationSummary?: LocationImportSummary;
  regularWcaOverlaySummary?: RegularWcaOverlaySummary;
  databaseSummary?: {
    vendors: number;
    offices: number;
    contacts: number;
    ccRecipients: number;
    officeTypeLinks: number;
    locationSummary?: LocationImportSummary;
    regularWcaOverlaySummary?: RegularWcaOverlaySummary;
  };
};

const EMPTY_CAPABILITIES: CapabilityState = {
  isIataCertified: false,
  doesSeaFreight: false,
  doesProjectCargo: false,
  doesOwnConsolidation: false,
  doesOwnTransportation: false,
  doesOwnWarehousing: false,
  doesOwnCustomClearance: false,
};

const DOMESTIC_SHEET_TYPE_MAP: Record<string, VendorTypeCode> = {
  Transporter: VendorTypeCode.TRANSPORTER,
  'CFS Buffer Yard': VendorTypeCode.CFS_BUFFER_YARD,
  CHA: VendorTypeCode.CHA,
  'IATA (Mum)': VendorTypeCode.IATA,
  'IATA (Del)': VendorTypeCode.IATA,
  'IATA (Ahm)': VendorTypeCode.IATA,
  'IATA (Maa)': VendorTypeCode.IATA,
  'Co-Loader': VendorTypeCode.CO_LOADER,
  'Carrier Master': VendorTypeCode.CARRIER,
  Packers: VendorTypeCode.PACKER,
  Licensing: VendorTypeCode.LICENSING,
  'Shipping Line': VendorTypeCode.SHIPPING_LINE,
};

const IATA_SHEET_CITY_MAP: Record<
  string,
  { cityName: string; stateName: string | null }
> = {
  'IATA (Mum)': { cityName: 'Mumbai', stateName: 'Maharashtra' },
  'IATA (Del)': { cityName: 'Delhi', stateName: null },
  'IATA (Ahm)': { cityName: 'Ahmedabad', stateName: 'Gujarat' },
  'IATA (Maa)': { cityName: 'Chennai', stateName: 'Tamil Nadu' },
};

const WCA_SHEET_OVERRIDES: Record<
  string,
  { countryName: string; officeName?: string; stateName?: string }
> = {
  UAE: { countryName: 'United Arab Emirates' },
  UK: { countryName: 'United Kingdom' },
  USA: { countryName: 'United States' },
  Netherland: { countryName: 'Netherlands' },
  Phillipines: { countryName: 'Philippines' },
  Columbia: { countryName: 'Colombia' },
  Qingdao: {
    countryName: 'China',
    officeName: 'Qingdao',
    stateName: 'Qingdao',
  },
  Shanghai: {
    countryName: 'China',
    officeName: 'Shanghai',
    stateName: 'Shanghai',
  },
  Tianjin: {
    countryName: 'China',
    officeName: 'Tianjin',
    stateName: 'Tianjin',
  },
  Mumbai: { countryName: 'India', officeName: 'Mumbai', stateName: 'Mumbai' },
  'New Delhi': {
    countryName: 'India',
    officeName: 'New Delhi',
    stateName: 'New Delhi',
  },
};

export async function runVendorImport(
  dataSource: DataSource,
  options: VendorImportOptions,
): Promise<VendorImportSummary> {
  const shouldLinkLocations = options.linkLocations !== false;
  const warnings: string[] = [];
  const skippedRows: VendorSkippedRow[] = [];
  const vendors = new Map<string, AggregatedVendor>();
  const workbookSummaries: WorkbookStats[] = [];
  let rowsRead = 0;
  let rowsSkipped = 0;
  let officeSequence = 0;

  const workbooks: Array<{ path: string; kind: WorkbookKind }> = [
    { path: options.domesticWorkbookPath, kind: 'domestic' },
  ];
  if (options.carrierWorkbookPath) {
    workbooks.push({
      path: options.carrierWorkbookPath,
      kind: 'carrier',
    });
  }
  if (options.regularWcaWorkbookPath) {
    workbooks.push({
      path: options.regularWcaWorkbookPath,
      kind: 'regular_wca',
    });
  }
  if (options.wcaWorkbookPath) {
    workbooks.push({
      path: options.wcaWorkbookPath,
      kind: 'wca',
    });
  }
  if (options.importTemplateWorkbookPath) {
    workbooks.push({
      path: options.importTemplateWorkbookPath,
      kind: 'template',
    });
  }

  for (const workbookInput of workbooks) {
    const stats = parseWorkbook(
      workbookInput.path,
      workbookInput.kind,
      options.wcaCountries ?? Array.from(DEFAULT_ALLOWED_WCA_COUNTRIES),
      warnings,
      vendors,
      () => ++officeSequence,
      (row) => {
        skippedRows.push(row);
        options.onSkippedRow?.(row);
      },
    );
    workbookSummaries.push(stats);
    rowsRead += stats.rowsRead;
    rowsSkipped += stats.rowsSkipped;
  }

  const summary: VendorImportSummary = {
    mode: options.mode,
    sourceFiles: {
      domesticWorkbookPath: options.domesticWorkbookPath,
      wcaWorkbookPath: options.wcaWorkbookPath ?? null,
      importTemplateWorkbookPath: options.importTemplateWorkbookPath ?? null,
      regionsWorkbookPath: options.regionsWorkbookPath ?? null,
      portMasterWorkbookPath: options.portMasterWorkbookPath ?? null,
      carrierWorkbookPath: options.carrierWorkbookPath ?? null,
      regularWcaWorkbookPath: options.regularWcaWorkbookPath ?? null,
    },
    rowsRead,
    rowsSkipped,
    warnings,
    vendors: vendors.size,
    offices: sumVendors(vendors, () => 1),
    contacts: sumVendors(vendors, (office) => office.contacts.size),
    ccRecipients: sumVendors(vendors, (office) => office.ccEmails.size),
    officeTypeLinks: sumVendors(vendors, (office) => office.typeCodes.size),
    portLinkReviewCount: 0,
    workbookSummaries,
  };

  if (options.mode === 'dry-run') {
    if (!shouldLinkLocations) {
      return summary;
    }

    const reviewContext = await createVendorLocationImportContext(
      dataSource.manager,
    );
    await previewVendorLocationLinks(reviewContext, vendors);
    for (const reviewItem of reviewContext.portLinkReviewItems) {
      options.onPortLinkReviewItem?.(reviewItem);
    }

    summary.portLinkReviewCount = reviewContext.portLinkReviewItems.length;
    return summary;
  }

  const databaseSummary = await dataSource.transaction(async (manager) => {
    if (options.replaceExisting) {
      await truncateVendorTables(manager);
    }
    const locationContext = shouldLinkLocations
      ? await createVendorLocationImportContext(
          manager,
          options.regionsWorkbookPath,
          options.portMasterWorkbookPath,
        )
      : null;
    const vendorDatabaseSummary = await persistVendorImport(
      manager,
      vendors,
      locationContext,
    );
    const regularWcaOverlaySummary = options.regularWcaWorkbookPath
      ? await applyRegularWcaOverlay(
          manager,
          options.regularWcaWorkbookPath,
          options.wcaCountries ?? Array.from(DEFAULT_ALLOWED_WCA_COUNTRIES),
        )
      : undefined;
    if (locationContext) {
      await persistImportAuditRows(manager, skippedRows, locationContext.summary);
    }

    return {
      ...vendorDatabaseSummary,
      locationSummary: locationContext?.summary,
      regularWcaOverlaySummary,
      portLinkReviewItems: locationContext?.portLinkReviewItems ?? [],
    };
  });

  for (const reviewItem of databaseSummary.portLinkReviewItems) {
    options.onPortLinkReviewItem?.(reviewItem);
  }
  summary.portLinkReviewCount = databaseSummary.portLinkReviewItems.length;

  return {
    ...summary,
    databaseSummary: {
      vendors: databaseSummary.vendors,
      offices: databaseSummary.offices,
      contacts: databaseSummary.contacts,
      ccRecipients: databaseSummary.ccRecipients,
      officeTypeLinks: databaseSummary.officeTypeLinks,
      locationSummary: databaseSummary.locationSummary,
      regularWcaOverlaySummary: databaseSummary.regularWcaOverlaySummary,
    },
  };
}

async function persistImportAuditRows(
  manager: EntityManager,
  skippedRows: VendorSkippedRow[],
  locationSummary: LocationImportSummary,
) {
  if (skippedRows.length === 0) {
    return;
  }

  const auditRepo = manager.getRepository(ImportSourceAudit);
  await auditRepo.save(
    skippedRows.map((row) =>
      auditRepo.create({
        sourceWorkbook: row.workbook,
        sourceSheet: row.sheetName,
        sourceRowNumber: row.rowNumber,
        entityKind: ImportSourceAuditEntityKind.VENDOR,
        action: ImportSourceAuditAction.SKIPPED,
        confidence: row.reason === 'unresolved' ? 'LOW' : null,
        normalizedKey: buildSkippedRowKey(row),
        vendorId: null,
        officeId: null,
        portId: null,
        serviceLocationId: null,
        reason: row.reason,
        rawPayloadJson: row.rowData,
      }),
    ),
  );
  locationSummary.auditRowsCreated += skippedRows.length;
}

function buildSkippedRowKey(row: VendorSkippedRow) {
  const valueCandidates = [
    row.rowData['COMPANY NAME'],
    row.rowData['Company Name '],
    row.rowData['Compant Name '],
    row.rowData['Compant Name'],
    row.rowData['Carrier'],
    row.rowData['Agent'],
    row.rowData['Co Loader'],
    row.rowData['Co-Loader'],
    row.rowData['Co Loader '],
  ];

  for (const value of valueCandidates) {
    const normalized = normalizeVendorNameKey(optionalNormalizedText(value));
    if (normalized) {
      return normalized;
    }
  }

  return null;
}

function parseWorkbook(
  workbookPath: string,
  kind: WorkbookKind,
  allowedWcaCountries: string[],
  warnings: string[],
  vendors: Map<string, AggregatedVendor>,
  nextOfficeSequence: () => number,
  onSkippedRow?: (row: VendorSkippedRow) => void,
): WorkbookStats {
  const workbook = XLSX.readFile(workbookPath, {
    cellDates: false,
    raw: false,
  });

  const stats: WorkbookStats = {
    workbook: path.basename(workbookPath),
    sheetsProcessed: 0,
    rowsRead: 0,
    rowsSkipped: 0,
  };

  for (const sheetName of workbook.SheetNames) {
    if (kind === 'wca' && !isAllowedWcaSheet(sheetName, allowedWcaCountries)) {
      continue;
    }
    if (kind === 'carrier' && !isSupportedCarrierSheet(sheetName)) {
      continue;
    }

    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      continue;
    }

    const rows = XLSX.utils.sheet_to_json<RowRecord>(sheet, {
      defval: null,
      raw: false,
    });
    if (rows.length === 0) {
      continue;
    }

    stats.sheetsProcessed += 1;

    for (const [rowIndex, row] of rows.entries()) {
      stats.rowsRead += 1;
      const parsedRows = parseSheetRow(kind, sheetName, row, warnings);
      if (parsedRows.length === 0) {
        stats.rowsSkipped += 1;
        onSkippedRow?.({
          workbook: path.basename(workbookPath),
          kind,
          sheetName,
          rowNumber: rowIndex + 2,
          reason: determineSkipReason(kind, sheetName, row),
          rowData: row,
        });
        continue;
      }

      for (const parsedRow of parsedRows) {
        addParsedOfficeRow(vendors, parsedRow, nextOfficeSequence());
      }
    }
  }

  return stats;
}

function parseSheetRow(
  kind: WorkbookKind,
  sheetName: string,
  row: RowRecord,
  warnings: string[],
): ParsedOfficeRow[] {
  if (kind === 'wca' || kind === 'regular_wca') {
    return parseWcaRow(sheetName, row, warnings);
  }
  if (kind === 'carrier') {
    return parseCarrierSheetRow(sheetName, row, warnings);
  }
  if (kind === 'template') {
    return parseTemplateRow(sheetName, row, warnings);
  }
  return parseDomesticRow(sheetName, row, warnings);
}

function parseDomesticRow(
  sheetName: string,
  row: RowRecord,
  warnings: string[],
): ParsedOfficeRow[] {
  const typeCode = DOMESTIC_SHEET_TYPE_MAP[sheetName];
  if (!typeCode) {
    warnings.push(`Skipped unsupported domestic sheet "${sheetName}".`);
    return [];
  }
  if (sheetName === 'IATA (Mum)') {
    return parseIataMumbaiRow(row);
  }
  if (sheetName in IATA_SHEET_CITY_MAP) {
    return parseRegionalIataRow(sheetName, row);
  }
  if (sheetName === 'Co-Loader') {
    return parseCoLoaderRow(row, 'India');
  }
  if (sheetName === 'Carrier Master') {
    return parseCarrierMasterRow(row);
  }
  return parseSimpleCompanyContactRow(row, typeCode, 'India', sheetName);
}

function parseTemplateRow(
  sheetName: string,
  row: RowRecord,
  warnings: string[],
): ParsedOfficeRow[] {
  const typeCode = DOMESTIC_SHEET_TYPE_MAP[sheetName];
  if (!typeCode) {
    warnings.push(`Skipped unsupported template sheet "${sheetName}".`);
    return [];
  }
  if (sheetName === 'Co-Loader') {
    return parseTemplateCoLoaderRow(row);
  }
  return parseSimpleCompanyContactRow(row, typeCode, 'India', sheetName);
}

function determineSkipReason(
  kind: WorkbookKind,
  sheetName: string,
  row: RowRecord,
): VendorSkippedRow['reason'] {
  if (kind === 'wca' || kind === 'regular_wca') {
    return readCompanyName(row, ['COMPANY NAME'], ['EMAIL ID 1'])
      ? 'unresolved'
      : 'missing_company';
  }

  if (kind === 'carrier') {
    return readCompanyName(
      row,
      ['Carrier'],
      ['TO email ID', 'CC email ID', 'Additional IDs'],
    )
      ? 'unresolved'
      : 'missing_company';
  }

  if (!DOMESTIC_SHEET_TYPE_MAP[sheetName]) {
    return 'unsupported_sheet';
  }

  if (sheetName === 'IATA (Mum)') {
    return readCompanyName(row, ['Agent'], ['Email id', 'Email id 2'])
      ? 'unresolved'
      : 'missing_company';
  }

  if (sheetName in IATA_SHEET_CITY_MAP) {
    return readCompanyName(row, ['COMPANY NAME'], ['EMAIL ID 1'])
      ? 'unresolved'
      : 'missing_company';
  }

  if (sheetName === 'Co-Loader') {
    return readCompanyName(
      row,
      ['Co Loader', 'Co-Loader', 'Co Loader '],
      ['Email id', 'Email id 2', 'Email id_1'],
    )
      ? 'unresolved'
      : 'missing_company';
  }

  if (sheetName === 'Carrier Master') {
    return readCompanyName(
      row,
      ['Carrier'],
      ['TO email ID', 'CC email ID', 'Additional IDs'],
    )
      ? 'unresolved'
      : 'missing_company';
  }

  return readCompanyName(
    row,
    [
      'Company Name ',
      'Compant Name ',
      'Compant Name',
      'COMPANY NAME',
      'Carrier',
      'Agent',
    ],
    ['Email ID', 'EMAIL ID 1', 'TO email ID', 'Email id', 'Email id 2'],
  )
    ? 'unresolved'
    : 'missing_company';
}

function parseWcaRow(
  sheetName: string,
  row: RowRecord,
  warnings: string[],
): ParsedOfficeRow[] {
  const companyName = readCompanyName(row, ['COMPANY NAME'], ['EMAIL ID 1']);
  if (!companyName) {
    return [];
  }

  const normalizedSheetTitle = normalizeSheetTitle(sheetName);
  if (normalizedSheetTitle === 'Sheet51') {
    warnings.push('Skipped WCA helper sheet "Sheet51".');
    return [];
  }

  const override = WCA_SHEET_OVERRIDES[normalizedSheetTitle];
  const stateName = readText(row, ['STATE']) ?? override?.stateName ?? null;
  const designation = readText(row, [
    'DESIGENATION',
    'DESIGENATION ',
    'DESIGNATION',
    'DESIGNATION ',
  ]);

  return [
    {
      companyName,
      officeName:
        readText(row, ['STATE']) ??
        override?.officeName ??
        normalizedSheetTitle,
      countryName: override?.countryName ?? resolveWcaSheetCountry(sheetName),
      cityName: stateName,
      stateName,
      addressRaw: null,
      externalCode: readText(row, ['CODE']),
      specializationRaw: readText(row, ['Specialisation (if any)']),
      typeCodes: [VendorTypeCode.WCA_AGENT],
      capabilities: {
        isIataCertified: parseYesFlag(row['IATA']),
        doesSeaFreight: parseYesFlag(row['Sea']),
        doesProjectCargo: parseYesFlag(row['Project']),
        doesOwnConsolidation: parseYesFlag(row['Own Consolidation']),
        doesOwnTransportation: parseYesFlag(row['OwnTransportation']),
        doesOwnWarehousing: parseYesFlag(row['Own Warehousing']),
        doesOwnCustomClearance: parseYesFlag(row['Own Custom Clearance']),
      },
      contacts: [
        {
          contactName:
            buildName(
              readText(row, ['Salutation']),
              readText(row, ['First Name']),
              readText(row, ['Surname']),
            ) ?? 'General Desk',
          salutation: readText(row, ['Salutation']),
          designation,
          emailPrimary: readFirstEmail(row, ['EMAIL ID 1']),
          emailSecondary: readSecondEmail(row, ['EMAIL ID 1']),
          mobile1: readFirstPhone(row, ['Contact No.']),
          mobile2: readSecondPhone(row, ['Contact No.']),
          landline: null,
          whatsappNumber: null,
          isPrimaryHint: /main contact/i.test(designation ?? ''),
        },
      ],
      ccEmails: [],
      locationCandidates: stateName ? [stateName] : [],
    },
  ];
}

function parseCarrierSheetRow(
  sheetName: string,
  row: RowRecord,
  warnings: string[],
): ParsedOfficeRow[] {
  const normalizedSheetTitle = normalizeSheetTitle(sheetName);
  if (!isSupportedCarrierSheet(sheetName)) {
    warnings.push(`Skipped unsupported carrier sheet "${sheetName}".`);
    return [];
  }

  return parseRegionalCarrierCoverageRow(sheetName, row);
}

function parseSimpleCompanyContactRow(
  row: RowRecord,
  typeCode: VendorTypeCode,
  countryName: string,
  sheetName: string,
): ParsedOfficeRow[] {
  const companyName = readCompanyName(
    row,
    [
      'Company Name ',
      'Compant Name ',
      'Compant Name',
      'COMPANY NAME',
      'Carrier',
      'Agent',
    ],
    ['Email ID', 'EMAIL ID 1', 'TO email ID', 'Email id', 'Email id 2'],
  );
  if (!companyName) {
    return [];
  }

  const locationRaw = readText(row, ['Location', 'Port']);
  const officeHint = inferDomesticOfficeLabel(sheetName, locationRaw);

  return [
    {
      companyName,
      officeName: officeHint.officeName,
      countryName,
      cityName: officeHint.cityName,
      stateName: officeHint.stateName,
      addressRaw: locationRaw,
      externalCode: null,
      specializationRaw: readText(row, [
        'Speciality ',
        'Speciality',
        'Commodity ',
        'CFS / Buffer Yard',
        'Type',
      ]),
      typeCodes: [typeCode],
      capabilities: {
        isIataCertified: typeCode === VendorTypeCode.IATA,
        doesOwnTransportation: typeCode === VendorTypeCode.TRANSPORTER,
      },
      contacts: [
        {
          contactName:
            readText(row, ['Name ', 'Name', 'Sales Person']) ?? 'General Desk',
          salutation: null,
          designation: readText(row, ['Designation']),
          emailPrimary: readFirstEmail(row, [
            'Email ID',
            'EMAIL ID 1',
            'TO email ID',
          ]),
          emailSecondary: readSecondEmail(row, [
            'Email ID',
            'EMAIL ID 1',
            'TO email ID',
            'Email id 2',
          ]),
          mobile1: readFirstPhone(row, ['Mobile 1', 'Contact No.', 'Mobile']),
          mobile2:
            readFirstPhone(row, ['Mobile 2']) ??
            readSecondPhone(row, ['Mobile 1', 'Contact No.', 'Mobile']),
          landline: null,
          whatsappNumber: null,
          isPrimaryHint: true,
        },
      ],
      ccEmails: readEmails(row, ['CC Id', 'CC email ID', 'Additional IDs']),
      locationCandidates: deriveLocationCandidates(locationRaw),
    },
  ];
}

function isSupportedCarrierSheet(sheetName: string) {
  const normalizedSheetKey = normalizeTextKey(normalizeSheetTitle(sheetName));

  return [
    'Mumbai CARRIER MASTER',
    'Chennai Carrier Master',
    'Cochin Carrier Master',
    'Egypt Carrier Master',
  ]
    .map((supportedSheetName) => normalizeTextKey(supportedSheetName))
    .includes(normalizedSheetKey);
}

function parseCarrierMasterRow(row: RowRecord): ParsedOfficeRow[] {
  const companyName = readCompanyName(
    row,
    ['Carrier'],
    ['TO email ID', 'CC email ID', 'Additional IDs'],
  );
  if (!companyName) {
    return [];
  }

  const portLabel = readText(row, ['Port']);

  return [
    {
      companyName,
      officeName: portLabel ?? 'India Desk',
      countryName: 'India',
      cityName: portLabel,
      stateName: null,
      addressRaw: portLabel,
      externalCode: null,
      specializationRaw: readText(row, ['Type']),
      typeCodes: [VendorTypeCode.CARRIER],
      capabilities: {},
      contacts: [
        {
          contactName: readText(row, ['Name']) ?? 'General Desk',
          salutation: null,
          designation: readText(row, ['Type']),
          emailPrimary: readFirstEmail(row, ['TO email ID']),
          emailSecondary: readSecondEmail(row, ['TO email ID']),
          mobile1: readFirstPhone(row, ['Mobile']),
          mobile2: readSecondPhone(row, ['Mobile']),
          landline: null,
          whatsappNumber: null,
          isPrimaryHint: true,
        },
      ],
      ccEmails: readEmails(row, ['CC email ID', 'Additional IDs']),
      locationCandidates: splitLocationCandidates(portLabel),
    },
  ];
}

function parseCarrierCoverageRow(row: RowRecord): ParsedOfficeRow[] {
  const companyName = readCompanyName(
    row,
    ['Carrier'],
    ['TO email ID', 'CC email ID', 'Additional IDs'],
  );
  if (!companyName) {
    return [];
  }

  const portLabel = readText(row, ['Port ', 'Port', 'POL']);

  return [
    {
      companyName,
      officeName: portLabel ?? 'Carrier Desk',
      countryName: null,
      cityName: null,
      stateName: null,
      addressRaw: portLabel,
      externalCode: null,
      specializationRaw: null,
      typeCodes: [VendorTypeCode.CARRIER],
      capabilities: { doesSeaFreight: true },
      contacts: [
        {
          contactName: readText(row, ['Name']) ?? 'General Desk',
          salutation: null,
          designation: 'Carrier Desk',
          emailPrimary: readFirstEmail(row, ['TO email ID']),
          emailSecondary: readSecondEmail(row, ['TO email ID']),
          mobile1: readFirstPhone(row, ['Mobile']),
          mobile2: readSecondPhone(row, ['Mobile']),
          landline: null,
          whatsappNumber: null,
          isPrimaryHint: true,
        },
      ],
      ccEmails: readEmails(row, ['CC email ID', 'Additional IDs']),
      locationCandidates: splitLocationCandidates(portLabel),
    },
  ];
}

function parseRegionalCarrierCoverageRow(
  sheetName: string,
  row: RowRecord,
): ParsedOfficeRow[] {
  const companyName = readCompanyName(
    row,
    ['Carrier'],
    ['TO email ID', 'CC email ID', 'Additional IDs'],
  );
  if (!companyName) {
    return [];
  }

  const normalizedSheetKey = normalizeTextKey(normalizeSheetTitle(sheetName));
  const portLabel = readText(row, ['Port', 'POL']);
  const officeName =
    normalizedSheetKey === normalizeTextKey('Mumbai CARRIER MASTER')
      ? 'Mumbai'
      : normalizedSheetKey === normalizeTextKey('Chennai Carrier Master')
        ? 'Chennai'
        : normalizedSheetKey === normalizeTextKey('Cochin Carrier Master')
          ? 'Kochi'
          : normalizedSheetKey === normalizeTextKey('Egypt Carrier Master')
            ? 'Egypt Desk'
            : (portLabel ?? 'Carrier Desk');
  const countryName =
    normalizedSheetKey === normalizeTextKey('Egypt Carrier Master')
      ? 'Egypt'
      : 'India';
  const cityName =
    normalizedSheetKey === normalizeTextKey('Mumbai CARRIER MASTER')
      ? 'Mumbai'
      : normalizedSheetKey === normalizeTextKey('Chennai Carrier Master')
        ? 'Chennai'
        : normalizedSheetKey === normalizeTextKey('Cochin Carrier Master')
          ? 'Kochi'
          : null;

  return [
    {
      companyName,
      officeName,
      countryName,
      cityName,
      stateName: null,
      addressRaw: portLabel,
      externalCode: null,
      specializationRaw: readText(row, ['Type']),
      typeCodes: [VendorTypeCode.CARRIER],
      capabilities: { doesSeaFreight: true },
      contacts: [
        {
          contactName:
            buildName(
              readText(row, ['Name']),
              readText(row, ['Last name']),
              null,
            ) ?? 'General Desk',
          salutation: null,
          designation: readText(row, ['Type']) ?? 'Carrier Desk',
          emailPrimary: readFirstEmail(row, ['TO email ID']),
          emailSecondary: readSecondEmail(row, ['TO email ID']),
          mobile1: readFirstPhone(row, ['Mobile']),
          mobile2: readSecondPhone(row, ['Mobile']),
          landline: null,
          whatsappNumber: null,
          isPrimaryHint: true,
        },
      ],
      ccEmails: readEmails(row, ['CC email ID', 'Additional IDs']),
      locationCandidates: splitLocationCandidates(portLabel),
    },
  ];
}

function parseCoLoaderRow(
  row: RowRecord,
  countryName: string,
): ParsedOfficeRow[] {
  const companyName = readCompanyName(
    row,
    ['Co Loader', 'Co-Loader', 'Co Loader '],
    ['Email id', 'Email id 2'],
  );
  if (!companyName) {
    return [];
  }

  return [
    {
      companyName,
      officeName: 'India Desk',
      countryName,
      cityName: null,
      stateName: null,
      addressRaw: null,
      externalCode: null,
      specializationRaw: null,
      typeCodes: [VendorTypeCode.CO_LOADER],
      capabilities: {},
      contacts: [
        {
          contactName:
            buildName(
              readText(row, ['Sales Person']),
              readText(row, ['__EMPTY', '__EMPTY_1']),
              null,
            ) ?? 'General Desk',
          salutation: null,
          designation: 'Sales',
          emailPrimary: readFirstEmail(row, ['Email id']),
          emailSecondary: readFirstEmail(row, ['Email id 2']),
          mobile1: readFirstPhone(row, ['Contact']),
          mobile2: readFirstPhone(row, ['Contact_1', 'Contact__1']),
          landline: null,
          whatsappNumber: null,
          isPrimaryHint: true,
        },
      ],
      ccEmails: [],
      locationCandidates: [],
    },
  ];
}

function parseTemplateCoLoaderRow(row: RowRecord): ParsedOfficeRow[] {
  const companyName = readCompanyName(
    row,
    ['Co Loader'],
    ['Email id', 'Email id_1', 'Email id 2'],
  );
  if (!companyName) {
    return [];
  }

  const contacts: ParsedContact[] = [
    {
      contactName:
        buildName(
          readText(row, ['First Name']),
          readText(row, ['Last Name']),
          null,
        ) ?? 'General Desk',
      salutation: null,
      designation: 'Sales',
      emailPrimary: readFirstEmail(row, ['Email id']),
      emailSecondary: readSecondEmail(row, ['Email id']),
      mobile1: readFirstPhone(row, ['Contact']),
      mobile2: readSecondPhone(row, ['Contact']),
      landline: null,
      whatsappNumber: null,
      isPrimaryHint: true,
    },
  ];

  const customerServiceName = readText(row, ['Customer Service']);
  const customerServiceEmail = readFirstEmail(row, [
    'Email id_1',
    'Email id 2',
  ]);
  const customerServicePhone = readFirstPhone(row, ['Contact_1']);
  if (customerServiceName || customerServiceEmail || customerServicePhone) {
    contacts.push({
      contactName: customerServiceName ?? 'Customer Service',
      salutation: null,
      designation: 'Customer Service',
      emailPrimary: customerServiceEmail,
      emailSecondary: readSecondEmail(row, ['Email id_1', 'Email id 2']),
      mobile1: customerServicePhone,
      mobile2: readSecondPhone(row, ['Contact_1']),
      landline: null,
      whatsappNumber: null,
      isPrimaryHint: false,
    });
  }

  return [
    {
      companyName,
      officeName: 'India Desk',
      countryName: 'India',
      cityName: null,
      stateName: null,
      addressRaw: null,
      externalCode: null,
      specializationRaw: null,
      typeCodes: [VendorTypeCode.CO_LOADER],
      capabilities: {},
      contacts,
      ccEmails: [],
      locationCandidates: [],
    },
  ];
}

function parseIataMumbaiRow(row: RowRecord): ParsedOfficeRow[] {
  const companyName = readCompanyName(
    row,
    ['Agent'],
    ['Email id', 'Email id 2'],
  );
  if (!companyName) {
    return [];
  }

  const contacts: ParsedContact[] = [
    {
      contactName:
        buildName(
          readText(row, ['Sales Person']),
          readText(row, ['__EMPTY', '__EMPTY_1']),
          null,
        ) ?? 'General Desk',
      salutation: null,
      designation: 'Sales',
      emailPrimary: readFirstEmail(row, ['Email id']),
      emailSecondary: readSecondEmail(row, ['Email id']),
      mobile1: readFirstPhone(row, ['Contact']),
      mobile2: readSecondPhone(row, ['Contact']),
      landline: null,
      whatsappNumber: null,
      isPrimaryHint: true,
    },
  ];

  const alternateName = readText(row, ['cc']);
  const alternateEmail = readFirstEmail(row, ['Email id 2', 'Email id_1']);
  const alternatePhone = readFirstPhone(row, ['Contact_1', 'Contact__1']);
  if (alternateName || alternateEmail || alternatePhone) {
    contacts.push({
      contactName: alternateName ?? 'Alternate Contact',
      salutation: null,
      designation: 'Sales',
      emailPrimary: alternateEmail,
      emailSecondary: readSecondEmail(row, ['Email id 2', 'Email id_1']),
      mobile1: alternatePhone,
      mobile2: readSecondPhone(row, ['Contact_1', 'Contact__1']),
      landline: null,
      whatsappNumber: null,
      isPrimaryHint: false,
    });
  }

  return [
    {
      companyName,
      officeName: 'Mumbai',
      countryName: 'India',
      cityName: 'Mumbai',
      stateName: 'Maharashtra',
      addressRaw: null,
      externalCode: null,
      specializationRaw: null,
      typeCodes: [VendorTypeCode.IATA],
      capabilities: { isIataCertified: true },
      contacts,
      ccEmails: [],
      locationCandidates: ['Mumbai'],
    },
  ];
}

function parseRegionalIataRow(
  sheetName: string,
  row: RowRecord,
): ParsedOfficeRow[] {
  const companyName = readCompanyName(row, ['COMPANY NAME'], ['EMAIL ID 1']);
  if (!companyName) {
    return [];
  }

  const officeLocation = IATA_SHEET_CITY_MAP[sheetName];
  return [
    {
      companyName,
      officeName: officeLocation.cityName,
      countryName: 'India',
      cityName: officeLocation.cityName,
      stateName: officeLocation.stateName,
      addressRaw: null,
      externalCode: null,
      specializationRaw: null,
      typeCodes: [VendorTypeCode.IATA],
      capabilities: { isIataCertified: true },
      contacts: [
        {
          contactName: readText(row, ['Name']) ?? 'General Desk',
          salutation: null,
          designation: readText(row, ['Designation']),
          emailPrimary: readFirstEmail(row, ['EMAIL ID 1']),
          emailSecondary: readSecondEmail(row, ['EMAIL ID 1']),
          mobile1: readFirstPhone(row, ['Contact No.']),
          mobile2: readSecondPhone(row, ['Contact No.']),
          landline: null,
          whatsappNumber: null,
          isPrimaryHint: true,
        },
      ],
      ccEmails: [],
      locationCandidates: [officeLocation.cityName],
    },
  ];
}

function addParsedOfficeRow(
  vendors: Map<string, AggregatedVendor>,
  parsedRow: ParsedOfficeRow,
  officeSequence: number,
) {
  const companyName = normalizeVendorCompanyName(parsedRow.companyName);
  if (!companyName) {
    return;
  }
  const normalizedName = normalizeVendorNameKey(companyName);

  let vendor = vendors.get(normalizedName);
  if (!vendor) {
    vendor = {
      companyName,
      normalizedName,
      offices: new Map<string, AggregatedOffice>(),
    };
    vendors.set(normalizedName, vendor);
  } else {
    vendor.companyName =
      preferText(vendor.companyName, companyName) ?? vendor.companyName;
  }

  const officeName = normalizeVendorOfficeName(parsedRow.officeName);
  if (!officeName) {
    return;
  }
  const officeKey = buildOfficeKey(officeName);
  let office = vendor.offices.get(officeKey);
  if (!office) {
    office = {
      officeName,
      cityName: normalizeVendorLocationName(parsedRow.cityName),
      stateName: normalizeVendorLocationName(parsedRow.stateName),
      countryName: normalizeVendorLocationName(parsedRow.countryName),
      addressRaw: normalizeVendorAddress(parsedRow.addressRaw),
      externalCode: normalizeVendorExternalCode(parsedRow.externalCode),
      specializationRaw: normalizeVendorFreeText(parsedRow.specializationRaw),
      typeCodes: new Set(parsedRow.typeCodes),
      capabilities: mergeCapabilities(
        { ...EMPTY_CAPABILITIES },
        parsedRow.capabilities,
      ),
      contacts: new Map<string, ParsedContact>(),
      ccEmails: new Set(
        parsedRow.ccEmails
          .map((email) => normalizeVendorEmail(email))
          .filter((email): email is string => Boolean(email)),
      ),
      locationCandidates: new Set(
        parsedRow.locationCandidates
          .map((candidate) => normalizeVendorLocationName(candidate))
          .filter((candidate): candidate is string => Boolean(candidate)),
      ),
      firstSeenOrder: officeSequence,
    };
    vendor.offices.set(officeKey, office);
  } else {
    office.cityName = preferText(
      office.cityName,
      normalizeVendorLocationName(parsedRow.cityName),
    );
    office.stateName = preferText(
      office.stateName,
      normalizeVendorLocationName(parsedRow.stateName),
    );
    office.countryName = preferText(
      office.countryName,
      normalizeVendorLocationName(parsedRow.countryName),
    );
    office.addressRaw = mergeRawText(
      office.addressRaw,
      normalizeVendorAddress(parsedRow.addressRaw),
    );
    office.externalCode = preferText(
      office.externalCode,
      normalizeVendorExternalCode(parsedRow.externalCode),
    );
    office.specializationRaw = mergeRawText(
      office.specializationRaw,
      normalizeVendorFreeText(parsedRow.specializationRaw),
    );
    office.capabilities = mergeCapabilities(
      office.capabilities,
      parsedRow.capabilities,
    );
    for (const typeCode of parsedRow.typeCodes) {
      office.typeCodes.add(typeCode);
    }
    for (const ccEmail of parsedRow.ccEmails) {
      const normalizedCcEmail = normalizeVendorEmail(ccEmail);
      if (normalizedCcEmail) {
        office.ccEmails.add(normalizedCcEmail);
      }
    }
    for (const locationCandidate of parsedRow.locationCandidates) {
      const normalizedLocationCandidate =
        normalizeVendorLocationName(locationCandidate);
      if (normalizedLocationCandidate) {
        office.locationCandidates.add(normalizedLocationCandidate);
      }
    }
  }

  for (const contact of parsedRow.contacts) {
    const sanitizedContact: ParsedContact = {
      contactName:
        normalizeVendorContactName(contact.contactName) ?? 'General Desk',
      salutation: normalizeVendorSalutation(contact.salutation),
      designation: normalizeVendorDesignation(contact.designation),
      emailPrimary: normalizeVendorEmail(contact.emailPrimary),
      emailSecondary: normalizeVendorEmail(contact.emailSecondary),
      mobile1: normalizeVendorPhone(contact.mobile1),
      mobile2: normalizeVendorPhone(contact.mobile2),
      landline: normalizeVendorPhone(contact.landline),
      whatsappNumber: normalizeVendorPhone(contact.whatsappNumber),
      isPrimaryHint: contact.isPrimaryHint,
    };

    const contactKey = buildContactKey(sanitizedContact);
    if (!contactKey) {
      continue;
    }

    const existing = office.contacts.get(contactKey);
    if (!existing) {
      office.contacts.set(contactKey, sanitizedContact);
      continue;
    }

    office.contacts.set(contactKey, {
      contactName:
        preferText(existing.contactName, sanitizedContact.contactName) ??
        'General Desk',
      salutation: preferText(existing.salutation, sanitizedContact.salutation),
      designation: preferText(
        existing.designation,
        sanitizedContact.designation,
      ),
      emailPrimary: preferText(
        existing.emailPrimary,
        sanitizedContact.emailPrimary,
      ),
      emailSecondary: preferText(
        existing.emailSecondary,
        sanitizedContact.emailSecondary,
      ),
      mobile1: preferText(existing.mobile1, sanitizedContact.mobile1),
      mobile2: preferText(existing.mobile2, sanitizedContact.mobile2),
      landline: preferText(existing.landline, sanitizedContact.landline),
      whatsappNumber: preferText(
        existing.whatsappNumber,
        sanitizedContact.whatsappNumber,
      ),
      isPrimaryHint: existing.isPrimaryHint || sanitizedContact.isPrimaryHint,
    });
  }
}

async function previewVendorLocationLinks(
  locationContext: VendorLocationImportContext,
  vendors: Map<string, AggregatedVendor>,
) {
  for (const aggregatedVendor of vendors.values()) {
    const offices = Array.from(aggregatedVendor.offices.values()).sort(
      (left, right) => left.firstSeenOrder - right.firstSeenOrder,
    );

    for (const aggregatedOffice of offices) {
      await locationContext.previewOfficeLocations({
        officeId: `dry-run::${aggregatedVendor.normalizedName}::${aggregatedOffice.officeName}`,
        vendorName: aggregatedVendor.companyName,
        officeName: aggregatedOffice.officeName,
        officeCountryName: aggregatedOffice.countryName,
        officeCityName: aggregatedOffice.cityName,
        typeCodes: aggregatedOffice.typeCodes,
        locationCandidates: aggregatedOffice.locationCandidates,
        capabilityHints: {
          isIataCertified: aggregatedOffice.capabilities.isIataCertified,
          doesSeaFreight: aggregatedOffice.capabilities.doesSeaFreight,
        },
      });
    }
  }
}

async function persistVendorImport(
  manager: EntityManager,
  vendors: Map<string, AggregatedVendor>,
  locationContext: VendorLocationImportContext | null,
) {
  const vendorRepo = manager.getRepository(VendorMaster);
  const officeRepo = manager.getRepository(VendorOffice);
  const contactRepo = manager.getRepository(VendorContact);
  const ccRepo = manager.getRepository(VendorCcRecipient);
  const vendorTypeRepo = manager.getRepository(VendorTypeMaster);
  const officeTypeRepo = manager.getRepository(VendorOfficeTypeMap);

  const vendorTypeByCode = new Map(
    (
      await vendorTypeRepo.find({
        where: { typeCode: In(Object.values(VendorTypeCode)) },
      })
    ).map((vendorType) => [vendorType.typeCode, vendorType]),
  );

  const vendorByNormalizedName = new Map(
    (await vendorRepo.find()).map((vendor) => [vendor.normalizedName, vendor]),
  );
  const officeByKey = new Map(
    (await officeRepo.find()).map((office) => [
      buildPersistedOfficeKey(office),
      office,
    ]),
  );
  const contactsByOfficeId = groupByOffice(
    await contactRepo.find(),
    (contact) => buildPersistedContactKey(contact),
  );
  const ccByOfficeId = groupByOffice(await ccRepo.find(), (recipient) =>
    normalizeEmail(recipient.email),
  );
  const officeTypeKeys = new Set(
    (await officeTypeRepo.find()).map(
      (mapping) => `${mapping.officeId}::${mapping.vendorTypeId}`,
    ),
  );

  for (const aggregatedVendor of vendors.values()) {
    const vendor = await upsertVendor(
      vendorRepo,
      vendorByNormalizedName,
      aggregatedVendor,
    );
    let firstOfficeId: string | null = null;

    const offices = Array.from(aggregatedVendor.offices.values()).sort(
      (left, right) => left.firstSeenOrder - right.firstSeenOrder,
    );
    for (const aggregatedOffice of offices) {
      const office = await upsertOffice(
        officeRepo,
        officeByKey,
        vendor.id,
        aggregatedOffice,
      );
      firstOfficeId ??= office.id;

      await upsertOfficeTypes(
        officeTypeRepo,
        officeTypeKeys,
        vendorTypeByCode,
        office.id,
        aggregatedOffice.typeCodes,
      );
      await upsertContacts(
        contactRepo,
        contactsByOfficeId,
        office.id,
        Array.from(aggregatedOffice.contacts.values()),
      );
      await upsertCcRecipients(
        ccRepo,
        ccByOfficeId,
        office.id,
        Array.from(aggregatedOffice.ccEmails.values()),
      );
      if (locationContext) {
        await locationContext.syncOfficeLocations({
          officeId: office.id,
          vendorName: aggregatedVendor.companyName,
          officeName: aggregatedOffice.officeName,
          officeCountryName: aggregatedOffice.countryName,
          officeCityName: aggregatedOffice.cityName,
          typeCodes: aggregatedOffice.typeCodes,
          locationCandidates: aggregatedOffice.locationCandidates,
          capabilityHints: {
            isIataCertified: aggregatedOffice.capabilities.isIataCertified,
            doesSeaFreight: aggregatedOffice.capabilities.doesSeaFreight,
          },
        });
      }
    }

    const desiredPrimaryOfficeId = vendor.primaryOfficeId ?? firstOfficeId;
    if (vendor.primaryOfficeId !== desiredPrimaryOfficeId) {
      vendor.primaryOfficeId = desiredPrimaryOfficeId;
      await vendorRepo.save(vendor);
    }
  }

  const [vendorCount, officeCount, contactCount, ccCount, officeTypeCount] =
    await Promise.all([
      vendorRepo.count(),
      officeRepo.count(),
      contactRepo.count(),
      ccRepo.count(),
      officeTypeRepo.count(),
    ]);

  return {
    vendors: vendorCount,
    offices: officeCount,
    contacts: contactCount,
    ccRecipients: ccCount,
    officeTypeLinks: officeTypeCount,
  };
}

async function truncateVendorTables(manager: EntityManager) {
  await manager.query(`
    TRUNCATE TABLE
      "vendor_cc_recipients",
      "vendor_contacts",
      "vendor_office_ports",
      "vendor_office_service_locations",
      "vendor_office_type_map",
      "vendor_offices",
      "vendor_master"
    RESTART IDENTITY CASCADE
  `);
}

async function upsertVendor(
  vendorRepo: Repository<VendorMaster>,
  vendorByNormalizedName: Map<string, VendorMaster>,
  aggregatedVendor: AggregatedVendor,
) {
  const existing = vendorByNormalizedName.get(aggregatedVendor.normalizedName);
  if (existing) {
    existing.companyName =
      preferText(existing.companyName, aggregatedVendor.companyName) ??
      existing.companyName;
    existing.isActive = true;
    const saved = await vendorRepo.save(existing);
    vendorByNormalizedName.set(saved.normalizedName, saved);
    return saved;
  }

  const saved = await vendorRepo.save(
    vendorRepo.create({
      companyName: aggregatedVendor.companyName,
      normalizedName: aggregatedVendor.normalizedName,
      isActive: true,
      notes: null,
      primaryOfficeId: null,
    }),
  );
  vendorByNormalizedName.set(saved.normalizedName, saved);
  return saved;
}

async function upsertOffice(
  officeRepo: Repository<VendorOffice>,
  officeByKey: Map<string, VendorOffice>,
  vendorId: string,
  aggregatedOffice: AggregatedOffice,
) {
  const officeKey = `${vendorId}::${buildOfficeKey(aggregatedOffice.officeName)}`;
  const existing = officeByKey.get(officeKey);
  if (existing) {
    existing.cityName = preferText(
      existing.cityName,
      aggregatedOffice.cityName,
    );
    existing.stateName = preferText(
      existing.stateName,
      aggregatedOffice.stateName,
    );
    existing.countryName = preferText(
      existing.countryName,
      aggregatedOffice.countryName,
    );
    existing.addressRaw = mergeRawText(
      existing.addressRaw,
      aggregatedOffice.addressRaw,
    );
    existing.externalCode = preferText(
      existing.externalCode,
      aggregatedOffice.externalCode,
    );
    existing.specializationRaw = mergeRawText(
      existing.specializationRaw,
      aggregatedOffice.specializationRaw,
    );
    existing.isActive = true;
    existing.isIataCertified =
      existing.isIataCertified || aggregatedOffice.capabilities.isIataCertified;
    existing.doesSeaFreight =
      existing.doesSeaFreight || aggregatedOffice.capabilities.doesSeaFreight;
    existing.doesProjectCargo =
      existing.doesProjectCargo ||
      aggregatedOffice.capabilities.doesProjectCargo;
    existing.doesOwnConsolidation =
      existing.doesOwnConsolidation ||
      aggregatedOffice.capabilities.doesOwnConsolidation;
    existing.doesOwnTransportation =
      existing.doesOwnTransportation ||
      aggregatedOffice.capabilities.doesOwnTransportation;
    existing.doesOwnWarehousing =
      existing.doesOwnWarehousing ||
      aggregatedOffice.capabilities.doesOwnWarehousing;
    existing.doesOwnCustomClearance =
      existing.doesOwnCustomClearance ||
      aggregatedOffice.capabilities.doesOwnCustomClearance;
    const saved = await officeRepo.save(existing);
    officeByKey.set(officeKey, saved);
    return saved;
  }

  const saved = await officeRepo.save(
    officeRepo.create({
      vendorId,
      officeName: aggregatedOffice.officeName,
      cityName: aggregatedOffice.cityName,
      stateName: aggregatedOffice.stateName,
      countryName: aggregatedOffice.countryName,
      addressRaw: aggregatedOffice.addressRaw,
      externalCode: aggregatedOffice.externalCode,
      specializationRaw: aggregatedOffice.specializationRaw,
      isActive: true,
      isIataCertified: aggregatedOffice.capabilities.isIataCertified,
      doesSeaFreight: aggregatedOffice.capabilities.doesSeaFreight,
      doesProjectCargo: aggregatedOffice.capabilities.doesProjectCargo,
      doesOwnConsolidation: aggregatedOffice.capabilities.doesOwnConsolidation,
      doesOwnTransportation:
        aggregatedOffice.capabilities.doesOwnTransportation,
      doesOwnWarehousing: aggregatedOffice.capabilities.doesOwnWarehousing,
      doesOwnCustomClearance:
        aggregatedOffice.capabilities.doesOwnCustomClearance,
    }),
  );
  officeByKey.set(officeKey, saved);
  return saved;
}

async function upsertOfficeTypes(
  officeTypeRepo: Repository<VendorOfficeTypeMap>,
  officeTypeKeys: Set<string>,
  vendorTypeByCode: Map<VendorTypeCode, VendorTypeMaster>,
  officeId: string,
  typeCodes: Set<VendorTypeCode>,
) {
  for (const typeCode of typeCodes) {
    const vendorType = vendorTypeByCode.get(typeCode);
    if (!vendorType) {
      continue;
    }
    const mappingKey = `${officeId}::${vendorType.id}`;
    if (officeTypeKeys.has(mappingKey)) {
      continue;
    }
    await officeTypeRepo.save(
      officeTypeRepo.create({
        officeId,
        vendorTypeId: vendorType.id,
        isActive: true,
      }),
    );
    officeTypeKeys.add(mappingKey);
  }
}

async function upsertContacts(
  contactRepo: Repository<VendorContact>,
  contactsByOfficeId: Map<string, Map<string, VendorContact>>,
  officeId: string,
  parsedContacts: ParsedContact[],
) {
  const officeContacts =
    contactsByOfficeId.get(officeId) ?? new Map<string, VendorContact>();
  if (!contactsByOfficeId.has(officeId)) {
    contactsByOfficeId.set(officeId, officeContacts);
  }

  const existingPrimary = Array.from(officeContacts.values()).find(
    (contact) => contact.isPrimary,
  );
  const existingPrimaryKey = existingPrimary
    ? buildPersistedContactKey(existingPrimary)
    : null;
  const desiredPrimaryKey = buildContactKey(
    parsedContacts.find((contact) => contact.isPrimaryHint) ??
      parsedContacts[0],
  );

  for (const parsedContact of parsedContacts) {
    const contactKey = buildContactKey(parsedContact);
    if (!contactKey) {
      continue;
    }

    const isPrimary = existingPrimaryKey
      ? existingPrimaryKey === contactKey
      : desiredPrimaryKey === contactKey;

    const existing = officeContacts.get(contactKey);
    if (existing) {
      existing.contactName =
        preferText(existing.contactName, parsedContact.contactName) ??
        existing.contactName;
      existing.salutation = preferText(
        existing.salutation,
        parsedContact.salutation,
      );
      existing.designation = preferText(
        existing.designation,
        parsedContact.designation,
      );
      existing.emailPrimary = preferText(
        existing.emailPrimary,
        parsedContact.emailPrimary,
      );
      existing.emailSecondary = preferText(
        existing.emailSecondary,
        parsedContact.emailSecondary,
      );
      existing.mobile1 = preferText(existing.mobile1, parsedContact.mobile1);
      existing.mobile2 = preferText(existing.mobile2, parsedContact.mobile2);
      existing.landline = preferText(existing.landline, parsedContact.landline);
      existing.whatsappNumber = preferText(
        existing.whatsappNumber,
        parsedContact.whatsappNumber,
      );
      existing.isActive = true;
      existing.isPrimary = isPrimary;
      const saved = await contactRepo.save(existing);
      officeContacts.set(contactKey, saved);
      continue;
    }

    const saved = await contactRepo.save(
      contactRepo.create({
        officeId,
        contactName: parsedContact.contactName || 'General Desk',
        salutation: parsedContact.salutation,
        designation: parsedContact.designation,
        emailPrimary: parsedContact.emailPrimary,
        emailSecondary: parsedContact.emailSecondary,
        mobile1: parsedContact.mobile1,
        mobile2: parsedContact.mobile2,
        landline: parsedContact.landline,
        whatsappNumber: parsedContact.whatsappNumber,
        isPrimary,
        isActive: true,
        notes: null,
      }),
    );
    officeContacts.set(contactKey, saved);
  }
}

async function upsertCcRecipients(
  ccRepo: Repository<VendorCcRecipient>,
  ccByOfficeId: Map<string, Map<string, VendorCcRecipient>>,
  officeId: string,
  emails: string[],
) {
  const officeRecipients =
    ccByOfficeId.get(officeId) ?? new Map<string, VendorCcRecipient>();
  if (!ccByOfficeId.has(officeId)) {
    ccByOfficeId.set(officeId, officeRecipients);
  }

  for (const email of emails) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || officeRecipients.has(normalizedEmail)) {
      continue;
    }
    const saved = await ccRepo.save(
      ccRepo.create({
        officeId,
        email: normalizedEmail,
        isActive: true,
      }),
    );
    officeRecipients.set(normalizedEmail, saved);
  }
}

function groupByOffice<T extends { officeId: string }>(
  items: T[],
  keyBuilder: (item: T) => string | null,
) {
  const grouped = new Map<string, Map<string, T>>();
  for (const item of items) {
    const key = keyBuilder(item);
    if (!key) {
      continue;
    }
    const officeMap = grouped.get(item.officeId) ?? new Map<string, T>();
    officeMap.set(key, item);
    grouped.set(item.officeId, officeMap);
  }
  return grouped;
}

function buildPersistedOfficeKey(
  office: Pick<VendorOffice, 'vendorId' | 'officeName'>,
) {
  return `${office.vendorId}::${buildOfficeKey(office.officeName)}`;
}

function buildPersistedContactKey(
  contact: Pick<
    VendorContact,
    | 'contactName'
    | 'emailPrimary'
    | 'emailSecondary'
    | 'mobile1'
    | 'mobile2'
    | 'landline'
  >,
) {
  return buildContactKey({
    contactName: contact.contactName,
    salutation: null,
    designation: null,
    emailPrimary: contact.emailPrimary,
    emailSecondary: contact.emailSecondary,
    mobile1: contact.mobile1,
    mobile2: contact.mobile2,
    landline: contact.landline,
    whatsappNumber: null,
    isPrimaryHint: false,
  });
}

function buildOfficeKey(officeName: string) {
  return normalizeTextKey(officeName);
}

function buildContactKey(contact: ParsedContact | undefined): string | null {
  if (!contact) {
    return null;
  }
  const emailKey = normalizeEmail(
    contact.emailPrimary ?? contact.emailSecondary,
  );
  if (emailKey) {
    return emailKey;
  }
  const phoneKey = normalizePhone(
    contact.mobile1 ?? contact.mobile2 ?? contact.landline,
  );
  if (phoneKey) {
    return `${normalizeTextKey(contact.contactName)}::${phoneKey}`;
  }
  const nameKey = normalizeTextKey(contact.contactName);
  return nameKey || null;
}

function inferDomesticOfficeLabel(
  sheetName: string,
  locationRaw: string | null,
) {
  const iataLocation = IATA_SHEET_CITY_MAP[sheetName];
  if (iataLocation) {
    return {
      officeName: iataLocation.cityName,
      cityName: iataLocation.cityName,
      stateName: iataLocation.stateName,
    };
  }
  if (locationRaw && /pan india/i.test(locationRaw)) {
    return { officeName: 'Pan India', cityName: null, stateName: null };
  }
  if (locationRaw) {
    const firstToken =
      locationRaw
        .split(/[/,;]/)
        .map((token) => token.trim())
        .find(Boolean) ?? locationRaw;
    return { officeName: firstToken, cityName: firstToken, stateName: null };
  }
  return { officeName: `${sheetName} Desk`, cityName: null, stateName: null };
}

function deriveLocationCandidates(locationRaw: string | null) {
  const candidates = splitLocationCandidates(locationRaw);
  if (
    candidates.length > 1 &&
    /(?:plot|village|district|taluka|sector|post|po[-\s]|warehouse|road|\d)/i.test(
      locationRaw ?? '',
    )
  ) {
    return candidates.slice(0, 1);
  }

  return candidates;
}

function normalizeSheetTitle(sheetName: string) {
  return normalizeVendorSheetTitle(sheetName) ?? sheetName;
}

function readText(row: RowRecord, keys: string[]) {
  for (const key of keys) {
    const value = cleanText(row[key]);
    if (value) {
      return value;
    }
  }
  return null;
}

function readCompanyName(
  row: RowRecord,
  companyKeys: string[],
  emailKeys: string[],
) {
  const explicitCompanyName = readText(row, companyKeys);
  if (explicitCompanyName) {
    return normalizeVendorCompanyName(explicitCompanyName);
  }

  return normalizeVendorCompanyName(inferCompanyNameFromEmail(row, emailKeys));
}

function inferCompanyNameFromEmail(row: RowRecord, emailKeys: string[]) {
  const email = readFirstEmail(row, emailKeys);
  if (!email) {
    return null;
  }

  return inferVendorCompanyNameFromEmail(email);
}

function readEmails(row: RowRecord, keys: string[]) {
  const emails = new Set<string>();
  for (const key of keys) {
    for (const email of extractEmails(row[key])) {
      emails.add(email);
    }
  }
  return Array.from(emails);
}

function readFirstEmail(row: RowRecord, keys: string[]) {
  return readEmails(row, keys)[0] ?? null;
}

function readSecondEmail(row: RowRecord, keys: string[]) {
  return readEmails(row, keys)[1] ?? null;
}

function readPhones(row: RowRecord, keys: string[]) {
  const phones = new Set<string>();
  for (const key of keys) {
    for (const phone of extractPhoneNumbers(row[key])) {
      phones.add(phone);
    }
  }
  return Array.from(phones);
}

function readFirstPhone(row: RowRecord, keys: string[]) {
  return readPhones(row, keys)[0] ?? null;
}

function readSecondPhone(row: RowRecord, keys: string[]) {
  return readPhones(row, keys)[1] ?? null;
}

function sumVendors(
  vendors: Map<string, AggregatedVendor>,
  officeValue: (office: AggregatedOffice) => number,
) {
  let total = 0;
  for (const vendor of vendors.values()) {
    for (const office of vendor.offices.values()) {
      total += officeValue(office);
    }
  }
  return total;
}

function cleanText(value: unknown) {
  return optionalNormalizedText(value);
}

function normalizeTextKey(value: string | null | undefined) {
  return normalizeSharedTextKey(value);
}

function normalizeEmail(value: string | null | undefined) {
  return normalizeSharedEmail(value) ?? '';
}

function normalizePhone(value: string | null | undefined) {
  return normalizeSharedPhone(value) ?? '';
}

function extractEmails(value: unknown): string[] {
  return extractNormalizedEmails(value) as string[];
}

function extractPhoneNumbers(value: unknown): string[] {
  return extractNormalizedPhones(value);
}

function parseYesFlag(value: unknown) {
  return parseSharedYesFlag(value);
}

function buildName(
  first: string | null,
  second: string | null,
  third: string | null,
) {
  const parts = [first, second, third].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : null;
}

function preferText(
  current: string | null | undefined,
  candidate: string | null | undefined,
) {
  const currentValue = cleanText(current);
  const candidateValue = cleanText(candidate);
  if (!candidateValue) {
    return currentValue ?? null;
  }
  if (!currentValue) {
    return candidateValue;
  }
  return candidateValue.length > currentValue.length
    ? candidateValue
    : currentValue;
}

function mergeRawText(
  current: string | null | undefined,
  candidate: string | null | undefined,
) {
  const currentValue = cleanText(current);
  const candidateValue = cleanText(candidate);
  if (!currentValue) {
    return candidateValue ?? null;
  }
  if (!candidateValue || currentValue === candidateValue) {
    return currentValue;
  }
  return `${currentValue} | ${candidateValue}`;
}

function mergeCapabilities(
  current: CapabilityState,
  candidate: Partial<CapabilityState>,
) {
  return {
    isIataCertified:
      current.isIataCertified || Boolean(candidate.isIataCertified),
    doesSeaFreight: current.doesSeaFreight || Boolean(candidate.doesSeaFreight),
    doesProjectCargo:
      current.doesProjectCargo || Boolean(candidate.doesProjectCargo),
    doesOwnConsolidation:
      current.doesOwnConsolidation || Boolean(candidate.doesOwnConsolidation),
    doesOwnTransportation:
      current.doesOwnTransportation || Boolean(candidate.doesOwnTransportation),
    doesOwnWarehousing:
      current.doesOwnWarehousing || Boolean(candidate.doesOwnWarehousing),
    doesOwnCustomClearance:
      current.doesOwnCustomClearance ||
      Boolean(candidate.doesOwnCustomClearance),
  };
}
