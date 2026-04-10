"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUuidExtension = createUuidExtension;
exports.createEnumTypeIfMissing = createEnumTypeIfMissing;
exports.dropEnumTypeIfExists = dropEnumTypeIfExists;
exports.addUniqueConstraintIfMissing = addUniqueConstraintIfMissing;
exports.dropConstraintIfExists = dropConstraintIfExists;
exports.createIndexIfMissing = createIndexIfMissing;
exports.dropIndexIfExists = dropIndexIfExists;
async function createUuidExtension(queryRunner) {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
}
async function createEnumTypeIfMissing(queryRunner, typeName, values) {
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
async function dropEnumTypeIfExists(queryRunner, typeName) {
    await queryRunner.query(`DROP TYPE IF EXISTS "${typeName}"`);
}
async function addUniqueConstraintIfMissing(queryRunner, tableName, constraintName, columns) {
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
async function dropConstraintIfExists(queryRunner, tableName, constraintName) {
    await queryRunner.query(`ALTER TABLE "${tableName}" DROP CONSTRAINT IF EXISTS "${constraintName}"`);
}
async function createIndexIfMissing(queryRunner, indexName, tableName, expression) {
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "${indexName}" ON "${tableName}" ${expression}`);
}
async function dropIndexIfExists(queryRunner, indexName) {
    await queryRunner.query(`DROP INDEX IF EXISTS "${indexName}"`);
}
//# sourceMappingURL=migration-helpers.js.map