import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  createEnumTypeIfMissing,
  createUuidExtension,
  dropEnumTypeIfExists,
} from '../migration-helpers';

export class AppInitialSchema2026032100000 implements MigrationInterface {
  name = 'AppInitialSchema2026032100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await createUuidExtension(queryRunner);
    await createEnumTypeIfMissing(queryRunner, 'users_role_enum', [
      'ADMIN',
      'USER',
    ]);
    await createEnumTypeIfMissing(
      queryRunner,
      'user_departments_department_enum',
      ['IMPORT', 'EXPORT', 'INTERNATIONAL'],
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid NOT NULL,
        "osUserId" character varying,
        "email" character varying NOT NULL,
        "name" character varying,
        "role" "users_role_enum" NOT NULL DEFAULT 'USER',
        "isAppAdmin" boolean NOT NULL DEFAULT false,
        "isTeamLead" boolean NOT NULL DEFAULT false,
        "isActive" boolean NOT NULL DEFAULT true,
        "userType" character varying,
        "departmentSlug" character varying,
        "departmentName" character varying,
        "orgId" character varying,
        "orgName" character varying,
        "outlookConnectedAt" TIMESTAMP,
        "lastLoginContext" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_osUserId" UNIQUE ("osUserId"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "app_roles" (
        "id" uuid NOT NULL,
        "name" character varying NOT NULL,
        "description" character varying,
        "isSystem" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_app_roles_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_app_roles_name" UNIQUE ("name")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "audit_logs" (
        "id" SERIAL NOT NULL,
        "userId" character varying,
        "userEmail" character varying,
        "action" character varying NOT NULL,
        "resourceType" character varying,
        "resourceId" character varying,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "consumed_sso_tokens" (
        "tokenId" character varying NOT NULL,
        "appSlug" character varying NOT NULL,
        "consumedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_consumed_sso_tokens_tokenId" PRIMARY KEY ("tokenId")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "freight_quotes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "inquiryId" character varying NOT NULL,
        "rfqId" character varying,
        "vendorId" character varying,
        "vendorName" character varying NOT NULL,
        "currency" character varying,
        "totalRate" numeric,
        "freightRate" numeric,
        "localCharges" numeric,
        "documentation" numeric,
        "transitDays" integer,
        "validUntil" date,
        "sourceThreadRefId" character varying,
        "extractedFields" jsonb,
        "quotePromptSnapshot" jsonb,
        "remarks" character varying,
        "isSelected" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_freight_quotes_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "customer_drafts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "inquiryId" character varying NOT NULL,
        "quoteId" character varying NOT NULL,
        "generatedByUserId" character varying,
        "marginPercent" numeric,
        "draftBody" text NOT NULL,
        "subjectLine" character varying,
        "isSelected" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_customer_drafts_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "outlook_connections" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" character varying NOT NULL,
        "tenantId" character varying,
        "microsoftUserId" character varying,
        "email" character varying,
        "accessToken" text,
        "refreshToken" text,
        "accessTokenExpiresAt" TIMESTAMP,
        "isConnected" boolean NOT NULL DEFAULT false,
        "connectedAt" TIMESTAMP,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_outlook_connections_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_outlook_connections_userId" UNIQUE ("userId")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "outlook_subscriptions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" character varying NOT NULL,
        "subscriptionId" character varying,
        "resource" character varying,
        "expiresAt" TIMESTAMP,
        "isActive" boolean NOT NULL DEFAULT false,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_outlook_subscriptions_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "rfqs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "inquiryId" character varying NOT NULL,
        "inquiryNumber" character varying NOT NULL,
        "departmentId" character varying NOT NULL,
        "createdByUserId" character varying,
        "formValues" jsonb NOT NULL,
        "vendorIds" text[] NOT NULL DEFAULT '{}',
        "sent" boolean NOT NULL DEFAULT false,
        "subjectLine" character varying,
        "promptTemplateMeta" jsonb,
        "sentAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_rfqs_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "rfq_field_specs" (
        "id" SERIAL NOT NULL,
        "rfqId" uuid NOT NULL,
        "fieldKey" character varying NOT NULL,
        "fieldLabel" character varying NOT NULL,
        "isCustom" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_rfq_field_specs_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_rfq_field_specs_rfqId" FOREIGN KEY ("rfqId") REFERENCES "rfqs"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "role_permissions" (
        "id" SERIAL NOT NULL,
        "roleId" uuid NOT NULL,
        "moduleKey" character varying NOT NULL,
        "canView" boolean NOT NULL DEFAULT true,
        "canEdit" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_role_permissions_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_role_permissions_roleId" FOREIGN KEY ("roleId") REFERENCES "app_roles"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "role_scope_rules" (
        "id" SERIAL NOT NULL,
        "roleId" uuid NOT NULL,
        "scopeType" character varying NOT NULL,
        "scopeValue" character varying NOT NULL,
        CONSTRAINT "PK_role_scope_rules_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_role_scope_rules_roleId" FOREIGN KEY ("roleId") REFERENCES "app_roles"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_departments" (
        "id" SERIAL NOT NULL,
        "userId" uuid NOT NULL,
        "department" "user_departments_department_enum" NOT NULL,
        CONSTRAINT "PK_user_departments_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_departments_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_role_assignments" (
        "id" SERIAL NOT NULL,
        "userId" uuid NOT NULL,
        "roleId" uuid NOT NULL,
        CONSTRAINT "PK_user_role_assignments_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_role_assignments_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_user_role_assignments_roleId" FOREIGN KEY ("roleId") REFERENCES "app_roles"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP TABLE IF EXISTS "user_role_assignments" CASCADE',
    );
    await queryRunner.query('DROP TABLE IF EXISTS "user_departments" CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS "role_scope_rules" CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS "role_permissions" CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS "rfq_field_specs" CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS "rfqs" CASCADE');
    await queryRunner.query(
      'DROP TABLE IF EXISTS "outlook_subscriptions" CASCADE',
    );
    await queryRunner.query(
      'DROP TABLE IF EXISTS "outlook_connections" CASCADE',
    );
    await queryRunner.query('DROP TABLE IF EXISTS "customer_drafts" CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS "freight_quotes" CASCADE');
    await queryRunner.query(
      'DROP TABLE IF EXISTS "consumed_sso_tokens" CASCADE',
    );
    await queryRunner.query('DROP TABLE IF EXISTS "audit_logs" CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS "app_roles" CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS "users" CASCADE');

    await dropEnumTypeIfExists(queryRunner, 'user_departments_department_enum');
    await dropEnumTypeIfExists(queryRunner, 'users_role_enum');
  }
}
