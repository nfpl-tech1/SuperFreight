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
async function main() {
    const args = process.argv.slice(2);
    const inputPath = getArgValue(args, '--input') ?? '.\\tmp\\carrier-export-coverage.refresh.json';
    const outputJsonPath = getArgValue(args, '--output-json') ?? '.\\reports\\port_unresolved.unresolved.json';
    const outputCsvPath = getArgValue(args, '--output-csv') ?? '.\\reports\\port_unresolved.unresolved.csv';
    const raw = await (0, promises_1.readFile)(inputPath, 'utf8');
    const parsed = JSON.parse(raw);
    const items = (parsed.reviewItems ?? [])
        .filter((item) => item.status === 'port_unresolved')
        .map((item) => ({
        ...item,
        currentStatus: item.status,
        currentNotes: item.notes,
        currentPortId: item.portId,
        currentPortCode: item.portCode,
        currentPortName: item.portName,
        currentSuggestions: item.suggestions,
        currentLinkAction: item.linkAction,
    }));
    const output = {
        generatedAt: new Date().toISOString(),
        sourceFile: path.resolve(inputPath),
        splitRule: 'Current unresolved queue exported directly from the latest carrier export coverage dry-run.',
        count: items.length,
        items,
    };
    const resolvedJsonPath = path.resolve(outputJsonPath);
    const resolvedCsvPath = path.resolve(outputCsvPath);
    await (0, promises_1.mkdir)(path.dirname(resolvedJsonPath), { recursive: true });
    await (0, promises_1.writeFile)(resolvedJsonPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
    const csvHeader = [
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
        'currentStatus',
        'currentNotes',
        'currentPortId',
        'currentPortCode',
        'currentPortName',
        'currentSuggestions',
        'currentLinkAction',
    ];
    const csvRows = items.map((item) => [
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
        item.currentStatus,
        item.currentNotes,
        item.currentPortId,
        item.currentPortCode,
        item.currentPortName,
        JSON.stringify(item.currentSuggestions),
        item.currentLinkAction,
    ]
        .map((value) => escapeCsvValue(value))
        .join(','));
    await (0, promises_1.writeFile)(resolvedCsvPath, `${csvHeader.join(',')}\n${csvRows.join('\n')}\n`, 'utf8');
    console.log(JSON.stringify({
        inputPath: path.resolve(inputPath),
        outputJsonPath: resolvedJsonPath,
        outputCsvPath: resolvedCsvPath,
        count: items.length,
    }, null, 2));
}
main().catch((error) => {
    console.error('Failed to export current unresolved port queue.');
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=export-port-unresolved-from-review.js.map