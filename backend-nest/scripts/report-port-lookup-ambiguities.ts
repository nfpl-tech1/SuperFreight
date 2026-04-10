import { mkdir, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { createBusinessDataSource } from '../src/database/typeorm-options';
import { PortMode } from '../src/modules/vendors/entities/port-master.entity';
import { generatePortLookupAmbiguityReports } from '../src/modules/vendors/port-lookup-ambiguity-report';

const DEFAULT_REPORT_DIR = '.\\reports';

async function writeJsonFile(filePath: string, payload: unknown) {
  const resolvedPath = path.resolve(filePath);
  await mkdir(path.dirname(resolvedPath), { recursive: true });
  await writeFile(resolvedPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  return resolvedPath;
}

async function main() {
  const reportDir = path.resolve(DEFAULT_REPORT_DIR);
  const dataSource = createBusinessDataSource();
  await dataSource.initialize();

  try {
    const airportReports = await generatePortLookupAmbiguityReports(
      dataSource,
      PortMode.AIRPORT,
    );
    const seaportReports = await generatePortLookupAmbiguityReports(
      dataSource,
      PortMode.SEAPORT,
    );

    const outputs = {
      airport: {
        reportFilePath: await writeJsonFile(
          path.join(reportDir, 'port-lookup-ambiguities.airport.json'),
          airportReports.unresolved,
        ),
        resolvedFilePath: await writeJsonFile(
          path.join(reportDir, 'port-lookup-ambiguities.airport.resolved.json'),
          airportReports.resolved,
        ),
        unresolvedFilePath: await writeJsonFile(
          path.join(
            reportDir,
            'port-lookup-ambiguities.airport.unresolved.json',
          ),
          airportReports.unresolved,
        ),
        rawCount: airportReports.raw.count,
        resolvedCount: airportReports.resolved.count,
        unresolvedCount: airportReports.unresolved.count,
      },
      seaport: {
        reportFilePath: await writeJsonFile(
          path.join(reportDir, 'port-lookup-ambiguities.seaport.json'),
          seaportReports.unresolved,
        ),
        resolvedFilePath: await writeJsonFile(
          path.join(reportDir, 'port-lookup-ambiguities.seaport.resolved.json'),
          seaportReports.resolved,
        ),
        unresolvedFilePath: await writeJsonFile(
          path.join(
            reportDir,
            'port-lookup-ambiguities.seaport.unresolved.json',
          ),
          seaportReports.unresolved,
        ),
        rawCount: seaportReports.raw.count,
        resolvedCount: seaportReports.resolved.count,
        unresolvedCount: seaportReports.unresolved.count,
      },
    };

    console.log(JSON.stringify(outputs, null, 2));
  } finally {
    await dataSource.destroy();
  }
}

main().catch((error) => {
  console.error('Port lookup ambiguity report generation failed.');
  console.error(error);
  process.exit(1);
});
