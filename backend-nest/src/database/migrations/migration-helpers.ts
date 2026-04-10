import { QueryRunner } from 'typeorm';

export async function createUuidExtension(queryRunner: QueryRunner) {
  await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
}

export async function createEnumTypeIfMissing(
  queryRunner: QueryRunner,
  typeName: string,
  values: string[],
) {
  const enumValues = values.map((value) => `'${value}'`).join(', ');

  await queryRunner.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = '${typeName}'
      ) THEN
        CREATE TYPE "${typeName}" AS ENUM (${enumValues});
      END IF;
    END
    $$;
  `);
}

export async function dropEnumTypeIfExists(
  queryRunner: QueryRunner,
  typeName: string,
) {
  await queryRunner.query(`DROP TYPE IF EXISTS "${typeName}"`);
}

export async function addUniqueConstraintIfMissing(
  queryRunner: QueryRunner,
  tableName: string,
  constraintName: string,
  columns: string[],
) {
  const columnList = columns.map((column) => `"${column}"`).join(', ');

  await queryRunner.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = '${constraintName}'
          AND conrelid = to_regclass('public.${tableName}')
      ) THEN
        ALTER TABLE "${tableName}"
        ADD CONSTRAINT "${constraintName}" UNIQUE (${columnList});
      END IF;
    END
    $$;
  `);
}

export async function dropConstraintIfExists(
  queryRunner: QueryRunner,
  tableName: string,
  constraintName: string,
) {
  await queryRunner.query(
    `ALTER TABLE "${tableName}" DROP CONSTRAINT IF EXISTS "${constraintName}"`,
  );
}

export async function createIndexIfMissing(
  queryRunner: QueryRunner,
  indexName: string,
  tableName: string,
  expression: string,
) {
  await queryRunner.query(
    `CREATE INDEX IF NOT EXISTS "${indexName}" ON "${tableName}" ${expression}`,
  );
}

export async function dropIndexIfExists(
  queryRunner: QueryRunner,
  indexName: string,
) {
  await queryRunner.query(`DROP INDEX IF EXISTS "${indexName}"`);
}
