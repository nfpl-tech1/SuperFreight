"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.runVendorImport = runVendorImport;
const path = __importStar(require("node:path"));
const XLSX = __importStar(require("xlsx"));
const typeorm_1 = require("typeorm");
const normalization_1 = require("../../common/normalization");
const vendor_normalization_1 = require("./domain/vendor-normalization");
const vendor_warnings_1 = require("./domain/vendor-warnings");
const vendor_cc_recipient_entity_1 = require("./entities/vendor-cc-recipient.entity");
const vendor_contact_entity_1 = require("./entities/vendor-contact.entity");
const import_source_audit_entity_1 = require("./entities/import-source-audit.entity");
const vendor_master_entity_1 = require("./entities/vendor-master.entity");
const vendor_office_type_map_entity_1 = require("./entities/vendor-office-type-map.entity");
const vendor_office_entity_1 = require("./entities/vendor-office.entity");
const vendor_type_master_entity_1 = require("./entities/vendor-type-master.entity");
const vendor_location_importer_1 = require("./vendor-location-importer");
const EMPTY_CAPABILITIES = {
    isIataCertified: false,
    doesSeaFreight: false,
    doesProjectCargo: false,
    doesOwnConsolidation: false,
    doesOwnTransportation: false,
    doesOwnWarehousing: false,
    doesOwnCustomClearance: false,
};
const DOMESTIC_SHEET_TYPE_MAP = {
    Transporter: vendor_type_master_entity_1.VendorTypeCode.TRANSPORTER,
    'CFS Buffer Yard': vendor_type_master_entity_1.VendorTypeCode.CFS_BUFFER_YARD,
    CHA: vendor_type_master_entity_1.VendorTypeCode.CHA,
    'IATA (Mum)': vendor_type_master_entity_1.VendorTypeCode.IATA,
    'IATA (Del)': vendor_type_master_entity_1.VendorTypeCode.IATA,
    'IATA (Ahm)': vendor_type_master_entity_1.VendorTypeCode.IATA,
    'IATA (Maa)': vendor_type_master_entity_1.VendorTypeCode.IATA,
    'Co-Loader': vendor_type_master_entity_1.VendorTypeCode.CO_LOADER,
    'Carrier Master': vendor_type_master_entity_1.VendorTypeCode.CARRIER,
    Packers: vendor_type_master_entity_1.VendorTypeCode.PACKER,
    Licensing: vendor_type_master_entity_1.VendorTypeCode.LICENSING,
    'Shipping Line': vendor_type_master_entity_1.VendorTypeCode.SHIPPING_LINE,
};
const IATA_SHEET_CITY_MAP = {
    'IATA (Mum)': { cityName: 'Mumbai', stateName: 'Maharashtra' },
    'IATA (Del)': { cityName: 'Delhi', stateName: null },
    'IATA (Ahm)': { cityName: 'Ahmedabad', stateName: 'Gujarat' },
    'IATA (Maa)': { cityName: 'Chennai', stateName: 'Tamil Nadu' },
};
const WCA_SHEET_OVERRIDES = {
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
async function runVendorImport(dataSource, options) {
    const shouldLinkLocations = options.linkLocations !== false;
    const warnings = [];
    const skippedRows = [];
    const vendors = new Map();
    const workbookSummaries = [];
    let rowsRead = 0;
    let rowsSkipped = 0;
    let officeSequence = 0;
    const workbooks = [
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
        const stats = parseWorkbook(workbookInput.path, workbookInput.kind, options.wcaCountries ?? Array.from(vendor_location_importer_1.DEFAULT_ALLOWED_WCA_COUNTRIES), warnings, vendors, () => ++officeSequence, (row) => {
            skippedRows.push(row);
            options.onSkippedRow?.(row);
        });
        workbookSummaries.push(stats);
        rowsRead += stats.rowsRead;
        rowsSkipped += stats.rowsSkipped;
    }
    const summary = {
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
        const reviewContext = await (0, vendor_location_importer_1.createVendorLocationImportContext)(dataSource.manager);
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
            ? await (0, vendor_location_importer_1.createVendorLocationImportContext)(manager, options.regionsWorkbookPath, options.portMasterWorkbookPath)
            : null;
        const vendorDatabaseSummary = await persistVendorImport(manager, vendors, locationContext);
        const regularWcaOverlaySummary = options.regularWcaWorkbookPath
            ? await (0, vendor_location_importer_1.applyRegularWcaOverlay)(manager, options.regularWcaWorkbookPath, options.wcaCountries ?? Array.from(vendor_location_importer_1.DEFAULT_ALLOWED_WCA_COUNTRIES))
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
async function persistImportAuditRows(manager, skippedRows, locationSummary) {
    if (skippedRows.length === 0) {
        return;
    }
    const auditRepo = manager.getRepository(import_source_audit_entity_1.ImportSourceAudit);
    await auditRepo.save(skippedRows.map((row) => auditRepo.create({
        sourceWorkbook: row.workbook,
        sourceSheet: row.sheetName,
        sourceRowNumber: row.rowNumber,
        entityKind: import_source_audit_entity_1.ImportSourceAuditEntityKind.VENDOR,
        action: import_source_audit_entity_1.ImportSourceAuditAction.SKIPPED,
        confidence: row.reason === 'unresolved' ? 'LOW' : null,
        normalizedKey: buildSkippedRowKey(row),
        vendorId: null,
        officeId: null,
        portId: null,
        serviceLocationId: null,
        reason: row.reason,
        rawPayloadJson: row.rowData,
    })));
    locationSummary.auditRowsCreated += skippedRows.length;
}
function buildSkippedRowKey(row) {
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
        const normalized = (0, vendor_normalization_1.normalizeVendorNameKey)((0, normalization_1.optionalText)(value));
        if (normalized) {
            return normalized;
        }
    }
    return null;
}
function parseWorkbook(workbookPath, kind, allowedWcaCountries, warnings, vendors, nextOfficeSequence, onSkippedRow) {
    const workbook = XLSX.readFile(workbookPath, {
        cellDates: false,
        raw: false,
    });
    const stats = {
        workbook: path.basename(workbookPath),
        sheetsProcessed: 0,
        rowsRead: 0,
        rowsSkipped: 0,
    };
    for (const sheetName of workbook.SheetNames) {
        if (kind === 'wca' && !(0, vendor_location_importer_1.isAllowedWcaSheet)(sheetName, allowedWcaCountries)) {
            continue;
        }
        if (kind === 'carrier' && !isSupportedCarrierSheet(sheetName)) {
            continue;
        }
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) {
            continue;
        }
        const rows = XLSX.utils.sheet_to_json(sheet, {
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
function parseSheetRow(kind, sheetName, row, warnings) {
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
function parseDomesticRow(sheetName, row, warnings) {
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
function parseTemplateRow(sheetName, row, warnings) {
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
function determineSkipReason(kind, sheetName, row) {
    if (kind === 'wca' || kind === 'regular_wca') {
        return readCompanyName(row, ['COMPANY NAME'], ['EMAIL ID 1'])
            ? 'unresolved'
            : 'missing_company';
    }
    if (kind === 'carrier') {
        return readCompanyName(row, ['Carrier'], ['TO email ID', 'CC email ID', 'Additional IDs'])
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
        return readCompanyName(row, ['Co Loader', 'Co-Loader', 'Co Loader '], ['Email id', 'Email id 2', 'Email id_1'])
            ? 'unresolved'
            : 'missing_company';
    }
    if (sheetName === 'Carrier Master') {
        return readCompanyName(row, ['Carrier'], ['TO email ID', 'CC email ID', 'Additional IDs'])
            ? 'unresolved'
            : 'missing_company';
    }
    return readCompanyName(row, [
        'Company Name ',
        'Compant Name ',
        'Compant Name',
        'COMPANY NAME',
        'Carrier',
        'Agent',
    ], ['Email ID', 'EMAIL ID 1', 'TO email ID', 'Email id', 'Email id 2'])
        ? 'unresolved'
        : 'missing_company';
}
function parseWcaRow(sheetName, row, warnings) {
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
            officeName: readText(row, ['STATE']) ??
                override?.officeName ??
                normalizedSheetTitle,
            countryName: override?.countryName ?? (0, vendor_location_importer_1.resolveWcaSheetCountry)(sheetName),
            cityName: stateName,
            stateName,
            addressRaw: null,
            externalCode: readText(row, ['CODE']),
            specializationRaw: readText(row, ['Specialisation (if any)']),
            typeCodes: [vendor_type_master_entity_1.VendorTypeCode.WCA_AGENT],
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
                    contactName: buildName(readText(row, ['Salutation']), readText(row, ['First Name']), readText(row, ['Surname'])) ?? 'General Desk',
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
function parseCarrierSheetRow(sheetName, row, warnings) {
    const normalizedSheetTitle = normalizeSheetTitle(sheetName);
    if (!isSupportedCarrierSheet(sheetName)) {
        warnings.push(`Skipped unsupported carrier sheet "${sheetName}".`);
        return [];
    }
    return parseRegionalCarrierCoverageRow(sheetName, row);
}
function parseSimpleCompanyContactRow(row, typeCode, countryName, sheetName) {
    const companyName = readCompanyName(row, [
        'Company Name ',
        'Compant Name ',
        'Compant Name',
        'COMPANY NAME',
        'Carrier',
        'Agent',
    ], ['Email ID', 'EMAIL ID 1', 'TO email ID', 'Email id', 'Email id 2']);
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
                isIataCertified: typeCode === vendor_type_master_entity_1.VendorTypeCode.IATA,
                doesOwnTransportation: typeCode === vendor_type_master_entity_1.VendorTypeCode.TRANSPORTER,
            },
            contacts: [
                {
                    contactName: readText(row, ['Name ', 'Name', 'Sales Person']) ?? 'General Desk',
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
                    mobile2: readFirstPhone(row, ['Mobile 2']) ??
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
function isSupportedCarrierSheet(sheetName) {
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
function parseCarrierMasterRow(row) {
    const companyName = readCompanyName(row, ['Carrier'], ['TO email ID', 'CC email ID', 'Additional IDs']);
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
            typeCodes: [vendor_type_master_entity_1.VendorTypeCode.CARRIER],
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
            locationCandidates: (0, vendor_location_importer_1.splitLocationCandidates)(portLabel),
        },
    ];
}
function parseCarrierCoverageRow(row) {
    const companyName = readCompanyName(row, ['Carrier'], ['TO email ID', 'CC email ID', 'Additional IDs']);
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
            typeCodes: [vendor_type_master_entity_1.VendorTypeCode.CARRIER],
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
            locationCandidates: (0, vendor_location_importer_1.splitLocationCandidates)(portLabel),
        },
    ];
}
function parseRegionalCarrierCoverageRow(sheetName, row) {
    const companyName = readCompanyName(row, ['Carrier'], ['TO email ID', 'CC email ID', 'Additional IDs']);
    if (!companyName) {
        return [];
    }
    const normalizedSheetKey = normalizeTextKey(normalizeSheetTitle(sheetName));
    const portLabel = readText(row, ['Port', 'POL']);
    const officeName = normalizedSheetKey === normalizeTextKey('Mumbai CARRIER MASTER')
        ? 'Mumbai'
        : normalizedSheetKey === normalizeTextKey('Chennai Carrier Master')
            ? 'Chennai'
            : normalizedSheetKey === normalizeTextKey('Cochin Carrier Master')
                ? 'Kochi'
                : normalizedSheetKey === normalizeTextKey('Egypt Carrier Master')
                    ? 'Egypt Desk'
                    : (portLabel ?? 'Carrier Desk');
    const countryName = normalizedSheetKey === normalizeTextKey('Egypt Carrier Master')
        ? 'Egypt'
        : 'India';
    const cityName = normalizedSheetKey === normalizeTextKey('Mumbai CARRIER MASTER')
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
            typeCodes: [vendor_type_master_entity_1.VendorTypeCode.CARRIER],
            capabilities: { doesSeaFreight: true },
            contacts: [
                {
                    contactName: buildName(readText(row, ['Name']), readText(row, ['Last name']), null) ?? 'General Desk',
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
            locationCandidates: (0, vendor_location_importer_1.splitLocationCandidates)(portLabel),
        },
    ];
}
function parseCoLoaderRow(row, countryName) {
    const companyName = readCompanyName(row, ['Co Loader', 'Co-Loader', 'Co Loader '], ['Email id', 'Email id 2']);
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
            typeCodes: [vendor_type_master_entity_1.VendorTypeCode.CO_LOADER],
            capabilities: {},
            contacts: [
                {
                    contactName: buildName(readText(row, ['Sales Person']), readText(row, ['__EMPTY', '__EMPTY_1']), null) ?? 'General Desk',
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
function parseTemplateCoLoaderRow(row) {
    const companyName = readCompanyName(row, ['Co Loader'], ['Email id', 'Email id_1', 'Email id 2']);
    if (!companyName) {
        return [];
    }
    const contacts = [
        {
            contactName: buildName(readText(row, ['First Name']), readText(row, ['Last Name']), null) ?? 'General Desk',
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
            typeCodes: [vendor_type_master_entity_1.VendorTypeCode.CO_LOADER],
            capabilities: {},
            contacts,
            ccEmails: [],
            locationCandidates: [],
        },
    ];
}
function parseIataMumbaiRow(row) {
    const companyName = readCompanyName(row, ['Agent'], ['Email id', 'Email id 2']);
    if (!companyName) {
        return [];
    }
    const contacts = [
        {
            contactName: buildName(readText(row, ['Sales Person']), readText(row, ['__EMPTY', '__EMPTY_1']), null) ?? 'General Desk',
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
            typeCodes: [vendor_type_master_entity_1.VendorTypeCode.IATA],
            capabilities: { isIataCertified: true },
            contacts,
            ccEmails: [],
            locationCandidates: ['Mumbai'],
        },
    ];
}
function parseRegionalIataRow(sheetName, row) {
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
            typeCodes: [vendor_type_master_entity_1.VendorTypeCode.IATA],
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
function addParsedOfficeRow(vendors, parsedRow, officeSequence) {
    const companyName = (0, vendor_normalization_1.normalizeVendorCompanyName)(parsedRow.companyName);
    if (!companyName) {
        return;
    }
    const normalizedName = (0, vendor_normalization_1.normalizeVendorNameKey)(companyName);
    let vendor = vendors.get(normalizedName);
    if (!vendor) {
        vendor = {
            companyName,
            normalizedName,
            offices: new Map(),
        };
        vendors.set(normalizedName, vendor);
    }
    else {
        vendor.companyName =
            preferText(vendor.companyName, companyName) ?? vendor.companyName;
    }
    const officeName = (0, vendor_normalization_1.normalizeVendorOfficeName)(parsedRow.officeName);
    if (!officeName) {
        return;
    }
    const officeKey = buildOfficeKey(officeName);
    let office = vendor.offices.get(officeKey);
    if (!office) {
        office = {
            officeName,
            cityName: (0, vendor_normalization_1.normalizeVendorLocationName)(parsedRow.cityName),
            stateName: (0, vendor_normalization_1.normalizeVendorLocationName)(parsedRow.stateName),
            countryName: (0, vendor_normalization_1.normalizeVendorLocationName)(parsedRow.countryName),
            addressRaw: (0, vendor_normalization_1.normalizeVendorAddress)(parsedRow.addressRaw),
            externalCode: (0, vendor_normalization_1.normalizeVendorExternalCode)(parsedRow.externalCode),
            specializationRaw: (0, vendor_normalization_1.normalizeVendorFreeText)(parsedRow.specializationRaw),
            typeCodes: new Set(parsedRow.typeCodes),
            capabilities: mergeCapabilities({ ...EMPTY_CAPABILITIES }, parsedRow.capabilities),
            contacts: new Map(),
            ccEmails: new Set(parsedRow.ccEmails
                .map((email) => (0, vendor_normalization_1.normalizeVendorEmail)(email))
                .filter((email) => Boolean(email))),
            locationCandidates: new Set(parsedRow.locationCandidates
                .map((candidate) => (0, vendor_normalization_1.normalizeVendorLocationName)(candidate))
                .filter((candidate) => Boolean(candidate))),
            firstSeenOrder: officeSequence,
        };
        vendor.offices.set(officeKey, office);
    }
    else {
        office.cityName = preferText(office.cityName, (0, vendor_normalization_1.normalizeVendorLocationName)(parsedRow.cityName));
        office.stateName = preferText(office.stateName, (0, vendor_normalization_1.normalizeVendorLocationName)(parsedRow.stateName));
        office.countryName = preferText(office.countryName, (0, vendor_normalization_1.normalizeVendorLocationName)(parsedRow.countryName));
        office.addressRaw = mergeRawText(office.addressRaw, (0, vendor_normalization_1.normalizeVendorAddress)(parsedRow.addressRaw));
        office.externalCode = preferText(office.externalCode, (0, vendor_normalization_1.normalizeVendorExternalCode)(parsedRow.externalCode));
        office.specializationRaw = mergeRawText(office.specializationRaw, (0, vendor_normalization_1.normalizeVendorFreeText)(parsedRow.specializationRaw));
        office.capabilities = mergeCapabilities(office.capabilities, parsedRow.capabilities);
        for (const typeCode of parsedRow.typeCodes) {
            office.typeCodes.add(typeCode);
        }
        for (const ccEmail of parsedRow.ccEmails) {
            const normalizedCcEmail = (0, vendor_normalization_1.normalizeVendorEmail)(ccEmail);
            if (normalizedCcEmail) {
                office.ccEmails.add(normalizedCcEmail);
            }
        }
        for (const locationCandidate of parsedRow.locationCandidates) {
            const normalizedLocationCandidate = (0, vendor_normalization_1.normalizeVendorLocationName)(locationCandidate);
            if (normalizedLocationCandidate) {
                office.locationCandidates.add(normalizedLocationCandidate);
            }
        }
    }
    for (const contact of parsedRow.contacts) {
        const sanitizedContact = {
            contactName: (0, vendor_normalization_1.normalizeVendorContactName)(contact.contactName) ?? 'General Desk',
            salutation: (0, vendor_normalization_1.normalizeVendorSalutation)(contact.salutation),
            designation: (0, vendor_normalization_1.normalizeVendorDesignation)(contact.designation),
            emailPrimary: (0, vendor_normalization_1.normalizeVendorEmail)(contact.emailPrimary),
            emailSecondary: (0, vendor_normalization_1.normalizeVendorEmail)(contact.emailSecondary),
            mobile1: (0, vendor_normalization_1.normalizeVendorPhone)(contact.mobile1),
            mobile2: (0, vendor_normalization_1.normalizeVendorPhone)(contact.mobile2),
            landline: (0, vendor_normalization_1.normalizeVendorPhone)(contact.landline),
            whatsappNumber: (0, vendor_normalization_1.normalizeVendorPhone)(contact.whatsappNumber),
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
            contactName: preferText(existing.contactName, sanitizedContact.contactName) ??
                'General Desk',
            salutation: preferText(existing.salutation, sanitizedContact.salutation),
            designation: preferText(existing.designation, sanitizedContact.designation),
            emailPrimary: preferText(existing.emailPrimary, sanitizedContact.emailPrimary),
            emailSecondary: preferText(existing.emailSecondary, sanitizedContact.emailSecondary),
            mobile1: preferText(existing.mobile1, sanitizedContact.mobile1),
            mobile2: preferText(existing.mobile2, sanitizedContact.mobile2),
            landline: preferText(existing.landline, sanitizedContact.landline),
            whatsappNumber: preferText(existing.whatsappNumber, sanitizedContact.whatsappNumber),
            isPrimaryHint: existing.isPrimaryHint || sanitizedContact.isPrimaryHint,
        });
    }
}
async function previewVendorLocationLinks(locationContext, vendors) {
    for (const aggregatedVendor of vendors.values()) {
        const offices = Array.from(aggregatedVendor.offices.values()).sort((left, right) => left.firstSeenOrder - right.firstSeenOrder);
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
async function persistVendorImport(manager, vendors, locationContext) {
    const vendorRepo = manager.getRepository(vendor_master_entity_1.VendorMaster);
    const officeRepo = manager.getRepository(vendor_office_entity_1.VendorOffice);
    const contactRepo = manager.getRepository(vendor_contact_entity_1.VendorContact);
    const ccRepo = manager.getRepository(vendor_cc_recipient_entity_1.VendorCcRecipient);
    const vendorTypeRepo = manager.getRepository(vendor_type_master_entity_1.VendorTypeMaster);
    const officeTypeRepo = manager.getRepository(vendor_office_type_map_entity_1.VendorOfficeTypeMap);
    const vendorTypeByCode = new Map((await vendorTypeRepo.find({
        where: { typeCode: (0, typeorm_1.In)(Object.values(vendor_type_master_entity_1.VendorTypeCode)) },
    })).map((vendorType) => [vendorType.typeCode, vendorType]));
    const vendorByNormalizedName = new Map((await vendorRepo.find()).map((vendor) => [vendor.normalizedName, vendor]));
    const officeByKey = new Map((await officeRepo.find()).map((office) => [
        buildPersistedOfficeKey(office),
        office,
    ]));
    const contactsByOfficeId = groupByOffice(await contactRepo.find(), (contact) => buildPersistedContactKey(contact));
    const ccByOfficeId = groupByOffice(await ccRepo.find(), (recipient) => normalizeEmail(recipient.email));
    const officeTypeKeys = new Set((await officeTypeRepo.find()).map((mapping) => `${mapping.officeId}::${mapping.vendorTypeId}`));
    for (const aggregatedVendor of vendors.values()) {
        const vendor = await upsertVendor(vendorRepo, vendorByNormalizedName, aggregatedVendor);
        let firstOfficeId = null;
        const offices = Array.from(aggregatedVendor.offices.values()).sort((left, right) => left.firstSeenOrder - right.firstSeenOrder);
        for (const aggregatedOffice of offices) {
            const office = await upsertOffice(officeRepo, officeByKey, vendor.id, aggregatedOffice);
            firstOfficeId ??= office.id;
            await upsertOfficeTypes(officeTypeRepo, officeTypeKeys, vendorTypeByCode, office.id, aggregatedOffice.typeCodes);
            await upsertContacts(contactRepo, contactsByOfficeId, office.id, Array.from(aggregatedOffice.contacts.values()));
            await upsertCcRecipients(ccRepo, ccByOfficeId, office.id, Array.from(aggregatedOffice.ccEmails.values()));
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
    const [vendorCount, officeCount, contactCount, ccCount, officeTypeCount] = await Promise.all([
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
async function truncateVendorTables(manager) {
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
async function upsertVendor(vendorRepo, vendorByNormalizedName, aggregatedVendor) {
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
    const saved = await vendorRepo.save(vendorRepo.create({
        companyName: aggregatedVendor.companyName,
        normalizedName: aggregatedVendor.normalizedName,
        isActive: true,
        notes: null,
        primaryOfficeId: null,
    }));
    vendorByNormalizedName.set(saved.normalizedName, saved);
    return saved;
}
async function upsertOffice(officeRepo, officeByKey, vendorId, aggregatedOffice) {
    const officeKey = `${vendorId}::${buildOfficeKey(aggregatedOffice.officeName)}`;
    const existing = officeByKey.get(officeKey);
    if (existing) {
        existing.cityName = preferText(existing.cityName, aggregatedOffice.cityName);
        existing.stateName = preferText(existing.stateName, aggregatedOffice.stateName);
        existing.countryName = preferText(existing.countryName, aggregatedOffice.countryName);
        existing.addressRaw = mergeRawText(existing.addressRaw, aggregatedOffice.addressRaw);
        existing.externalCode = preferText(existing.externalCode, aggregatedOffice.externalCode);
        existing.specializationRaw = mergeRawText(existing.specializationRaw, aggregatedOffice.specializationRaw);
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
    const saved = await officeRepo.save(officeRepo.create({
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
        doesOwnTransportation: aggregatedOffice.capabilities.doesOwnTransportation,
        doesOwnWarehousing: aggregatedOffice.capabilities.doesOwnWarehousing,
        doesOwnCustomClearance: aggregatedOffice.capabilities.doesOwnCustomClearance,
    }));
    officeByKey.set(officeKey, saved);
    return saved;
}
async function upsertOfficeTypes(officeTypeRepo, officeTypeKeys, vendorTypeByCode, officeId, typeCodes) {
    for (const typeCode of typeCodes) {
        const vendorType = vendorTypeByCode.get(typeCode);
        if (!vendorType) {
            continue;
        }
        const mappingKey = `${officeId}::${vendorType.id}`;
        if (officeTypeKeys.has(mappingKey)) {
            continue;
        }
        await officeTypeRepo.save(officeTypeRepo.create({
            officeId,
            vendorTypeId: vendorType.id,
            isActive: true,
        }));
        officeTypeKeys.add(mappingKey);
    }
}
async function upsertContacts(contactRepo, contactsByOfficeId, officeId, parsedContacts) {
    const officeContacts = contactsByOfficeId.get(officeId) ?? new Map();
    if (!contactsByOfficeId.has(officeId)) {
        contactsByOfficeId.set(officeId, officeContacts);
    }
    const existingPrimary = Array.from(officeContacts.values()).find((contact) => contact.isPrimary);
    const existingPrimaryKey = existingPrimary
        ? buildPersistedContactKey(existingPrimary)
        : null;
    const desiredPrimaryKey = buildContactKey(parsedContacts.find((contact) => contact.isPrimaryHint) ??
        parsedContacts[0]);
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
            existing.salutation = preferText(existing.salutation, parsedContact.salutation);
            existing.designation = preferText(existing.designation, parsedContact.designation);
            existing.emailPrimary = preferText(existing.emailPrimary, parsedContact.emailPrimary);
            existing.emailSecondary = preferText(existing.emailSecondary, parsedContact.emailSecondary);
            existing.mobile1 = preferText(existing.mobile1, parsedContact.mobile1);
            existing.mobile2 = preferText(existing.mobile2, parsedContact.mobile2);
            existing.landline = preferText(existing.landline, parsedContact.landline);
            existing.whatsappNumber = preferText(existing.whatsappNumber, parsedContact.whatsappNumber);
            existing.isActive = true;
            existing.isPrimary = isPrimary;
            const saved = await contactRepo.save(existing);
            officeContacts.set(contactKey, saved);
            continue;
        }
        const saved = await contactRepo.save(contactRepo.create({
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
        }));
        officeContacts.set(contactKey, saved);
    }
}
async function upsertCcRecipients(ccRepo, ccByOfficeId, officeId, emails) {
    const officeRecipients = ccByOfficeId.get(officeId) ?? new Map();
    if (!ccByOfficeId.has(officeId)) {
        ccByOfficeId.set(officeId, officeRecipients);
    }
    for (const email of emails) {
        const normalizedEmail = normalizeEmail(email);
        if (!normalizedEmail || officeRecipients.has(normalizedEmail)) {
            continue;
        }
        const saved = await ccRepo.save(ccRepo.create({
            officeId,
            email: normalizedEmail,
            isActive: true,
        }));
        officeRecipients.set(normalizedEmail, saved);
    }
}
function groupByOffice(items, keyBuilder) {
    const grouped = new Map();
    for (const item of items) {
        const key = keyBuilder(item);
        if (!key) {
            continue;
        }
        const officeMap = grouped.get(item.officeId) ?? new Map();
        officeMap.set(key, item);
        grouped.set(item.officeId, officeMap);
    }
    return grouped;
}
function buildPersistedOfficeKey(office) {
    return `${office.vendorId}::${buildOfficeKey(office.officeName)}`;
}
function buildPersistedContactKey(contact) {
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
function buildOfficeKey(officeName) {
    return normalizeTextKey(officeName);
}
function buildContactKey(contact) {
    if (!contact) {
        return null;
    }
    const emailKey = normalizeEmail(contact.emailPrimary ?? contact.emailSecondary);
    if (emailKey) {
        return emailKey;
    }
    const phoneKey = normalizePhone(contact.mobile1 ?? contact.mobile2 ?? contact.landline);
    if (phoneKey) {
        return `${normalizeTextKey(contact.contactName)}::${phoneKey}`;
    }
    const nameKey = normalizeTextKey(contact.contactName);
    return nameKey || null;
}
function inferDomesticOfficeLabel(sheetName, locationRaw) {
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
        const firstToken = locationRaw
            .split(/[/,;]/)
            .map((token) => token.trim())
            .find(Boolean) ?? locationRaw;
        return { officeName: firstToken, cityName: firstToken, stateName: null };
    }
    return { officeName: `${sheetName} Desk`, cityName: null, stateName: null };
}
function deriveLocationCandidates(locationRaw) {
    const candidates = (0, vendor_location_importer_1.splitLocationCandidates)(locationRaw);
    if (candidates.length > 1 &&
        /(?:plot|village|district|taluka|sector|post|po[-\s]|warehouse|road|\d)/i.test(locationRaw ?? '')) {
        return candidates.slice(0, 1);
    }
    return candidates;
}
function normalizeSheetTitle(sheetName) {
    return (0, vendor_normalization_1.normalizeVendorSheetTitle)(sheetName) ?? sheetName;
}
function readText(row, keys) {
    for (const key of keys) {
        const value = cleanText(row[key]);
        if (value) {
            return value;
        }
    }
    return null;
}
function readCompanyName(row, companyKeys, emailKeys) {
    const explicitCompanyName = readText(row, companyKeys);
    if (explicitCompanyName) {
        return (0, vendor_normalization_1.normalizeVendorCompanyName)(explicitCompanyName);
    }
    return (0, vendor_normalization_1.normalizeVendorCompanyName)(inferCompanyNameFromEmail(row, emailKeys));
}
function inferCompanyNameFromEmail(row, emailKeys) {
    const email = readFirstEmail(row, emailKeys);
    if (!email) {
        return null;
    }
    return (0, vendor_warnings_1.inferVendorCompanyNameFromEmail)(email);
}
function readEmails(row, keys) {
    const emails = new Set();
    for (const key of keys) {
        for (const email of extractEmails(row[key])) {
            emails.add(email);
        }
    }
    return Array.from(emails);
}
function readFirstEmail(row, keys) {
    return readEmails(row, keys)[0] ?? null;
}
function readSecondEmail(row, keys) {
    return readEmails(row, keys)[1] ?? null;
}
function readPhones(row, keys) {
    const phones = new Set();
    for (const key of keys) {
        for (const phone of extractPhoneNumbers(row[key])) {
            phones.add(phone);
        }
    }
    return Array.from(phones);
}
function readFirstPhone(row, keys) {
    return readPhones(row, keys)[0] ?? null;
}
function readSecondPhone(row, keys) {
    return readPhones(row, keys)[1] ?? null;
}
function sumVendors(vendors, officeValue) {
    let total = 0;
    for (const vendor of vendors.values()) {
        for (const office of vendor.offices.values()) {
            total += officeValue(office);
        }
    }
    return total;
}
function cleanText(value) {
    return (0, normalization_1.optionalText)(value);
}
function normalizeTextKey(value) {
    return (0, normalization_1.normalizeTextKey)(value);
}
function normalizeEmail(value) {
    return (0, normalization_1.normalizeEmail)(value) ?? '';
}
function normalizePhone(value) {
    return (0, normalization_1.normalizePhone)(value) ?? '';
}
function extractEmails(value) {
    return (0, normalization_1.extractEmails)(value);
}
function extractPhoneNumbers(value) {
    return (0, normalization_1.extractPhoneNumbers)(value);
}
function parseYesFlag(value) {
    return (0, normalization_1.parseYesFlag)(value);
}
function buildName(first, second, third) {
    const parts = [first, second, third].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : null;
}
function preferText(current, candidate) {
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
function mergeRawText(current, candidate) {
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
function mergeCapabilities(current, candidate) {
    return {
        isIataCertified: current.isIataCertified || Boolean(candidate.isIataCertified),
        doesSeaFreight: current.doesSeaFreight || Boolean(candidate.doesSeaFreight),
        doesProjectCargo: current.doesProjectCargo || Boolean(candidate.doesProjectCargo),
        doesOwnConsolidation: current.doesOwnConsolidation || Boolean(candidate.doesOwnConsolidation),
        doesOwnTransportation: current.doesOwnTransportation || Boolean(candidate.doesOwnTransportation),
        doesOwnWarehousing: current.doesOwnWarehousing || Boolean(candidate.doesOwnWarehousing),
        doesOwnCustomClearance: current.doesOwnCustomClearance ||
            Boolean(candidate.doesOwnCustomClearance),
    };
}
//# sourceMappingURL=vendor-importer.js.map