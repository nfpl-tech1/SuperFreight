import { DataSource } from 'typeorm';
import {
  createAppDataSource,
  createBusinessDataSource,
} from '../src/database/typeorm-options';

type Command = 'run' | 'revert';
type Target = 'app' | 'business' | 'all';

async function withDataSource(
  label: string,
  dataSource: DataSource,
  command: Command,
) {
  await dataSource.initialize();

  try {
    if (command === 'run') {
      const migrations = await dataSource.runMigrations();
      if (migrations.length === 0) {
        console.log(`${label}: no pending migrations.`);
        return;
      }

      for (const migration of migrations) {
        console.log(`${label}: applied ${migration.name}`);
      }
      return;
    }

    await dataSource.undoLastMigration();
    console.log(`${label}: reverted last migration.`);
  } finally {
    await dataSource.destroy();
  }
}

async function main() {
  const command = (process.argv[2] ?? 'run') as Command;
  const target = (process.argv[3] ?? 'all') as Target;

  if (!['run', 'revert'].includes(command)) {
    throw new Error(`Unsupported migration command: ${command}`);
  }

  if (!['app', 'business', 'all'].includes(target)) {
    throw new Error(`Unsupported migration target: ${target}`);
  }

  if (target === 'app' || target === 'all') {
    await withDataSource('app', createAppDataSource(), command);
  }

  if (target === 'business' || target === 'all') {
    await withDataSource('business', createBusinessDataSource(), command);
  }
}

main().catch((error) => {
  console.error('TypeORM migration command failed.');
  console.error(error);
  process.exit(1);
});
