import { createBusinessDataSource } from '../src/database/typeorm-options';
import { createVendorLocationImportContext } from '../src/modules/vendors/vendor-location-importer';

const DEFAULT_PORT_MASTER_WORKBOOK = '..\\OG DB\\Port master.xlsx';

function getArgValue(args: string[], flag: string) {
  const index = args.indexOf(flag);
  return index >= 0 ? (args[index + 1] ?? null) : null;
}

async function main() {
  const args = process.argv.slice(2);
  const workbookPath =
    getArgValue(args, '--workbook') ?? DEFAULT_PORT_MASTER_WORKBOOK;
  const shouldReset =
    args.includes('--reset') || args.includes('--truncate-existing');

  const dataSource = createBusinessDataSource();
  await dataSource.initialize();

  try {
    const result = await dataSource.transaction(async (manager) => {
      if (shouldReset) {
        await manager.query(
          'TRUNCATE TABLE "vendor_office_ports", "port_alias", "port_master"',
        );
      }

      const context = await createVendorLocationImportContext(
        manager,
        null,
        workbookPath,
      );

      return context.summary;
    });

    console.log(
      JSON.stringify(
        {
          workbookPath,
          resetExisting: shouldReset,
          summary: result,
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
  console.error('Port master import failed.');
  console.error(error);
  process.exit(1);
});
