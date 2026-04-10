import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { createBusinessDataSource } from '../src/database/typeorm-options';
import {
  runCarrierExportCoverageImport,
  type CarrierExportCoveragePortOverride,
  type CarrierExportCoverageReviewItem,
} from '../src/modules/vendors/carrier-export-coverage-importer';

const DEFAULT_OG_DB_ROOT = '..\\OG DB';
const DEFAULT_WORKBOOK_PATH = `${DEFAULT_OG_DB_ROOT}\\Carrier Master.xlsx`;
const DEFAULT_SUMMARY_JSON_PATH =
  '.\\reports\\carrier-export-coverage.summary.json';
const DEFAULT_REVIEW_CSV_PATH =
  '.\\reports\\carrier-export-coverage.review.csv';
const DEFAULT_PORT_OVERRIDE_JSON_PATH =
  '.\\reports\\port_overrides.reviewed.json';

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

function buildReviewCsv(reviewItems: CarrierExportCoverageReviewItem[]) {
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

  const rows = reviewItems.map((item) =>
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
    ]
      .map((value) => escapeCsvValue(value))
      .join(','),
  );

  return `${header.join(',')}\n${rows.join('\n')}\n`;
}

async function main() {
  const args = process.argv.slice(2);
  const mode =
    args.includes('--apply') || args.includes('apply') ? 'apply' : 'dry-run';
  const workbookPath =
    getArgValue(args, '--workbook') ?? DEFAULT_WORKBOOK_PATH;
  const summaryOutPath =
    getArgValue(args, '--summary-out') ?? DEFAULT_SUMMARY_JSON_PATH;
  const reviewCsvOutPath =
    getArgValue(args, '--review-csv-out') ?? DEFAULT_REVIEW_CSV_PATH;
  const reviewJsonOutPath = getArgValue(args, '--review-out');
  const portOverrideJsonPath =
    getArgValue(args, '--port-override-review') ?? DEFAULT_PORT_OVERRIDE_JSON_PATH;
  const reviewItems: CarrierExportCoverageReviewItem[] = [];
  const portOverrides = await loadPortOverrides(portOverrideJsonPath);

  const dataSource = createBusinessDataSource();
  await dataSource.initialize();

  try {
    const summary = await runCarrierExportCoverageImport(dataSource, {
      mode,
      workbookPath,
      portOverrides,
      onReviewItem: (item) => {
        reviewItems.push(item);
      },
    });

    const resolvedSummaryPath = path.resolve(summaryOutPath);
    const resolvedReviewCsvPath = path.resolve(reviewCsvOutPath);
    await mkdir(path.dirname(resolvedSummaryPath), { recursive: true });
    await writeFile(
      resolvedSummaryPath,
      `${JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          ...summary,
        },
        null,
        2,
      )}\n`,
      'utf8',
    );
    await writeFile(resolvedReviewCsvPath, buildReviewCsv(reviewItems), 'utf8');

    let resolvedReviewJsonPath: string | null = null;
    if (reviewJsonOutPath) {
      resolvedReviewJsonPath = path.resolve(reviewJsonOutPath);
      await mkdir(path.dirname(resolvedReviewJsonPath), { recursive: true });
      await writeFile(
        resolvedReviewJsonPath,
        `${JSON.stringify(
          {
            generatedAt: new Date().toISOString(),
            reviewCount: reviewItems.length,
            reviewItems,
          },
          null,
          2,
        )}\n`,
        'utf8',
      );
    }

    console.log(
      JSON.stringify(
        {
          ...summary,
          summaryFilePath: resolvedSummaryPath,
          reviewCsvFilePath: resolvedReviewCsvPath,
          reviewJsonFilePath: resolvedReviewJsonPath,
          portOverrideFilePath: portOverrides.length > 0 ? path.resolve(portOverrideJsonPath) : null,
        },
        null,
        2,
      ),
    );
  } finally {
    await dataSource.destroy();
  }
}

async function loadPortOverrides(
  portOverrideJsonPath: string,
): Promise<CarrierExportCoveragePortOverride[]> {
  try {
    await access(portOverrideJsonPath);
  } catch {
    return [];
  }

  const raw = await readFile(portOverrideJsonPath, 'utf8');
  const parsed = JSON.parse(raw) as {
    items?: Array<{
      rowNumber?: number | string;
      normalizedPortLabel?: string | null;
      portCode?: string | null;
      notes?: string | null;
      resolutionMethod?: string | null;
      source?: string | null;
    }>;
  };

  return (parsed.items ?? [])
    .map((item) => ({
      rowNumber: Number(item.rowNumber),
      normalizedPortLabel: item.normalizedPortLabel ?? null,
      portCode: item.portCode ?? null,
      notes: item.notes ?? item.resolutionMethod ?? null,
      source: item.source ?? path.resolve(portOverrideJsonPath),
    }))
    .filter(
      (item) =>
        Number.isInteger(item.rowNumber) &&
        item.rowNumber > 0 &&
        Boolean(item.portCode),
    );
}

main().catch((error) => {
  console.error('Carrier export coverage import failed.');
  console.error(error);
  process.exit(1);
});
