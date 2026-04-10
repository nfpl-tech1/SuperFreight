import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  addUniqueConstraintIfMissing,
  createIndexIfMissing,
  dropConstraintIfExists,
  dropIndexIfExists,
} from '../migration-helpers';

export class AppSchemaHardening2026032100100 implements MigrationInterface {
  name = 'AppSchemaHardening2026032100100';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await addUniqueConstraintIfMissing(
      queryRunner,
      'user_departments',
      'UQ_user_departments_userId_department',
      ['userId', 'department'],
    );
    await addUniqueConstraintIfMissing(
      queryRunner,
      'user_role_assignments',
      'UQ_user_role_assignments_userId_roleId',
      ['userId', 'roleId'],
    );
    await addUniqueConstraintIfMissing(
      queryRunner,
      'role_permissions',
      'UQ_role_permissions_roleId_moduleKey',
      ['roleId', 'moduleKey'],
    );
    await addUniqueConstraintIfMissing(
      queryRunner,
      'role_scope_rules',
      'UQ_role_scope_rules_roleId_scopeType_scopeValue',
      ['roleId', 'scopeType', 'scopeValue'],
    );
    await addUniqueConstraintIfMissing(
      queryRunner,
      'rfq_field_specs',
      'UQ_rfq_field_specs_rfqId_fieldKey',
      ['rfqId', 'fieldKey'],
    );
    await addUniqueConstraintIfMissing(
      queryRunner,
      'outlook_subscriptions',
      'UQ_outlook_subscriptions_userId',
      ['userId'],
    );

    await createIndexIfMissing(
      queryRunner,
      'IDX_user_departments_userId',
      'user_departments',
      '("userId")',
    );
    await createIndexIfMissing(
      queryRunner,
      'IDX_user_role_assignments_userId',
      'user_role_assignments',
      '("userId")',
    );
    await createIndexIfMissing(
      queryRunner,
      'IDX_user_role_assignments_roleId',
      'user_role_assignments',
      '("roleId")',
    );
    await createIndexIfMissing(
      queryRunner,
      'IDX_role_permissions_roleId',
      'role_permissions',
      '("roleId")',
    );
    await createIndexIfMissing(
      queryRunner,
      'IDX_role_scope_rules_roleId',
      'role_scope_rules',
      '("roleId")',
    );
    await createIndexIfMissing(
      queryRunner,
      'IDX_rfq_field_specs_rfqId',
      'rfq_field_specs',
      '("rfqId")',
    );
    await createIndexIfMissing(
      queryRunner,
      'IDX_freight_quotes_createdAt',
      'freight_quotes',
      '("createdAt")',
    );
    await createIndexIfMissing(
      queryRunner,
      'IDX_freight_quotes_inquiryId_createdAt',
      'freight_quotes',
      '("inquiryId", "createdAt")',
    );
    await createIndexIfMissing(
      queryRunner,
      'IDX_freight_quotes_rfqId',
      'freight_quotes',
      '("rfqId")',
    );
    await createIndexIfMissing(
      queryRunner,
      'IDX_freight_quotes_vendorId',
      'freight_quotes',
      '("vendorId")',
    );
    await createIndexIfMissing(
      queryRunner,
      'IDX_customer_drafts_createdAt',
      'customer_drafts',
      '("createdAt")',
    );
    await createIndexIfMissing(
      queryRunner,
      'IDX_customer_drafts_inquiryId',
      'customer_drafts',
      '("inquiryId")',
    );
    await createIndexIfMissing(
      queryRunner,
      'IDX_customer_drafts_quoteId',
      'customer_drafts',
      '("quoteId")',
    );
    await createIndexIfMissing(
      queryRunner,
      'IDX_customer_drafts_generatedByUserId',
      'customer_drafts',
      '("generatedByUserId")',
    );
    await createIndexIfMissing(
      queryRunner,
      'IDX_rfqs_createdAt',
      'rfqs',
      '("createdAt")',
    );
    await createIndexIfMissing(
      queryRunner,
      'IDX_rfqs_inquiryId',
      'rfqs',
      '("inquiryId")',
    );
    await createIndexIfMissing(
      queryRunner,
      'IDX_rfqs_createdByUserId',
      'rfqs',
      '("createdByUserId")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await dropIndexIfExists(queryRunner, 'IDX_rfqs_createdByUserId');
    await dropIndexIfExists(queryRunner, 'IDX_rfqs_inquiryId');
    await dropIndexIfExists(queryRunner, 'IDX_rfqs_createdAt');
    await dropIndexIfExists(
      queryRunner,
      'IDX_customer_drafts_generatedByUserId',
    );
    await dropIndexIfExists(queryRunner, 'IDX_customer_drafts_quoteId');
    await dropIndexIfExists(queryRunner, 'IDX_customer_drafts_inquiryId');
    await dropIndexIfExists(queryRunner, 'IDX_customer_drafts_createdAt');
    await dropIndexIfExists(queryRunner, 'IDX_freight_quotes_vendorId');
    await dropIndexIfExists(queryRunner, 'IDX_freight_quotes_rfqId');
    await dropIndexIfExists(
      queryRunner,
      'IDX_freight_quotes_inquiryId_createdAt',
    );
    await dropIndexIfExists(queryRunner, 'IDX_freight_quotes_createdAt');
    await dropIndexIfExists(queryRunner, 'IDX_rfq_field_specs_rfqId');
    await dropIndexIfExists(queryRunner, 'IDX_role_scope_rules_roleId');
    await dropIndexIfExists(queryRunner, 'IDX_role_permissions_roleId');
    await dropIndexIfExists(queryRunner, 'IDX_user_role_assignments_roleId');
    await dropIndexIfExists(queryRunner, 'IDX_user_role_assignments_userId');
    await dropIndexIfExists(queryRunner, 'IDX_user_departments_userId');

    await dropConstraintIfExists(
      queryRunner,
      'outlook_subscriptions',
      'UQ_outlook_subscriptions_userId',
    );
    await dropConstraintIfExists(
      queryRunner,
      'rfq_field_specs',
      'UQ_rfq_field_specs_rfqId_fieldKey',
    );
    await dropConstraintIfExists(
      queryRunner,
      'role_scope_rules',
      'UQ_role_scope_rules_roleId_scopeType_scopeValue',
    );
    await dropConstraintIfExists(
      queryRunner,
      'role_permissions',
      'UQ_role_permissions_roleId_moduleKey',
    );
    await dropConstraintIfExists(
      queryRunner,
      'user_role_assignments',
      'UQ_user_role_assignments_userId_roleId',
    );
    await dropConstraintIfExists(
      queryRunner,
      'user_departments',
      'UQ_user_departments_userId_department',
    );
  }
}
