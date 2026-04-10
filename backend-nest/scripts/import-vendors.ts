import { mkdir, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { createBusinessDataSource } from '../src/database/typeorm-options';
import {
  runVendorImport,
  type PortLinkReviewItem,
  type VendorSkippedRow,
} from '../src/modules/vendors/vendor-importer';

const DEFAULT_OG_DB_ROOT = '..\\OG DB';
const DEFAULT_PORT_REVIEW_SUMMARY_PATH =
  '.\\reports\\vendor-port-link-review.summary.json';
const DEFAULT_PORT_REVIEW_CSV_PATH =
  '.\\reports\\vendor-port-link-review.summary.csv';

function getArgValue(args: string[], flag: string) {
  const index = args.indexOf(flag);
  return index >= 0 ? (args[index + 1] ?? null) : null;
}

type PortReviewSample = {
  vendorName: string | null;
  officeName: string | null;
  officeCountryName: string | null;
  officeCityName: string | null;
};

type PortReviewSummarySuggestion = {
  count: number;
  code: string;
  name: string;
  cityName: string | null;
  countryName: string;
  portMode: string;
  confidence: string;
  rationale: string;
};

function buildPortReviewCandidateSummary(items: PortLinkReviewItem[]) {
  const grouped = new Map<
    string,
    {
      candidate: string;
      normalizedCandidate: string | null;
      count: number;
      preferredModes: Set<string>;
      samples: PortReviewSample[];
      suggestions: Map<string, PortReviewSummarySuggestion>;
    }
  >();

  for (const item of items) {
    const key = item.normalizedCandidate ?? item.candidate;
    const existing = grouped.get(key) ?? {
      candidate: item.candidate,
      normalizedCandidate: item.normalizedCandidate,
      count: 0,
      preferredModes: new Set<string>(),
      samples: [] as PortReviewSample[],
      suggestions: new Map<string, PortReviewSummarySuggestion>(),
    };

    existing.count += 1;
    for (const preferredMode of item.preferredModes) {
      existing.preferredModes.add(preferredMode);
    }

    if (existing.samples.length < 5) {
      existing.samples.push({
        vendorName: item.vendorName,
        officeName: item.officeName,
        officeCountryName: item.officeCountryName,
        officeCityName: item.officeCityName,
      });
    }

    for (const suggestion of item.suggestions) {
      const suggestionKey = [
        suggestion.portMode,
        suggestion.code,
        suggestion.name,
      ].join('::');
      const existingSuggestion = existing.suggestions.get(suggestionKey);
      if (existingSuggestion) {
        existingSuggestion.count += 1;
      } else {
        existing.suggestions.set(suggestionKey, {
          count: 1,
          code: suggestion.code,
          name: suggestion.name,
          cityName: suggestion.cityName,
          countryName: suggestion.countryName,
          portMode: suggestion.portMode,
          confidence: suggestion.confidence,
          rationale: suggestion.rationale,
        });
      }
    }

    grouped.set(key, existing);
  }

  return Array.from(grouped.values())
    .map((item) => ({
      candidate: item.candidate,
      normalizedCandidate: item.normalizedCandidate,
      count: item.count,
      preferredModes: Array.from(item.preferredModes),
      suggestions: Array.from(item.suggestions.values())
        .sort((left, right) => right.count - left.count)
        .slice(0, 5),
      samples: item.samples,
    }))
    .sort(
      (left, right) =>
        right.count - left.count ||
        left.candidate.localeCompare(right.candidate),
    );
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

function buildPortReviewCandidateCsv(
  candidateSummary: ReturnType<typeof buildPortReviewCandidateSummary>,
) {
  const header = [
    'candidate',
    'normalizedCandidate',
    'count',
    'preferredModes',
    'topSuggestionCode',
    'topSuggestionName',
    'topSuggestionCountry',
    'topSuggestionMode',
    'topSuggestionConfidence',
    'topSuggestionRationale',
    'sampleVendors',
    'sampleOffices',
  ];

  const rows = candidateSummary.map((candidate) => {
    const topSuggestion = candidate.suggestions[0];
    const sampleVendors = candidate.samples
      .map((sample) => sample.vendorName)
      .filter((value): value is string => Boolean(value))
      .join(' | ');
    const sampleOffices = candidate.samples
      .map((sample) => sample.officeName)
      .filter((value): value is string => Boolean(value))
      .join(' | ');

    return [
      candidate.candidate,
      candidate.normalizedCandidate,
      candidate.count,
      candidate.preferredModes.join(' | '),
      topSuggestion?.code ?? null,
      topSuggestion?.name ?? null,
      topSuggestion?.countryName ?? null,
      topSuggestion?.portMode ?? null,
      topSuggestion?.confidence ?? null,
      topSuggestion?.rationale ?? null,
      sampleVendors,
      sampleOffices,
    ]
      .map((value) => escapeCsvValue(value))
      .join(',');
  });

  return `${header.join(',')}\n${rows.join('\n')}\n`;
}

async function main() {
  const args = process.argv.slice(2);
  const mode =
    args.includes('--apply') || args.includes('apply') ? 'apply' : 'dry-run';
  const vendorOnly = args.includes('--vendor-only');
  const replaceExisting =
    args.includes('--replace-existing') || args.includes('--truncate');
  const skippedReviewPath = getArgValue(args, '--skipped-review-out');
  const portReviewPath = getArgValue(args, '--port-review-out');
  const portReviewSummaryPath =
    getArgValue(args, '--port-review-summary-out') ??
    DEFAULT_PORT_REVIEW_SUMMARY_PATH;
  const portReviewCsvPath =
    getArgValue(args, '--port-review-csv-out') ?? DEFAULT_PORT_REVIEW_CSV_PATH;
  const skippedRows: VendorSkippedRow[] = [];
  const portReviewItems: PortLinkReviewItem[] = [];

  const dataSource = createBusinessDataSource();
  await dataSource.initialize();

  try {
    const summary = await runVendorImport(dataSource, {
      mode,
      domesticWorkbookPath:
        getArgValue(args, '--domestic') ??
        `${DEFAULT_OG_DB_ROOT}\\Data Base- Export.xlsx`,
      wcaWorkbookPath: getArgValue(args, '--wca') ?? null,
      importTemplateWorkbookPath: getArgValue(args, '--template') ?? null,
      regionsWorkbookPath: getArgValue(args, '--regions') ?? null,
      portMasterWorkbookPath:
        getArgValue(args, '--port-master') ??
        `${DEFAULT_OG_DB_ROOT}\\Port master.xlsx`,
      carrierWorkbookPath:
        getArgValue(args, '--carrier') ??
        `${DEFAULT_OG_DB_ROOT}\\Carrier Master.xlsx`,
      regularWcaWorkbookPath:
        getArgValue(args, '--regular-wca') ??
        `${DEFAULT_OG_DB_ROOT}\\Regular WCA Agents.xlsx`,
      wcaCountries: [
        'China',
        'Thailand',
        'Indonesia',
        'United States',
        'Egypt',
        'United Kingdom',
        'Germany',
        'Malaysia',
        'France',
        'Australia',
        'Singapore',
        'Japan',
        'Italy',
        'Netherlands',
        'Korea',
      ],
      linkLocations: !vendorOnly,
      replaceExisting,
      onSkippedRow: (row) => {
        skippedRows.push(row);
      },
      onPortLinkReviewItem: vendorOnly
        ? undefined
        : (item) => {
            portReviewItems.push(item);
          },
    });

    let skippedReviewFilePath: string | null = null;
    if (skippedRows.length > 0 && skippedReviewPath) {
      skippedReviewFilePath = path.resolve(skippedReviewPath);
      await mkdir(path.dirname(skippedReviewFilePath), { recursive: true });
      await writeFile(
        skippedReviewFilePath,
        `${JSON.stringify(
          {
            generatedAt: new Date().toISOString(),
            mode,
            skippedRowCount: skippedRows.length,
            skippedRows,
          },
          null,
          2,
        )}\n`,
        'utf8',
      );
    }

    let portReviewFilePath: string | null = null;
    let portReviewSummaryFilePath: string | null = null;
    let portReviewCsvFilePath: string | null = null;
    if (!vendorOnly && portReviewItems.length > 0) {
      const portReviewCandidateSummary =
        buildPortReviewCandidateSummary(portReviewItems);
      portReviewSummaryFilePath = path.resolve(portReviewSummaryPath);
      portReviewCsvFilePath = path.resolve(portReviewCsvPath);
      await mkdir(path.dirname(portReviewSummaryFilePath), { recursive: true });
      await writeFile(
        portReviewSummaryFilePath,
        `${JSON.stringify(
          {
            generatedAt: new Date().toISOString(),
            mode,
            portReviewCount: portReviewItems.length,
            uniqueCandidateCount: portReviewCandidateSummary.length,
            candidateSummary: portReviewCandidateSummary,
          },
          null,
          2,
        )}\n`,
        'utf8',
      );
      await writeFile(
        portReviewCsvFilePath,
        buildPortReviewCandidateCsv(portReviewCandidateSummary),
        'utf8',
      );

      if (portReviewPath) {
        portReviewFilePath = path.resolve(portReviewPath);
        await mkdir(path.dirname(portReviewFilePath), { recursive: true });
        await writeFile(
          portReviewFilePath,
          `${JSON.stringify(
            {
              generatedAt: new Date().toISOString(),
              mode,
              portReviewCount: portReviewItems.length,
              uniqueCandidateCount: portReviewCandidateSummary.length,
              candidateSummary: portReviewCandidateSummary,
              portReviewItems,
            },
            null,
            2,
          )}\n`,
          'utf8',
        );
      }
    }

    console.log(
      JSON.stringify(
        {
          ...summary,
          skippedRowsExported: skippedReviewFilePath ? skippedRows.length : 0,
          skippedReviewFilePath,
          portReviewExported: portReviewFilePath ? portReviewItems.length : 0,
          portReviewFilePath,
          portReviewSummaryFilePath,
          portReviewCsvFilePath,
        },
        null,
        2,
      ),
    );
  } finally {
    await dataSource.destroy();
  }
}

main().catch((error) => {
  console.error('Vendor import failed.');
  console.error(error);
  process.exit(1);
});
