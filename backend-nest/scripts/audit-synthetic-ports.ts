import { mkdir, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { createBusinessDataSource } from '../src/database/typeorm-options';
import { auditSyntheticPortReconciliation } from '../src/modules/vendors/vendor-location-importer';

const DEFAULT_OUTPUT_JSON_PATH = '.\\reports\\synthetic-ports.audit.json';
const DEFAULT_OUTPUT_CSV_PATH = '.\\reports\\synthetic-ports.audit.csv';

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
  const outputJsonPath =
    getArgValue(args, '--output-json') ?? DEFAULT_OUTPUT_JSON_PATH;
  const outputCsvPath =
    getArgValue(args, '--output-csv') ?? DEFAULT_OUTPUT_CSV_PATH;

  const dataSource = createBusinessDataSource();
  await dataSource.initialize();

  try {
    const audit = await auditSyntheticPortReconciliation(dataSource.manager);
    const output = {
      generatedAt: new Date().toISOString(),
      ...audit,
    };

    const resolvedOutputJsonPath = path.resolve(outputJsonPath);
    const resolvedOutputCsvPath = path.resolve(outputCsvPath);
    await mkdir(path.dirname(resolvedOutputJsonPath), { recursive: true });
    await writeFile(
      resolvedOutputJsonPath,
      `${JSON.stringify(output, null, 2)}\n`,
      'utf8',
    );

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

    const csvRows = output.items.map((item) =>
      [
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
        .join(','),
    );

    await writeFile(
      resolvedOutputCsvPath,
      `${csvHeader.join(',')}\n${csvRows.join('\n')}\n`,
      'utf8',
    );

    console.log(
      JSON.stringify(
        {
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
  console.error('Synthetic port audit failed.');
  console.error(error);
  process.exit(1);
});
