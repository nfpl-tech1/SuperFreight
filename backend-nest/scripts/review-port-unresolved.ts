import { readFile, writeFile, mkdir } from 'node:fs/promises';
import * as path from 'node:path';

type PortReviewItem = {
  rowNumber: string | number;
  carrierName: string | null;
  contactName: string | null;
  portLabel: string | null;
  normalizedPortLabel: string | null;
  resolvedOfficeName: string | null;
  dbOfficeId: string | null;
  dbOfficeName: string | null;
  currentSuggestions?: Array<{
    code: string;
    name: string;
    cityName: string | null;
    countryName: string;
    score: number;
    rationale: string;
  }>;
};

type PortUnresolvedReport = {
  generatedAt: string;
  count: number;
  items: PortReviewItem[];
};

type GroupedUnresolvedLabel = {
  normalizedPortLabel: string;
  displayPortLabel: string;
  count: number;
  carriers: string[];
  offices: string[];
  sampleRows: Array<{
    rowNumber: string | number;
    carrierName: string | null;
    portLabel: string | null;
    dbOfficeName: string | null;
    currentSuggestions: PortReviewItem['currentSuggestions'];
  }>;
  suggestionCodes: string[];
};

type GroupedUnresolvedOutput = {
  generatedAt: string;
  sourceFile: string;
  groupCount: number;
  itemCount: number;
  groups: GroupedUnresolvedLabel[];
};

const DEFAULT_INPUT_PATH = '.\\reports\\port_unresolved.unresolved.json';
const DEFAULT_OUTPUT_PATH = '.\\reports\\port_unresolved.grouped.json';

function getArgValue(args: string[], flag: string) {
  const index = args.indexOf(flag);
  return index >= 0 ? (args[index + 1] ?? null) : null;
}

function sortText(values: Iterable<string>) {
  return Array.from(new Set(values)).sort((left, right) =>
    left.localeCompare(right),
  );
}

async function main() {
  const args = process.argv.slice(2);
  const inputPath = getArgValue(args, '--input') ?? DEFAULT_INPUT_PATH;
  const outputPath = getArgValue(args, '--output') ?? DEFAULT_OUTPUT_PATH;
  const limit = Number(getArgValue(args, '--limit') ?? '0');

  const raw = await readFile(inputPath, 'utf8');
  const parsed = JSON.parse(raw) as PortUnresolvedReport;
  const groups = new Map<string, GroupedUnresolvedLabel>();

  for (const item of parsed.items ?? []) {
    const normalizedPortLabel =
      item.normalizedPortLabel?.trim() || item.portLabel?.trim() || 'UNKNOWN';
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
      suggestionCodes: (item.currentSuggestions ?? []).map(
        (suggestion) => suggestion.code,
      ),
    });
  }

  const grouped = Array.from(groups.values())
    .map((group) => ({
      ...group,
      carriers: sortText(group.carriers),
      offices: sortText(group.offices),
      suggestionCodes: sortText(group.suggestionCodes),
    }))
    .sort(
      (left, right) =>
        right.count - left.count ||
        left.normalizedPortLabel.localeCompare(right.normalizedPortLabel),
    );

  const limitedGroups =
    limit > 0 ? grouped.slice(0, limit) : grouped;

  const output: GroupedUnresolvedOutput = {
    generatedAt: new Date().toISOString(),
    sourceFile: path.resolve(inputPath),
    groupCount: limitedGroups.length,
    itemCount: parsed.count,
    groups: limitedGroups,
  };

  const resolvedOutputPath = path.resolve(outputPath);
  await mkdir(path.dirname(resolvedOutputPath), { recursive: true });
  await writeFile(
    resolvedOutputPath,
    `${JSON.stringify(output, null, 2)}\n`,
    'utf8',
  );

  console.log(
    JSON.stringify(
      {
        inputPath: path.resolve(inputPath),
        outputPath: resolvedOutputPath,
        groupCount: output.groupCount,
        itemCount: output.itemCount,
        topGroups: limitedGroups.slice(0, 10).map((group) => ({
          normalizedPortLabel: group.normalizedPortLabel,
          count: group.count,
          suggestionCodes: group.suggestionCodes,
        })),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error('Failed to build grouped unresolved port review.');
  console.error(error);
  process.exit(1);
});
