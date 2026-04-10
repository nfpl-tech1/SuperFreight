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
exports.runCarrierExportCoverageImport = runCarrierExportCoverageImport;
const XLSX = __importStar(require("xlsx"));
const normalization_1 = require("../../common/normalization");
const vendor_normalization_1 = require("./domain/vendor-normalization");
const port_alias_entity_1 = require("./entities/port-alias.entity");
const port_master_entity_1 = require("./entities/port-master.entity");
const vendor_master_entity_1 = require("./entities/vendor-master.entity");
const vendor_office_port_entity_1 = require("./entities/vendor-office-port.entity");
const vendor_office_entity_1 = require("./entities/vendor-office.entity");
const EXPORT_SERVICE_SHEET = 'EXPORT SERVICE LIST';
const MUMBAI_CARRIER_SHEET = 'Mumbai CARRIER MASTER';
const CHENNAI_CARRIER_SHEET = 'Chennai Carrier Master';
const COVERAGE_SOURCE_NOTE = 'Imported from Carrier Master.xlsx / EXPORT SERVICE LIST';
const PORT_LABEL_FIXES = {
    COCHIN: 'Kochi',
    CHITTAGONG: 'Chattogram',
    CHATTOGRAM: 'Chattogram',
    'NHAVA SHEVA': 'Nhava Sheva',
    'NAVA SHEVA': 'Nhava Sheva',
    NAVASEVA: 'Nhava Sheva',
    PUSAN: 'Busan',
    'PORT KELANG': 'Port Klang',
    LEHARVE: 'Le Havre',
    'LE HARVE': 'Le Havre',
};
async function runCarrierExportCoverageImport(dataSource, options) {
    const workbook = XLSX.readFile(options.workbookPath, {
        cellDates: false,
        raw: false,
    });
    const masterRows = parseMasterOfficeIdentities(workbook);
    const exportRows = parseExportCoverageRows(workbook);
    const statusCounts = createStatusCounter();
    const uniqueOfficePortPairKeys = new Set();
    const runner = async (manager) => {
        const context = await buildCoverageContext(manager);
        const portOverridesByRowNumber = new Map((options.portOverrides ?? []).map((override) => [override.rowNumber, override]));
        let rowsMatchedToOffice = 0;
        let rowsMatchedToPort = 0;
        let rowsReadyToLink = 0;
        let linksCreated = 0;
        let linksAlreadyPresent = 0;
        for (const row of exportRows) {
            const masterCandidates = masterRows.get(row.vendorKey) ?? [];
            if (masterCandidates.length === 0) {
                const reviewItem = buildBaseReviewItem(row);
                reviewItem.status = 'vendor_not_in_master';
                reviewItem.notes =
                    'Carrier was not found in the Mumbai or Chennai carrier master sheets.';
                emitReviewItem(options, statusCounts, reviewItem);
                continue;
            }
            const officeMatches = resolveOfficeMatches(row, masterCandidates);
            if (officeMatches.length === 0) {
                const reviewItem = buildBaseReviewItem(row);
                reviewItem.status = 'office_unresolved';
                reviewItem.notes =
                    'Carrier exists in regional carrier sheets, but office could not be resolved confidently.';
                emitReviewItem(options, statusCounts, reviewItem);
                continue;
            }
            const vendor = context.vendorByKey.get(row.vendorKey);
            for (const officeMatch of officeMatches) {
                const reviewItem = buildBaseReviewItem(row);
                rowsMatchedToOffice += 1;
                reviewItem.resolvedOfficeName = officeMatch.officeName;
                reviewItem.officeConfidence = officeMatch.confidence;
                reviewItem.officeMatchReasons = officeMatch.reasons;
                if (!vendor) {
                    reviewItem.status = 'vendor_not_in_db';
                    reviewItem.notes =
                        'Carrier matched in the workbook, but the vendor does not exist in Vendor Master yet.';
                    emitReviewItem(options, statusCounts, reviewItem);
                    continue;
                }
                reviewItem.vendorId = vendor.id;
                const dbOffice = resolveDbOffice(context.officesByVendorId.get(vendor.id) ?? [], officeMatch.officeName);
                if (!dbOffice) {
                    reviewItem.status = 'db_office_not_found';
                    reviewItem.notes =
                        'Resolved workbook office, but the corresponding Vendor Master office was not found.';
                    emitReviewItem(options, statusCounts, reviewItem);
                    continue;
                }
                reviewItem.dbOfficeId = dbOffice.id;
                reviewItem.dbOfficeName = dbOffice.officeName;
                const portResolution = resolvePortOverride(portOverridesByRowNumber.get(row.rowNumber), context) ?? resolvePort(row.portLabel, context);
                if (portResolution.kind === 'unresolved') {
                    reviewItem.status = 'port_unresolved';
                    reviewItem.notes =
                        'Port label was not resolved to one active seaport in Port Master.';
                    reviewItem.suggestions = portResolution.suggestions;
                    emitReviewItem(options, statusCounts, reviewItem);
                    continue;
                }
                if (portResolution.kind === 'ambiguous') {
                    reviewItem.status = 'port_ambiguous';
                    reviewItem.notes =
                        'Port label matched multiple active seaports in Port Master.';
                    reviewItem.suggestions = portResolution.candidates.map((candidate) => ({
                        code: candidate.code,
                        name: candidate.name,
                        cityName: candidate.cityName,
                        countryName: candidate.countryName,
                        score: 100,
                        rationale: 'Exact alias matched multiple active ports.',
                    }));
                    emitReviewItem(options, statusCounts, reviewItem);
                    continue;
                }
                rowsMatchedToPort += 1;
                reviewItem.portId = portResolution.port.id;
                reviewItem.portCode = portResolution.port.code;
                reviewItem.portName = portResolution.port.name;
                const officePortKey = `${dbOffice.id}::${portResolution.port.id}`;
                uniqueOfficePortPairKeys.add(officePortKey);
                rowsReadyToLink += 1;
                reviewItem.status = 'matched';
                if (context.existingOfficePortKeys.has(officePortKey)) {
                    linksAlreadyPresent += 1;
                    reviewItem.linkAction = 'existing';
                    reviewItem.notes = 'Office-port link already exists.';
                    emitReviewItem(options, statusCounts, reviewItem);
                    continue;
                }
                if (options.mode === 'apply') {
                    await manager.getRepository(vendor_office_port_entity_1.VendorOfficePort).save(manager.getRepository(vendor_office_port_entity_1.VendorOfficePort).create({
                        officeId: dbOffice.id,
                        portId: portResolution.port.id,
                        isPrimary: false,
                        notes: COVERAGE_SOURCE_NOTE,
                    }));
                    context.existingOfficePortKeys.add(officePortKey);
                    linksCreated += 1;
                    reviewItem.linkAction = 'created';
                    reviewItem.notes = 'Office-port link created from export service coverage.';
                }
                else {
                    reviewItem.linkAction = 'dry-run';
                    reviewItem.notes = 'Office-port link resolved and ready to create.';
                }
                emitReviewItem(options, statusCounts, reviewItem);
            }
        }
        return {
            rowsMatchedToOffice,
            rowsMatchedToPort,
            rowsReadyToLink,
            uniqueOfficePortPairsReady: uniqueOfficePortPairKeys.size,
            linksCreated,
            linksAlreadyPresent,
        };
    };
    const result = options.mode === 'apply'
        ? await dataSource.transaction((manager) => runner(manager))
        : await runner(dataSource.manager);
    return {
        mode: options.mode,
        workbookPath: options.workbookPath,
        exportRowsRead: exportRows.length,
        masterRowsRead: Array.from(masterRows.values()).reduce((sum, items) => sum + items.length, 0),
        uniqueVendorsInMaster: masterRows.size,
        rowsMatchedToOffice: result.rowsMatchedToOffice,
        rowsMatchedToPort: result.rowsMatchedToPort,
        rowsReadyToLink: result.rowsReadyToLink,
        uniqueOfficePortPairsReady: result.uniqueOfficePortPairsReady,
        linksCreated: result.linksCreated,
        linksAlreadyPresent: result.linksAlreadyPresent,
        statusCounts,
    };
}
function createStatusCounter() {
    return {
        matched: 0,
        vendor_not_in_master: 0,
        office_unresolved: 0,
        vendor_not_in_db: 0,
        db_office_not_found: 0,
        port_unresolved: 0,
        port_ambiguous: 0,
    };
}
function emitReviewItem(options, statusCounts, reviewItem) {
    statusCounts[reviewItem.status] += 1;
    options.onReviewItem?.(reviewItem);
}
function buildBaseReviewItem(row) {
    return {
        rowNumber: row.rowNumber,
        status: 'office_unresolved',
        carrierName: row.carrierName,
        contactName: row.contactName,
        portLabel: row.portLabel,
        normalizedPortLabel: normalizePortLookupKey(row.portLabel),
        resolvedOfficeName: null,
        officeConfidence: null,
        officeMatchReasons: [],
        vendorId: null,
        dbOfficeId: null,
        dbOfficeName: null,
        portId: null,
        portCode: null,
        portName: null,
        linkAction: 'none',
        notes: null,
        suggestions: [],
    };
}
async function buildCoverageContext(manager) {
    const [vendors, offices, officePorts, ports, portAliases] = await Promise.all([
        manager.getRepository(vendor_master_entity_1.VendorMaster).find(),
        manager.getRepository(vendor_office_entity_1.VendorOffice).find(),
        manager.getRepository(vendor_office_port_entity_1.VendorOfficePort).find(),
        manager.getRepository(port_master_entity_1.PortMaster).find({
            where: { isActive: true, portMode: port_master_entity_1.PortMode.SEAPORT },
        }),
        manager.getRepository(port_alias_entity_1.PortAlias).find({
            where: { portMode: port_master_entity_1.PortMode.SEAPORT },
        }),
    ]);
    const vendorByKey = new Map(vendors
        .filter((vendor) => Boolean(vendor.normalizedName))
        .map((vendor) => [vendor.normalizedName, vendor]));
    const officesByVendorId = new Map();
    for (const office of offices) {
        const existing = officesByVendorId.get(office.vendorId) ?? [];
        existing.push({
            id: office.id,
            vendorId: office.vendorId,
            officeName: office.officeName,
            cityName: office.cityName,
            countryName: office.countryName,
        });
        officesByVendorId.set(office.vendorId, existing);
    }
    const existingOfficePortKeys = new Set(officePorts.map((item) => `${item.officeId}::${item.portId}`));
    const portById = new Map(ports.map((port) => [port.id, port]));
    const portsByAlias = new Map();
    const portSearchEntries = new Map();
    for (const port of ports) {
        const candidate = toPortCandidate(port);
        const searchEntry = {
            ...candidate,
            aliases: new Set(),
        };
        portSearchEntries.set(port.id, searchEntry);
        addPortAlias(portsByAlias, searchEntry, port.normalizedName ?? port.name);
        addPortAlias(portsByAlias, searchEntry, port.normalizedCityName ?? port.cityName);
    }
    for (const alias of portAliases) {
        const port = portById.get(alias.portId);
        if (!port) {
            continue;
        }
        const searchEntry = portSearchEntries.get(port.id);
        if (!searchEntry) {
            continue;
        }
        addPortAlias(portsByAlias, searchEntry, alias.normalizedAlias ?? alias.alias);
    }
    return {
        vendorByKey,
        officesByVendorId,
        existingOfficePortKeys,
        portsByCode: new Map(ports.map((port) => [port.code.trim().toUpperCase(), toPortCandidate(port)])),
        portsByAlias,
        portSearchEntries: Array.from(portSearchEntries.values()),
    };
}
function addPortAlias(portsByAlias, searchEntry, rawAlias) {
    const normalizedAlias = normalizePortLookupKey(rawAlias);
    if (!normalizedAlias) {
        return;
    }
    searchEntry.aliases.add(normalizedAlias);
    const existing = portsByAlias.get(normalizedAlias) ?? [];
    if (!existing.some((port) => port.id === searchEntry.id)) {
        existing.push({
            id: searchEntry.id,
            code: searchEntry.code,
            name: searchEntry.name,
            cityName: searchEntry.cityName,
            countryName: searchEntry.countryName,
            portMode: searchEntry.portMode,
        });
    }
    portsByAlias.set(normalizedAlias, existing);
}
function toPortCandidate(port) {
    return {
        id: port.id,
        code: port.code,
        name: port.name,
        cityName: port.cityName,
        countryName: port.countryName,
        portMode: port.portMode,
    };
}
function parseMasterOfficeIdentities(workbook) {
    const identities = new Map();
    for (const [sheetName, officeName] of [
        [MUMBAI_CARRIER_SHEET, 'Mumbai'],
        [CHENNAI_CARRIER_SHEET, 'Chennai'],
    ]) {
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) {
            continue;
        }
        const rows = XLSX.utils.sheet_to_json(sheet, {
            defval: null,
            raw: false,
        });
        for (const [index, row] of rows.entries()) {
            const vendorName = (0, vendor_normalization_1.normalizeVendorCompanyName)(row['Carrier']);
            const vendorKey = (0, vendor_normalization_1.normalizeVendorNameKey)(vendorName);
            if (!vendorName || !vendorKey) {
                continue;
            }
            const contactName = normalizeMasterContactName(sheetName, row);
            const identity = {
                officeName,
                vendorKey,
                contactName,
                contactKey: normalizeContactKey(contactName),
                emails: collectRowEmails(row),
                phones: collectPhonesFromValue(row['Mobile']),
            };
            const existing = identities.get(vendorKey) ?? [];
            existing.push(identity);
            identities.set(vendorKey, existing);
        }
    }
    return identities;
}
function parseExportCoverageRows(workbook) {
    const sheet = workbook.Sheets[EXPORT_SERVICE_SHEET];
    if (!sheet) {
        throw new Error(`Workbook is missing the required "${EXPORT_SERVICE_SHEET}" sheet.`);
    }
    const rows = XLSX.utils.sheet_to_json(sheet, {
        defval: null,
        raw: false,
    });
    return rows.flatMap((row, index) => {
        const carrierName = (0, vendor_normalization_1.normalizeVendorCompanyName)(row['Carrier']);
        const vendorKey = (0, vendor_normalization_1.normalizeVendorNameKey)(carrierName);
        const portLabel = normalizeExportPortLabel(row['Port']);
        if (!carrierName || !vendorKey || !portLabel) {
            return [];
        }
        const contactName = (0, vendor_normalization_1.normalizeVendorContactName)(row['Name']);
        return [
            {
                rowNumber: index + 2,
                portLabel,
                carrierName,
                vendorKey,
                contactName,
                contactKey: normalizeContactKey(contactName),
                emails: collectRowEmails(row),
                phones: collectPhonesFromValue(row['Mobile']),
            },
        ];
    });
}
function resolveOfficeMatches(exportRow, candidates) {
    const officeEvidence = new Map();
    for (const candidate of candidates) {
        const evidence = scoreOfficeIdentityMatch(exportRow, candidate);
        if (evidence.score <= 0) {
            continue;
        }
        const existing = officeEvidence.get(candidate.officeName);
        if (!existing || evidence.score > existing.score) {
            officeEvidence.set(candidate.officeName, evidence);
        }
    }
    if (officeEvidence.size === 0) {
        return [];
    }
    const ranked = Array.from(officeEvidence.entries())
        .map(([officeName, evidence]) => ({ officeName, ...evidence }))
        .sort((left, right) => right.score - left.score);
    const top = ranked[0];
    const topScore = top?.score ?? 0;
    if (!top || topScore < 55) {
        return [];
    }
    return ranked
        .filter((candidate) => candidate.score === topScore)
        .map((candidate) => ({
        officeName: candidate.officeName,
        confidence: topScore >= 80 ? 'high' : 'medium',
        reasons: candidate.reasons,
    }));
}
function resolvePortOverride(override, context) {
    const overrideCode = override?.portCode?.trim().toUpperCase();
    if (!overrideCode) {
        return null;
    }
    const port = context.portsByCode.get(overrideCode);
    return port ? { kind: 'matched', port } : null;
}
function scoreOfficeIdentityMatch(exportRow, candidate) {
    let score = 0;
    const reasons = [];
    const sharedEmails = intersect(exportRow.emails, candidate.emails);
    if (sharedEmails.length > 0) {
        score += 100;
        reasons.push(`email match (${sharedEmails[0]})`);
    }
    const sharedPhones = intersect(exportRow.phones, candidate.phones);
    if (sharedPhones.length > 0) {
        score += 80;
        reasons.push(`phone match (${sharedPhones[0]})`);
    }
    if (exportRow.contactKey && candidate.contactKey) {
        if (exportRow.contactKey === candidate.contactKey) {
            score += 60;
            reasons.push(`contact name match (${candidate.contactName})`);
        }
        else if (shareNameTokens(exportRow.contactKey, candidate.contactKey)) {
            score += 25;
            reasons.push(`partial contact name overlap (${candidate.contactName})`);
        }
    }
    return { score, reasons };
}
function resolveDbOffice(offices, officeName) {
    const officeKey = (0, normalization_1.normalizeTextKey)(officeName);
    const matches = offices.filter((office) => {
        if ((0, normalization_1.normalizeTextKey)(office.countryName) !== (0, normalization_1.normalizeTextKey)('India')) {
            return false;
        }
        return ((0, normalization_1.normalizeTextKey)(office.officeName) === officeKey ||
            (0, normalization_1.normalizeTextKey)(office.cityName) === officeKey);
    });
    return matches.length === 1 ? matches[0] : null;
}
function resolvePort(portLabel, context) {
    const lookupKeys = buildPortLookupKeys(portLabel);
    const matches = new Map();
    for (const lookupKey of lookupKeys) {
        for (const match of context.portsByAlias.get(lookupKey) ?? []) {
            matches.set(match.id, match);
        }
    }
    const uniqueMatches = Array.from(matches.values()).sort((left, right) => left.name.localeCompare(right.name));
    if (uniqueMatches.length === 1) {
        return { kind: 'matched', port: uniqueMatches[0] };
    }
    if (uniqueMatches.length > 1) {
        return { kind: 'ambiguous', candidates: uniqueMatches };
    }
    return {
        kind: 'unresolved',
        suggestions: suggestPorts(portLabel, context.portSearchEntries),
    };
}
function suggestPorts(portLabel, searchEntries) {
    const lookupKeys = buildPortLookupKeys(portLabel);
    const suggestions = new Map();
    for (const entry of searchEntries) {
        for (const alias of entry.aliases) {
            const score = scorePortAliasCandidate(lookupKeys, alias);
            if (score <= 0) {
                continue;
            }
            const existing = suggestions.get(entry.id);
            if (existing && existing.score >= score) {
                continue;
            }
            suggestions.set(entry.id, {
                code: entry.code,
                name: entry.name,
                cityName: entry.cityName,
                countryName: entry.countryName,
                score,
                rationale: score >= 85
                    ? `Alias "${alias}" is a strong text match.`
                    : `Alias "${alias}" is a partial text match.`,
            });
        }
    }
    return Array.from(suggestions.values())
        .sort((left, right) => right.score - left.score ||
        left.name.localeCompare(right.name))
        .slice(0, 5);
}
function scorePortAliasCandidate(lookupKeys, alias) {
    let score = 0;
    for (const key of lookupKeys) {
        if (!key) {
            continue;
        }
        if (alias === key) {
            score = Math.max(score, 100);
            continue;
        }
        if (alias.includes(key) || key.includes(alias)) {
            score = Math.max(score, 84);
            continue;
        }
        const distance = computeLevenshteinDistance(alias, key);
        if (distance <= 2 && Math.max(alias.length, key.length) >= 5) {
            score = Math.max(score, 72 - distance * 8);
        }
    }
    return score;
}
function buildPortLookupKeys(portLabel) {
    const cleaned = normalizeExportPortLabel(portLabel);
    const normalized = normalizePortLookupKey(cleaned);
    if (!cleaned || !normalized) {
        return [];
    }
    const keys = new Set([normalized]);
    const withoutPortWord = normalizePortLookupKey(cleaned.replace(/^port\s+/i, ' '));
    if (withoutPortWord) {
        keys.add(withoutPortWord);
    }
    for (const token of cleaned.split(/[\/,()-]/)) {
        const normalizedToken = normalizePortLookupKey(token);
        if (normalizedToken && normalizedToken.length >= 4) {
            keys.add(normalizedToken);
        }
    }
    return Array.from(keys);
}
function normalizeExportPortLabel(value) {
    const cleaned = (0, normalization_1.optionalText)(value);
    if (!cleaned) {
        return null;
    }
    const fixed = PORT_LABEL_FIXES[normalizeSheetKey(cleaned)] ?? cleaned;
    return (0, normalization_1.toSmartTitleCase)(fixed, undefined, {
        preserveGenericAcronyms: false,
    });
}
function normalizePortLookupKey(value) {
    const cleaned = normalizeExportPortLabel(value);
    return cleaned ? (0, normalization_1.normalizeTextKey)(cleaned) : null;
}
function normalizeMasterContactName(sheetName, row) {
    const baseName = normalizeSheetKey(sheetName) === normalizeSheetKey(CHENNAI_CARRIER_SHEET)
        ? [row['Name'], row['Last name']]
            .map((value) => (0, normalization_1.optionalText)(value))
            .filter((value) => Boolean(value))
            .join(' ')
        : (0, normalization_1.optionalText)(row['Name']);
    return (0, vendor_normalization_1.normalizeVendorContactName)(baseName);
}
function collectRowEmails(row) {
    return dedupe(['TO email ID', 'CC email ID', 'Additional IDs']
        .flatMap((key) => (0, normalization_1.extractEmails)(row[key]))
        .map((email) => (0, normalization_1.normalizeEmail)(email))
        .filter((email) => Boolean(email)));
}
function collectPhonesFromValue(value) {
    return dedupe((0, normalization_1.extractPhoneNumbers)(value)
        .map((phone) => (0, normalization_1.normalizePhone)(phone))
        .filter((phone) => Boolean(phone)));
}
function normalizeContactKey(value) {
    return (0, normalization_1.normalizeTextKey)(value);
}
function shareNameTokens(left, right) {
    const leftTokens = new Set(left.split(' ').filter(Boolean));
    const rightTokens = right.split(' ').filter(Boolean);
    const sharedTokenCount = rightTokens.filter((token) => leftTokens.has(token)).length;
    return sharedTokenCount >= 2;
}
function intersect(left, right) {
    const rightSet = new Set(right);
    return left.filter((value) => rightSet.has(value));
}
function dedupe(values) {
    return Array.from(new Set(values));
}
function normalizeSheetKey(value) {
    return (0, normalization_1.normalizeTextKey)((0, normalization_1.optionalText)(value)?.toUpperCase() ?? null);
}
function computeLevenshteinDistance(left, right) {
    if (left === right) {
        return 0;
    }
    if (!left) {
        return right.length;
    }
    if (!right) {
        return left.length;
    }
    const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
    const current = new Array(right.length + 1).fill(0);
    for (let i = 0; i < left.length; i += 1) {
        current[0] = i + 1;
        for (let j = 0; j < right.length; j += 1) {
            const cost = left[i] === right[j] ? 0 : 1;
            current[j + 1] = Math.min(current[j] + 1, previous[j + 1] + 1, previous[j] + cost);
        }
        for (let j = 0; j < current.length; j += 1) {
            previous[j] = current[j];
        }
    }
    return previous[right.length];
}
//# sourceMappingURL=carrier-export-coverage-importer.js.map