import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class BusinessSchemaHardening2026032100300 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
