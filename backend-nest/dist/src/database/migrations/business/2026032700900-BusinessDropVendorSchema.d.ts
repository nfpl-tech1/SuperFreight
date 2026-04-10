import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class BusinessDropVendorSchema2026032700900 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
