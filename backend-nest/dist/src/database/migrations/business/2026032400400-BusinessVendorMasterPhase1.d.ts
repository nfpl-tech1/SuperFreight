import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class BusinessVendorMasterPhase12026032400400 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
