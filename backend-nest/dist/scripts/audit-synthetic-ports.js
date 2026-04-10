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
const vendor_location_importer_1 = require("../src/modules/vendors/vendor-location-importer");
const DEFAULT_OUTPUT_JSON_PATH = '.\\reports\\synthetic-ports.audit.json';
const DEFAULT_OUTPUT_CSV_PATH = '.\\reports\\synthetic-ports.audit.csv';
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
    const outputJsonPath = getArgValue(args, '--output-json') ?? DEFAULT_OUTPUT_JSON_PATH;
    const outputCsvPath = getArgValue(args, '--output-csv') ?? DEFAULT_OUTPUT_CSV_PATH;
    const dataSource = (0, typeorm_options_1.createBusinessDataSource)();
    await dataSource.initialize();
    try {
        const audit = await (0, vendor_location_importer_1.auditSyntheticPortReconciliation)(dataSource.manager);
        const output = {
            generatedAt: new Date().toISOString(),
            ...audit,
        };
        const resolvedOutputJsonPath = path.resolve(outputJsonPath);
        const resolvedOutputCsvPath = path.resolve(outputCsvPath);
        await (0, promises_1.mkdir)(path.dirname(resolvedOutputJsonPath), { recursive: true });
        await (0, promises_1.writeFile)(resolvedOutputJsonPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
        const csvHeader = [
            'syntheticCode',
            'syntheticName',
            'countryName',
            'portMode',
            'sourceConfidence',
            'linkedOfficeCount',
            'canonicalCode',
            'canonicalName',
            'canonicalSourceConfidence',
        ];
        const csvRows = output.items.map((item) => [
            item.syntheticCode,
            item.syntheticName,
            item.countryName,
            item.portMode,
            item.sourceConfidence,
            item.linkedOfficeCount,
            item.canonicalCode,
            item.canonicalName,
            item.canonicalSourceConfidence,
        ]
            .map((value) => escapeCsvValue(value))
            .join(','));
        await (0, promises_1.writeFile)(resolvedOutputCsvPath, `${csvHeader.join(',')}\n${csvRows.join('\n')}\n`, 'utf8');
        console.log(JSON.stringify({
            outputJsonPath: resolvedOutputJsonPath,
            outputCsvPath: resolvedOutputCsvPath,
            totalSyntheticPorts: output.totalSyntheticPorts,
            mergeableSyntheticPorts: output.mergeableSyntheticPorts,
            linkedSyntheticPorts: output.linkedSyntheticPorts,
            topMergeable: output.items
                .filter((item) => item.canonicalCode)
                .slice(0, 10)
                .map((item) => ({
                syntheticCode: item.syntheticCode,
                linkedOfficeCount: item.linkedOfficeCount,
                canonicalCode: item.canonicalCode,
            })),
        }, null, 2));
    }
    finally {
        await dataSource.destroy();
    }
}
main().catch((error) => {
    console.error('Synthetic port audit failed.');
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=audit-synthetic-ports.js.map