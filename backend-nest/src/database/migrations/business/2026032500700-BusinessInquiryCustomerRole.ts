import { MigrationInterface, QueryRunner } from 'typeorm';

export class BusinessInquiryCustomerRole2026032500700
  implements MigrationInterface
{
  name = 'BusinessInquiryCustomerRole2026032500700';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "inquiries"
      ADD COLUMN IF NOT EXISTS "customerRole" character varying
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "inquiries"
      DROP COLUMN IF EXISTS "customerRole"
    `);
  }
}
