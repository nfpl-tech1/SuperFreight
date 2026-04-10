import { QueryRunner } from 'typeorm';
export declare function createUuidExtension(queryRunner: QueryRunner): Promise<void>;
export declare function createEnumTypeIfMissing(queryRunner: QueryRunner, typeName: string, values: string[]): Promise<void>;
export declare function dropEnumTypeIfExists(queryRunner: QueryRunner, typeName: string): Promise<void>;
export declare function addUniqueConstraintIfMissing(queryRunner: QueryRunner, tableName: string, constraintName: string, columns: string[]): Promise<void>;
export declare function dropConstraintIfExists(queryRunner: QueryRunner, tableName: string, constraintName: string): Promise<void>;
export declare function createIndexIfMissing(queryRunner: QueryRunner, indexName: string, tableName: string, expression: string): Promise<void>;
export declare function dropIndexIfExists(queryRunner: QueryRunner, indexName: string): Promise<void>;
