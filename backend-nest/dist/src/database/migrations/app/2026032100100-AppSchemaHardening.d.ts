import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AppSchemaHardening2026032100100 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
