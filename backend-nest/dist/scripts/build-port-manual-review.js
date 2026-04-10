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
const DEFAULT_OUTPUT_JSON_PATH = '.\\reports\\port_unresolved.manual-review.json';
const DEFAULT_OUTPUT_CSV_PATH = '.\\reports\\port_unresolved.manual-review.csv';
const DEFAULT_LABEL_REASONS = [
    {
        label: 'RIYADH',
        reason: 'Official UN/LOCODE lists Riyadh as an airport location (SA RUH) and separately as Riyadh Dry Port (SA RYP), not as a seaport. Keep this out of automatic seaport mapping unless the business explicitly wants dry-port handling.',
        sourcesChecked: ['https://service.unece.org/trade/locode/sa.htm'],
    },
    {
        label: 'ICD DHAKA',
        reason: 'Official UN/LOCODE references point to Kamalapur/Dhaka rather than a seaport, and this label reads like an inland container depot workflow. Avoid forcing a seaport mapping from an ICD-style label.',
        sourcesChecked: [
            'https://service.unece.org/trade/locode/bd.htm',
            'https://service.unece.org/trade/uncefact/vocabulary/unlocode-bd/',
        ],
    },
    {
        label: 'ICD DHAKA KAMALAPUR',
        reason: 'Official UN/LOCODE identifies Kamalapur/Dhaka, which supports inland-terminal handling rather than a seaport mapping. Keep unresolved on the seaport queue until ICD/service-location logic is handled separately.',
        sourcesChecked: [
            'https://service.unece.org/trade/locode/bd.htm',
            'https://service.unece.org/trade/uncefact/vocabulary/unlocode-bd/',
        ],
    },
    {
        label: 'JOHANNESBURG',
        reason: 'Official UN/LOCODE lists Johannesburg as a non-seaport inland/airport-style location, which matches the existing repo direction of treating Johannesburg as a service location rather than a seaport. Do not force a seaport code here.',
        sourcesChecked: ['https://service.unece.org/trade/locode/za.htm'],
    },
    {
        label: 'DHAKA',
        reason: 'Official UN/LOCODE lists Dhaka as an inland city/airport-style location, not as a seaport. Keep this out of automatic seaport mapping unless there is an explicit operational rule to map Dhaka traffic via a specific gateway port.',
        sourcesChecked: ['https://service.unece.org/trade/locode/bd.htm'],
    },
    {
        label: 'YUNFU',
        reason: 'Official UN/LOCODE lists Yunfu as an inland road-terminal style location, not a seaport. Keep unresolved on the seaport backlog and handle it under inland/service-location rules instead.',
        sourcesChecked: ['https://service.unece.org/trade/locode/cn.htm'],
    },
    {
        label: 'LILONGWE',
        reason: 'Official UN/LOCODE lists Lilongwe as an inland city/airport-style location, not a seaport. Avoid forcing a seaport mapping without an explicit gateway-port rule.',
        sourcesChecked: ['https://service.unece.org/trade/locode/mw.htm'],
    },
    {
        label: 'NANCHANG',
        reason: 'Official UN/LOCODE lists Nanchang as an inland city/airport-style location, not a seaport. Keep it out of automatic seaport mapping.',
        sourcesChecked: ['https://service.unece.org/trade/locode/cn.htm'],
    },
    {
        label: 'BLANTYRE',
        reason: 'Official UN/LOCODE lists Blantyre as an airport-style inland location, not a seaport. Avoid forcing a seaport mapping for this workbook label.',
        sourcesChecked: ['https://service.unece.org/trade/locode/mw.htm'],
    },
    {
        label: 'CHRISTCHURCH',
        reason: 'Official UN/LOCODE lists Christchurch with road and airport functions, but not port function 1. Keep this out of automatic seaport mapping.',
        sourcesChecked: [
            'https://service.unece.org/trade/locode/nz.htm',
            'https://service.unece.org/trade/locode/Service/LocodeColumn.htm',
        ],
    },
    {
        label: 'AFGHANISTAN',
        reason: 'This workbook value is a country name, not a transport location. Official UN/LOCODE entries for Afghanistan are location-specific, so the country-only label is too broad to auto-map to a seaport.',
        sourcesChecked: ['https://service.unece.org/trade/locode/af.htm'],
    },
    {
        label: 'ARMENIA',
        reason: 'This workbook value is a country name, not a transport location. Official UN/LOCODE entries for Armenia are location-specific, so the country-only label should stay out of automatic seaport mapping.',
        sourcesChecked: ['https://service.unece.org/trade/locode/am.htm'],
    },
    {
        label: 'AZERBAIJAN',
        reason: 'This workbook value is a country name, not a transport location. Official UN/LOCODE entries for Azerbaijan include multiple named locations such as Alat and Baku, so the country-only label is too ambiguous to auto-map.',
        sourcesChecked: ['https://service.unece.org/trade/locode/az.htm'],
    },
    {
        label: 'INDONESIA',
        reason: 'This workbook value is a country name, not a transport location. Official UN/LOCODE entries for Indonesia include many separate locations, so the country-only label is too broad to auto-map to one seaport.',
        sourcesChecked: ['https://service.unece.org/trade/locode/id.htm'],
    },
    {
        label: 'NIGERIA',
        reason: 'This workbook value is a country name, not a transport location. Official UN/LOCODE entries for Nigeria include multiple distinct locations such as Lagos, so the country-only label is too broad to auto-map to one seaport.',
        sourcesChecked: ['https://service.unece.org/trade/locode/ng.htm'],
    },
    {
        label: 'FUJIAN',
        reason: 'Official UN/LOCODE lists multiple Fujian province locations, including separate Fuzhou and Xiamen entries with port function 1. Province-only label does not identify a single canonical seaport, so keep it out of automatic mapping.',
        sourcesChecked: [
            'https://service.unece.org/trade/locode/cn.htm',
            'https://service.unece.org/trade/locode/Service/LocodeColumn.htm',
        ],
    },
    {
        label: 'GUANGDONG',
        reason: 'Official UN/LOCODE lists multiple Guangdong province locations with port function 1, so the province-only label does not identify one canonical seaport. Keep it out of automatic mapping.',
        sourcesChecked: [
            'https://service.unece.org/trade/locode/cn.htm',
            'https://service.unece.org/trade/locode/Service/LocodeColumn.htm',
        ],
    },
    {
        label: 'JIANGSU',
        reason: 'Official UN/LOCODE lists multiple Jiangsu province locations, including separate Lianyungang, Nantong, Zhenjiang, and Zhangjiagang entries. Province-only label is too ambiguous to auto-map.',
        sourcesChecked: ['https://service.unece.org/trade/locode/cn.htm'],
    },
    {
        label: 'CIKARANG',
        reason: 'Official UN/LOCODE lists Cikarang as a road-terminal style location, not a seaport. Keep this out of automatic seaport mapping.',
        sourcesChecked: [
            'https://service.unece.org/trade/locode/id.htm',
            'https://service.unece.org/trade/locode/Service/LocodeColumn.htm',
        ],
    },
    {
        label: 'JAPAN',
        reason: 'This workbook value is a country name, not a transport location. Official UN/LOCODE entries for Japan are location-specific, so the country-only label is too broad to auto-map to one seaport.',
        sourcesChecked: ['https://service.unece.org/trade/locode/jp.htm'],
    },
    {
        label: 'KAZAKHSTAN',
        reason: 'This workbook value is a country name, not a transport location. Official UN/LOCODE entries for Kazakhstan are location-specific, so the country-only label is too broad to auto-map to one seaport.',
        sourcesChecked: ['https://service.unece.org/trade/locode/kz.htm'],
    },
    {
        label: 'KYRGYZSTAN',
        reason: 'This workbook value is a country name, not a transport location. Official UN/LOCODE entries for Kyrgyzstan are location-specific, so the country-only label should stay out of automatic seaport mapping.',
        sourcesChecked: ['https://service.unece.org/trade/locode/kg.htm'],
    },
    {
        label: 'LAOS',
        reason: 'This workbook value is a country name, not a transport location. Official UN/LOCODE entries for Laos are location-specific, so the country-only label is too broad to auto-map to one seaport.',
        sourcesChecked: ['https://service.unece.org/trade/locode/la.htm'],
    },
    {
        label: 'MOLDOVA',
        reason: 'This workbook value is a country name, not a transport location. Official UN/LOCODE entries for Moldova are location-specific, so the country-only label should stay out of automatic seaport mapping.',
        sourcesChecked: ['https://service.unece.org/trade/locode/md.htm'],
    },
    {
        label: 'TAJIKISTAN',
        reason: 'This workbook value is a country name, not a transport location. Official UN/LOCODE entries for Tajikistan are location-specific, so the country-only label is too broad to auto-map to one seaport.',
        sourcesChecked: ['https://service.unece.org/trade/locode/tj.htm'],
    },
    {
        label: 'TURKMENISTAN',
        reason: 'This workbook value is a country name, not a transport location. Official UN/LOCODE entries for Turkmenistan include multiple named locations, so the country-only label is too broad to auto-map to one seaport.',
        sourcesChecked: ['https://service.unece.org/trade/locode/tm.htm'],
    },
    {
        label: 'UZBEKISTAN',
        reason: 'This workbook value is a country name, not a transport location. Official UN/LOCODE entries for Uzbekistan are location-specific, so the country-only label should stay out of automatic seaport mapping.',
        sourcesChecked: ['https://service.unece.org/trade/locode/uz.htm'],
    },
    {
        label: 'MEXICO CITY',
        reason: 'Official UN/LOCODE lists Ciudad de Mexico with rail, road, airport, postal, and multimodal functions, but not port function 1. Keep this out of automatic seaport mapping.',
        sourcesChecked: [
            'https://service.unece.org/trade/locode/mx.htm',
            'https://service.unece.org/trade/locode/Service/LocodeColumn.htm',
        ],
    },
    {
        label: 'MEXICO CITY PANTACO',
        reason: 'Official UN/LOCODE distinguishes Ciudad de Mexico and Pantaco as separate inland entries rather than a single seaport name. The composite label does not identify one canonical seaport, so keep it out of automatic mapping.',
        sourcesChecked: ['https://service.unece.org/trade/locode/mx.htm'],
    },
    {
        label: 'CANTON',
        reason: 'Official UN/LOCODE explicitly treats Canton as an equivalence for Guangzhou Baiyun International Apt rather than a seaport name. Keep this out of automatic seaport mapping.',
        sourcesChecked: ['https://service.unece.org/trade/locode/cn.htm'],
    },
    {
        label: 'HANKOW HANKOU',
        reason: 'Official UN/LOCODE lists Hankou with rail and road functions, not port function 1, and also notes the old-name equivalence to Wuhan Tianhe International Apt. Avoid forcing this to a seaport.',
        sourcesChecked: [
            'https://service.unece.org/trade/locode/cn.htm',
            'https://service.unece.org/trade/locode/Service/LocodeColumn.htm',
        ],
    },
    {
        label: 'CANTON ISLAND',
        reason: 'Official UN/LOCODE lists Canton Island with airport function only, not port function 1. Keep this out of automatic seaport mapping.',
        sourcesChecked: [
            'https://service.unece.org/trade/locode/ki.htm',
            'https://service.unece.org/trade/locode/Service/LocodeColumn.htm',
        ],
    },
    {
        label: 'PEKAN BARU',
        reason: 'Official UN/LOCODE lists Pekanbaru, Sumatra with airport function only, not port function 1. Keep this out of automatic seaport mapping.',
        sourcesChecked: [
            'https://service.unece.org/trade/locode/id.htm',
            'https://service.unece.org/trade/locode/Service/LocodeColumn.htm',
        ],
    },
    {
        label: 'NEW JERSEY',
        reason: 'This workbook value is a state name, not a specific transport location. Official UN/LOCODE lists multiple New Jersey locations such as Port Newark, so the state-only label is too broad to auto-map to one seaport.',
        sourcesChecked: ['https://service.unece.org/trade/locode/usp.htm'],
    },
    {
        label: 'BELDE',
        reason: 'No clean official seaport match was confirmed from the sources checked. Keep unresolved until an explicit operational mapping is provided.',
        sourcesChecked: ['https://service.unece.org/trade/locode/lb.htm'],
    },
    {
        label: 'CAISHI',
        reason: 'Could not confirm a clean one-to-one seaport entry in the official sources checked. Avoid forcing a port-level mapping.',
        sourcesChecked: ['https://service.unece.org/trade/locode/cn.htm'],
    },
    {
        label: 'CHANGJIANG',
        reason: 'Official sources indicate broader geography/county-style references, not a defensible one-to-one seaport mapping for this workbook label.',
        sourcesChecked: ['https://service.unece.org/trade/locode/cn.htm'],
    },
    {
        label: 'CHENGGUAN',
        reason: 'Could not confirm a clean one-to-one seaport entry in the official sources checked. Avoid forcing a port-level mapping.',
        sourcesChecked: ['https://service.unece.org/trade/locode/cn.htm'],
    },
];
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
    const inputPath = getArgValue(args, '--input') ?? DEFAULT_INPUT_PATH;
    const outputJsonPath = getArgValue(args, '--output-json') ?? DEFAULT_OUTPUT_JSON_PATH;
    const outputCsvPath = getArgValue(args, '--output-csv') ?? DEFAULT_OUTPUT_CSV_PATH;
    const raw = await (0, promises_1.readFile)(inputPath, 'utf8');
    const parsed = JSON.parse(raw);
    const reasonsByLabel = new Map(DEFAULT_LABEL_REASONS.map((item) => [item.label, item]));
    const items = (parsed.items ?? [])
        .filter((item) => reasonsByLabel.has(item.normalizedPortLabel ?? ''))
        .map((item) => {
        const reason = reasonsByLabel.get(item.normalizedPortLabel ?? '');
        return {
            rowNumber: item.rowNumber,
            carrierName: item.carrierName,
            contactName: item.contactName,
            portLabel: item.portLabel,
            normalizedPortLabel: item.normalizedPortLabel,
            dbOfficeId: item.dbOfficeId,
            dbOfficeName: item.dbOfficeName,
            currentSuggestions: item.currentSuggestions ?? [],
            reviewReason: reason.reason,
            sourcesChecked: reason.sourcesChecked,
        };
    });
    const output = {
        generatedAt: new Date().toISOString(),
        sourceFile: path.resolve(inputPath),
        count: items.length,
        labels: DEFAULT_LABEL_REASONS,
        items,
    };
    const resolvedOutputJsonPath = path.resolve(outputJsonPath);
    const resolvedOutputCsvPath = path.resolve(outputCsvPath);
    await (0, promises_1.mkdir)(path.dirname(resolvedOutputJsonPath), { recursive: true });
    await (0, promises_1.writeFile)(resolvedOutputJsonPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
    const csvHeader = [
        'rowNumber',
        'carrierName',
        'contactName',
        'portLabel',
        'normalizedPortLabel',
        'dbOfficeId',
        'dbOfficeName',
        'reviewReason',
        'sourcesChecked',
        'currentSuggestions',
    ];
    const csvRows = items.map((item) => [
        item.rowNumber,
        item.carrierName,
        item.contactName,
        item.portLabel,
        item.normalizedPortLabel,
        item.dbOfficeId,
        item.dbOfficeName,
        item.reviewReason,
        item.sourcesChecked.join(' | '),
        JSON.stringify(item.currentSuggestions),
    ]
        .map((value) => escapeCsvValue(value))
        .join(','));
    await (0, promises_1.writeFile)(resolvedOutputCsvPath, `${csvHeader.join(',')}\n${csvRows.join('\n')}\n`, 'utf8');
    console.log(JSON.stringify({
        inputPath: path.resolve(inputPath),
        outputJsonPath: resolvedOutputJsonPath,
        outputCsvPath: resolvedOutputCsvPath,
        count: items.length,
    }, null, 2));
}
main().catch((error) => {
    console.error('Failed to build port manual review report.');
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=build-port-manual-review.js.map