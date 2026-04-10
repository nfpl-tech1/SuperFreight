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
const DEFAULT_INPUT_PATH = '.\\reports\\port_unresolved.unresolved.json';
const DEFAULT_OUTPUT_PATH = '.\\reports\\port_unresolved.grouped.json';
function getArgValue(args, flag) {
    const index = args.indexOf(flag);
    return index >= 0 ? (args[index + 1] ?? null) : null;
}
function sortText(values) {
    return Array.from(new Set(values)).sort((left, right) => left.localeCompare(right));
}
async function main() {
    const args = process.argv.slice(2);
    const inputPath = getArgValue(args, '--input') ?? DEFAULT_INPUT_PATH;
    const outputPath = getArgValue(args, '--output') ?? DEFAULT_OUTPUT_PATH;
    const limit = Number(getArgValue(args, '--limit') ?? '0');
    const raw = await (0, promises_1.readFile)(inputPath, 'utf8');
    const parsed = JSON.parse(raw);
    const groups = new Map();
    for (const item of parsed.items ?? []) {
        const normalizedPortLabel = item.normalizedPortLabel?.trim() || item.portLabel?.trim() || 'UNKNOWN';
        const existing = groups.get(normalizedPortLabel);
        if (existing) {
            existing.count += 1;
            if (item.carrierName) {
                existing.carriers.push(item.carrierName);
            }
            if (item.dbOfficeName) {
                existing.offices.push(item.dbOfficeName);
            }
            if (existing.sampleRows.length < 5) {
                existing.sampleRows.push({
                    rowNumber: item.rowNumber,
                    carrierName: item.carrierName,
                    portLabel: item.portLabel,
                    dbOfficeName: item.dbOfficeName,
                    currentSuggestions: item.currentSuggestions ?? [],
                });
            }
            for (const suggestion of item.currentSuggestions ?? []) {
                existing.suggestionCodes.push(suggestion.code);
            }
            continue;
        }
        groups.set(normalizedPortLabel, {
            normalizedPortLabel,
            displayPortLabel: item.portLabel?.trim() || normalizedPortLabel,
            count: 1,
            carriers: item.carrierName ? [item.carrierName] : [],
            offices: item.dbOfficeName ? [item.dbOfficeName] : [],
            sampleRows: [
                {
                    rowNumber: item.rowNumber,
                    carrierName: item.carrierName,
                    portLabel: item.portLabel,
                    dbOfficeName: item.dbOfficeName,
                    currentSuggestions: item.currentSuggestions ?? [],
                },
            ],
            suggestionCodes: (item.currentSuggestions ?? []).map((suggestion) => suggestion.code),
        });
    }
    const grouped = Array.from(groups.values())
        .map((group) => ({
        ...group,
        carriers: sortText(group.carriers),
        offices: sortText(group.offices),
        suggestionCodes: sortText(group.suggestionCodes),
    }))
        .sort((left, right) => right.count - left.count ||
        left.normalizedPortLabel.localeCompare(right.normalizedPortLabel));
    const limitedGroups = limit > 0 ? grouped.slice(0, limit) : grouped;
    const output = {
        generatedAt: new Date().toISOString(),
        sourceFile: path.resolve(inputPath),
        groupCount: limitedGroups.length,
        itemCount: parsed.count,
        groups: limitedGroups,
    };
    const resolvedOutputPath = path.resolve(outputPath);
    await (0, promises_1.mkdir)(path.dirname(resolvedOutputPath), { recursive: true });
    await (0, promises_1.writeFile)(resolvedOutputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify({
        inputPath: path.resolve(inputPath),
        outputPath: resolvedOutputPath,
        groupCount: output.groupCount,
        itemCount: output.itemCount,
        topGroups: limitedGroups.slice(0, 10).map((group) => ({
            normalizedPortLabel: group.normalizedPortLabel,
            count: group.count,
            suggestionCodes: group.suggestionCodes,
        })),
    }, null, 2));
}
main().catch((error) => {
    console.error('Failed to build grouped unresolved port review.');
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=review-port-unresolved.js.map