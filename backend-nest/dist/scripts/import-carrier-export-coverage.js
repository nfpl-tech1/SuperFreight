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
const promises_1 = require("node:fs/promises");
const path = __importStar(require("node:path"));
const typeorm_options_1 = require("../src/database/typeorm-options");
const carrier_export_coverage_importer_1 = require("../src/modules/vendors/carrier-export-coverage-importer");
const DEFAULT_OG_DB_ROOT = '..\\OG DB';
const DEFAULT_WORKBOOK_PATH = `${DEFAULT_OG_DB_ROOT}\\Carrier Master.xlsx`;
const DEFAULT_SUMMARY_JSON_PATH = '.\\reports\\carrier-export-coverage.summary.json';
const DEFAULT_REVIEW_CSV_PATH = '.\\reports\\carrier-export-coverage.review.csv';
const DEFAULT_PORT_OVERRIDE_JSON_PATH = '.\\reports\\port_overrides.reviewed.json';
function getArgValue(args, flag) {
    const index = args.indexOf(flag);
    return index >= 0 ? (args[index + 1] ?? null) : null;
}
function escapeCsvValue(value) {
    if (value === null || value === undefined) {
        return '';
    }
    const normalized = String(value).replace(/\r?\n/g, ' ').trim();
    if (/[",]/.test(normalized)) {
        return `"${normalized.replace(/"/g, '""')}"`;
    }
    return normalized;
}
function buildReviewCsv(reviewItems) {
    const header = [
        'rowNumber',
        'status',
        'carrierName',
        'contactName',
        'portLabel',
        'normalizedPortLabel',
        'resolvedOfficeName',
        'officeConfidence',
        'officeMatchReasons',
        'vendorId',
        'dbOfficeId',
        'dbOfficeName',
        'portId',
        'portCode',
        'portName',
        'linkAction',
        'notes',
        'suggestions',
    ];
    const rows = reviewItems.map((item) => [
        item.rowNumber,
        item.status,
        item.carrierName,
        item.contactName,
        item.portLabel,
        item.normalizedPortLabel,
        item.resolvedOfficeName,
        item.officeConfidence,
        item.officeMatchReasons.join(' | '),
        item.vendorId,
        item.dbOfficeId,
        item.dbOfficeName,
        item.portId,
        item.portCode,
        item.portName,
        item.linkAction,
        item.notes,
        item.suggestions
            .map((suggestion) => `${suggestion.code}:${suggestion.name} (${suggestion.countryName})`)
            .join(' | '),
    ]
        .map((value) => escapeCsvValue(value))
        .join(','));
    return `${header.join(',')}\n${rows.join('\n')}\n`;
}
async function main() {
    const args = process.argv.slice(2);
    const mode = args.includes('--apply') || args.includes('apply') ? 'apply' : 'dry-run';
    const workbookPath = getArgValue(args, '--workbook') ?? DEFAULT_WORKBOOK_PATH;
    const summaryOutPath = getArgValue(args, '--summary-out') ?? DEFAULT_SUMMARY_JSON_PATH;
    const reviewCsvOutPath = getArgValue(args, '--review-csv-out') ?? DEFAULT_REVIEW_CSV_PATH;
    const reviewJsonOutPath = getArgValue(args, '--review-out');
    const portOverrideJsonPath = getArgValue(args, '--port-override-review') ?? DEFAULT_PORT_OVERRIDE_JSON_PATH;
    const reviewItems = [];
    const portOverrides = await loadPortOverrides(portOverrideJsonPath);
    const dataSource = (0, typeorm_options_1.createBusinessDataSource)();
    await dataSource.initialize();
    try {
        const summary = await (0, carrier_export_coverage_importer_1.runCarrierExportCoverageImport)(dataSource, {
            mode,
            workbookPath,
            portOverrides,
            onReviewItem: (item) => {
                reviewItems.push(item);
            },
        });
        const resolvedSummaryPath = path.resolve(summaryOutPath);
        const resolvedReviewCsvPath = path.resolve(reviewCsvOutPath);
        await (0, promises_1.mkdir)(path.dirname(resolvedSummaryPath), { recursive: true });
        await (0, promises_1.writeFile)(resolvedSummaryPath, `${JSON.stringify({
            generatedAt: new Date().toISOString(),
            ...summary,
        }, null, 2)}\n`, 'utf8');
        await (0, promises_1.writeFile)(resolvedReviewCsvPath, buildReviewCsv(reviewItems), 'utf8');
        let resolvedReviewJsonPath = null;
        if (reviewJsonOutPath) {
            resolvedReviewJsonPath = path.resolve(reviewJsonOutPath);
            await (0, promises_1.mkdir)(path.dirname(resolvedReviewJsonPath), { recursive: true });
            await (0, promises_1.writeFile)(resolvedReviewJsonPath, `${JSON.stringify({
                generatedAt: new Date().toISOString(),
                reviewCount: reviewItems.length,
                reviewItems,
            }, null, 2)}\n`, 'utf8');
        }
        console.log(JSON.stringify({
            ...summary,
            summaryFilePath: resolvedSummaryPath,
            reviewCsvFilePath: resolvedReviewCsvPath,
            reviewJsonFilePath: resolvedReviewJsonPath,
            portOverrideFilePath: portOverrides.length > 0 ? path.resolve(portOverrideJsonPath) : null,
        }, null, 2));
    }
    finally {
        await dataSource.destroy();
    }
}
async function loadPortOverrides(portOverrideJsonPath) {
    try {
        await (0, promises_1.access)(portOverrideJsonPath);
    }
    catch {
        return [];
    }
    const raw = await (0, promises_1.readFile)(portOverrideJsonPath, 'utf8');
    const parsed = JSON.parse(raw);
    return (parsed.items ?? [])
        .map((item) => ({
        rowNumber: Number(item.rowNumber),
        normalizedPortLabel: item.normalizedPortLabel ?? null,
        portCode: item.portCode ?? null,
        notes: item.notes ?? item.resolutionMethod ?? null,
        source: item.source ?? path.resolve(portOverrideJsonPath),
    }))
        .filter((item) => Number.isInteger(item.rowNumber) &&
        item.rowNumber > 0 &&
        Boolean(item.portCode));
}
main().catch((error) => {
    console.error('Carrier export coverage import failed.');
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=import-carrier-export-coverage.js.map