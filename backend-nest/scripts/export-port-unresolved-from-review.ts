import { mkdir, readFile, writeFile } from 'node:fs/promises';
import * as path from 'node:path';

type ReviewSuggestion = {
  code: string;
  name: string;
  cityName: string | null;
  countryName: string;
  score: number;
  rationale: string;
};

type ReviewItem = {
  rowNumber: number;
  status: string;
  carrierName: string;
  contactName: string | null;
  portLabel: string;
  normalizedPortLabel: string | null;
  resolvedOfficeName: string | null;
  officeConfidence: 'high' | 'medium' | null;
  officeMatchReasons: string[];
  vendorId: string | null;
  dbOfficeId: string | null;
  dbOfficeName: string | null;
  portId: string | null;
  portCode: string | null;
  portName: string | null;
  linkAction: 'none' | 'dry-run' | 'created' | 'existing';
  notes: string | null;
  suggestions: ReviewSuggestion[];
};

type ReviewOutput = {
  generatedAt: string;
  reviewItems: ReviewItem[];
};

function getArgValue(args: string[], flag: string) {
  const index = args.indexOf(flag);
  return index >= 0 ? (args[index + 1] ?? null) : null;
}

function escapeCsvValue(value: string | number | null | undefined) {
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
  const inputPath =
    getArgValue(args, '--input') ?? '.\\tmp\\carrier-export-coverage.refresh.json';
  const outputJsonPath =
    getArgValue(args, '--output-json') ?? '.\\reports\\port_unresolved.unresolved.json';
  const outputCsvPath =
    getArgValue(args, '--output-csv') ?? '.\\reports\\port_unresolved.unresolved.csv';

  const raw = await readFile(inputPath, 'utf8');
  const parsed = JSON.parse(raw) as ReviewOutput;

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
    splitRule:
      'Current unresolved queue exported directly from the latest carrier export coverage dry-run.',
    count: items.length,
    items,
  };

  const resolvedJsonPath = path.resolve(outputJsonPath);
  const resolvedCsvPath = path.resolve(outputCsvPath);
  await mkdir(path.dirname(resolvedJsonPath), { recursive: true });
  await writeFile(resolvedJsonPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');

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

  const csvRows = items.map((item) =>
    [
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
        .map(
          (suggestion) =>
            `${suggestion.code}:${suggestion.name} (${suggestion.countryName})`,
        )
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
      .join(','),
  );

  await writeFile(
    resolvedCsvPath,
    `${csvHeader.join(',')}\n${csvRows.join('\n')}\n`,
    'utf8',
  );

  console.log(
    JSON.stringify(
      {
        inputPath: path.resolve(inputPath),
        outputJsonPath: resolvedJsonPath,
        outputCsvPath: resolvedCsvPath,
        count: items.length,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error('Failed to export current unresolved port queue.');
  console.error(error);
  process.exit(1);
});
