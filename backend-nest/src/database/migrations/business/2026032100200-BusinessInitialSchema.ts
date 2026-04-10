import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  createEnumTypeIfMissing,
  createUuidExtension,
  dropEnumTypeIfExists,
} from '../migration-helpers';

export class BusinessInitialSchema2026032100200 implements MigrationInterface {
  name = 'BusinessInitialSchema2026032100200';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await createUuidExtension(queryRunner);
    await createEnumTypeIfMissing(queryRunner, 'inquiries_inquirytype_enum', [
      'CHA_ONLY',
      'FREIGHT_ONLY',
      'CHA_FREIGHT',
    ]);
    await createEnumTypeIfMissing(queryRunner, 'inquiries_status_enum', [
      'PENDING',
      'RFQ_SENT',
      'QUOTES_RECEIVED',
      'QUOTED_TO_CUSTOMER',
      'CLOSED',
    ]);
    await createEnumTypeIfMissing(
      queryRunner,
      'job_service_parts_parttype_enum',
      ['FREIGHT', 'CHA', 'TRANSPORTATION'],
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "inquiries" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "inquiryNumber" character varying NOT NULL,
        "inquiryType" "inquiries_inquirytype_enum" NOT NULL DEFAULT 'FREIGHT_ONLY',
        "status" "inquiries_status_enum" NOT NULL DEFAULT 'PENDING',
        "customerName" character varying NOT NULL,
        "tradeDirection" character varying,
        "origin" character varying,
        "destination" character varying,
        "shipmentMode" character varying,
        "cargoSummary" character varying,
        "ownerUserId" character varying,
        "mailboxOwnerUserId" character varying,
        "latestClientThreadKey" character varying,
        "latestAgentThreadKey" character varying,
        "firstReadAt" TIMESTAMP,
        "lastMailEventAt" TIMESTAMP,
        "extractedData" jsonb,
        "aiMeta" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_inquiries_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_inquiries_inquiryNumber" UNIQUE ("inquiryNumber")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "jobs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "inquiryId" character varying NOT NULL,
        "customerName" character varying NOT NULL,
        "tradeDirection" character varying,
        "currentStage" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_jobs_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_jobs_inquiryId" UNIQUE ("inquiryId")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "job_service_parts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "jobId" character varying NOT NULL,
        "partType" "job_service_parts_parttype_enum" NOT NULL,
        "ownerUserId" character varying,
        "status" character varying,
        "applicationSlug" character varying,
        "meta" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_job_service_parts_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ownership_assignments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "inquiryId" character varying NOT NULL,
        "previousOwnerUserId" character varying NOT NULL,
        "newOwnerUserId" character varying NOT NULL,
        "changedByUserId" character varying,
        "reason" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ownership_assignments_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "external_thread_refs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "inquiryId" character varying NOT NULL,
        "participantType" character varying NOT NULL,
        "participantEmail" character varying,
        "conversationId" character varying,
        "messageId" character varying,
        "internetMessageId" character varying,
        "webLink" character varying,
        "lastActivityAt" TIMESTAMP,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_external_thread_refs_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "rate_sheets" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "shippingLine" character varying NOT NULL,
        "route" character varying,
        "currency" character varying,
        "amount" numeric,
        "effectiveMonth" date,
        "notes" character varying,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_rate_sheets_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "rate_sheets" CASCADE');
    await queryRunner.query(
      'DROP TABLE IF EXISTS "external_thread_refs" CASCADE',
    );
    await queryRunner.query(
      'DROP TABLE IF EXISTS "ownership_assignments" CASCADE',
    );
    await queryRunner.query('DROP TABLE IF EXISTS "job_service_parts" CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS "jobs" CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS "inquiries" CASCADE');

    await dropEnumTypeIfExists(queryRunner, 'job_service_parts_parttype_enum');
    await dropEnumTypeIfExists(queryRunner, 'inquiries_status_enum');
    await dropEnumTypeIfExists(queryRunner, 'inquiries_inquirytype_enum');
  }
}
