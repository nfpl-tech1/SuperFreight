import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AppInitialSchema2026032100000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
