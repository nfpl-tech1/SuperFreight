import { MigrationInterface, QueryRunner } from 'typeorm';
import { createIndexIfMissing, dropIndexIfExists } from '../migration-helpers';

export class BusinessSchemaHardening2026032100300 implements MigrationInterface {
  name = 'BusinessSchemaHardening2026032100300';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await createIndexIfMissing(
      queryRunner,
      'IDX_inquiries_createdAt',
      'inquiries',
      '("createdAt")',
    );
    await createIndexIfMissing(
      queryRunner,
      'IDX_inquiries_ownerUserId_createdAt',
      'inquiries',
      '("ownerUserId", "createdAt")',
    );
    await createIndexIfMissing(
      queryRunner,
      'IDX_inquiries_mailboxOwnerUserId_createdAt',
      'inquiries',
      '("mailboxOwnerUserId", "createdAt")',
    );
    await createIndexIfMissing(
      queryRunner,
      'IDX_job_service_parts_jobId',
      'job_service_parts',
      '("jobId")',
    );
    await createIndexIfMissing(
      queryRunner,
      'IDX_ownership_assignments_inquiryId_createdAt',
      'ownership_assignments',
      '("inquiryId", "createdAt")',
    );
    await createIndexIfMissing(
      queryRunner,
      'IDX_external_thread_refs_inquiryId',
      'external_thread_refs',
      '("inquiryId")',
    );
    await createIndexIfMissing(
      queryRunner,
      'IDX_rate_sheets_effectiveMonth_shippingLine',
      'rate_sheets',
      '("effectiveMonth", "shippingLine")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await dropIndexIfExists(
      queryRunner,
      'IDX_rate_sheets_effectiveMonth_shippingLine',
    );
    await dropIndexIfExists(queryRunner, 'IDX_external_thread_refs_inquiryId');
    await dropIndexIfExists(
      queryRunner,
      'IDX_ownership_assignments_inquiryId_createdAt',
    );
    await dropIndexIfExists(queryRunner, 'IDX_job_service_parts_jobId');
    await dropIndexIfExists(
      queryRunner,
      'IDX_inquiries_mailboxOwnerUserId_createdAt',
    );
    await dropIndexIfExists(queryRunner, 'IDX_inquiries_ownerUserId_createdAt');
    await dropIndexIfExists(queryRunner, 'IDX_inquiries_createdAt');
  }
}
