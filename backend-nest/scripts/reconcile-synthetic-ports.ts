import { mkdir, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { createBusinessDataSource } from '../src/database/typeorm-options';
import { reconcileSyntheticPortsWithExistingCanonicalRecords } from '../src/modules/vendors/vendor-location-importer';

const DEFAULT_OUTPUT_JSON_PATH = '.\\reports\\synthetic-ports.reconciled.json';

function getArgValue(args: string[], flag: string) {
  const index = args.indexOf(flag);
  return index >= 0 ? (args[index + 1] ?? null) : null;
}

async function main() {
  const args = process.argv.slice(2);
  const outputJsonPath =
    getArgValue(args, '--output-json') ?? DEFAULT_OUTPUT_JSON_PATH;

  const dataSource = createBusinessDataSource();
  await dataSource.initialize();

  try {
    const result = await dataSource.transaction((manager) =>
      reconcileSyntheticPortsWithExistingCanonicalRecords(manager),
    );
    const output = {
      generatedAt: new Date().toISOString(),
      ...result,
    };

    const resolvedOutputJsonPath = path.resolve(outputJsonPath);
    await mkdir(path.dirname(resolvedOutputJsonPath), { recursive: true });
    await writeFile(
      resolvedOutputJsonPath,
      `${JSON.stringify(output, null, 2)}\n`,
      'utf8',
    );

    console.log(
      JSON.stringify(
        {
          outputJsonPath: resolvedOutputJsonPath,
          mergedSyntheticPorts: output.mergedSyntheticPorts,
          mergedItems: output.items.slice(0, 20).map((item) => ({
            syntheticCode: item.syntheticCode,
            syntheticName: item.syntheticName,
            linkedOfficeCount: item.linkedOfficeCount,
            canonicalCode: item.canonicalCode,
            canonicalName: item.canonicalName,
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
  console.error('Synthetic port reconciliation failed.');
  console.error(error);
  process.exit(1);
});
