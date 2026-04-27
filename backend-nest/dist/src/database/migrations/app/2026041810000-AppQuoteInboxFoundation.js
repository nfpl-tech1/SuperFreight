"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppQuoteInboxFoundation2026041810000 = void 0;
class AppQuoteInboxFoundation2026041810000 {
    name = 'AppQuoteInboxFoundation2026041810000';
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "quote_mailbox_scan_states" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "mailboxOwnerUserId" character varying NOT NULL,
        "lastReceivedAt" TIMESTAMP,
        "lastMessageId" character varying,
        "lastScanStartedAt" TIMESTAMP,
        "lastScanCompletedAt" TIMESTAMP,
        "lastScanStatus" character varying,
        "lastError" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_quote_mailbox_scan_states_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_quote_mailbox_scan_states_mailboxOwnerUserId" UNIQUE ("mailboxOwnerUserId")
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "quote_ignore_rules" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "mailboxOwnerUserId" character varying,
        "name" character varying NOT NULL,
        "priority" integer NOT NULL DEFAULT 100,
        "isActive" boolean NOT NULL DEFAULT true,
        "conditions" jsonb NOT NULL,
        "createdByUserId" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_quote_ignore_rules_id" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "quote_inbound_messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "mailboxOwnerUserId" character varying NOT NULL,
        "outlookMessageId" character varying NOT NULL,
        "internetMessageId" character varying,
        "conversationId" character varying,
        "receivedAt" TIMESTAMP NOT NULL,
        "fromEmail" character varying,
        "fromName" character varying,
        "subject" character varying,
        "bodyPreview" text,
        "webLink" character varying,
        "hasAttachments" boolean NOT NULL DEFAULT false,
        "matchedInquiryId" character varying,
        "matchedRfqId" character varying,
        "matchedVendorId" character varying,
        "status" character varying NOT NULL,
        "ignoreReason" character varying,
        "failureReason" text,
        "rawMetadata" jsonb,
        "attachmentMetadata" jsonb,
        "processedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_quote_inbound_messages_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_quote_inbound_messages_outlookMessageId" UNIQUE ("outlookMessageId")
      )
    `);
        await queryRunner.query(`
      ALTER TABLE "freight_quotes"
      ADD COLUMN IF NOT EXISTS "inboundMessageId" character varying
    `);
        await queryRunner.query(`
      ALTER TABLE "freight_quotes"
      ADD COLUMN IF NOT EXISTS "receivedAt" TIMESTAMP
    `);
        await queryRunner.query(`
      ALTER TABLE "freight_quotes"
      ADD COLUMN IF NOT EXISTS "comparisonFields" jsonb
    `);
        await queryRunner.query(`
      ALTER TABLE "freight_quotes"
      ADD COLUMN IF NOT EXISTS "reviewStatus" character varying
    `);
        await queryRunner.query(`
      ALTER TABLE "freight_quotes"
      ADD COLUMN IF NOT EXISTS "versionNumber" integer NOT NULL DEFAULT 1
    `);
        await queryRunner.query(`
      ALTER TABLE "freight_quotes"
      ADD COLUMN IF NOT EXISTS "isLatestVersion" boolean NOT NULL DEFAULT true
    `);
        await queryRunner.query(`
      ALTER TABLE "freight_quotes"
      ADD COLUMN IF NOT EXISTS "extractionConfidence" numeric
    `);
        await queryRunner.query(`
      ALTER TABLE "freight_quotes"
      ADD COLUMN IF NOT EXISTS "reviewedByUserId" character varying
    `);
        await queryRunner.query(`
      ALTER TABLE "freight_quotes"
      ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_quote_ignore_rules_mailboxOwnerUserId_priority"
      ON "quote_ignore_rules" ("mailboxOwnerUserId", "priority")
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_quote_ignore_rules_isActive_priority"
      ON "quote_ignore_rules" ("isActive", "priority")
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_quote_inbound_messages_receivedAt"
      ON "quote_inbound_messages" ("receivedAt")
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_quote_inbound_messages_status_receivedAt"
      ON "quote_inbound_messages" ("status", "receivedAt")
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_quote_inbound_messages_matchedInquiryId"
      ON "quote_inbound_messages" ("matchedInquiryId")
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_quote_inbound_messages_matchedRfqId"
      ON "quote_inbound_messages" ("matchedRfqId")
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_quote_inbound_messages_matchedVendorId"
      ON "quote_inbound_messages" ("matchedVendorId")
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_freight_quotes_inboundMessageId"
      ON "freight_quotes" ("inboundMessageId")
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_freight_quotes_rfqId_vendorId_isLatestVersion"
      ON "freight_quotes" ("rfqId", "vendorId", "isLatestVersion")
    `);
    }
    async down(queryRunner) {
        await queryRunner.query('DROP INDEX IF EXISTS "IDX_freight_quotes_rfqId_vendorId_isLatestVersion"');
        await queryRunner.query('DROP INDEX IF EXISTS "IDX_freight_quotes_inboundMessageId"');
        await queryRunner.query('DROP INDEX IF EXISTS "IDX_quote_inbound_messages_matchedVendorId"');
        await queryRunner.query('DROP INDEX IF EXISTS "IDX_quote_inbound_messages_matchedRfqId"');
        await queryRunner.query('DROP INDEX IF EXISTS "IDX_quote_inbound_messages_matchedInquiryId"');
        await queryRunner.query('DROP INDEX IF EXISTS "IDX_quote_inbound_messages_status_receivedAt"');
        await queryRunner.query('DROP INDEX IF EXISTS "IDX_quote_inbound_messages_receivedAt"');
        await queryRunner.query('DROP INDEX IF EXISTS "IDX_quote_ignore_rules_isActive_priority"');
        await queryRunner.query('DROP INDEX IF EXISTS "IDX_quote_ignore_rules_mailboxOwnerUserId_priority"');
        await queryRunner.query(`
      ALTER TABLE "freight_quotes"
      DROP COLUMN IF EXISTS "reviewedAt"
    `);
        await queryRunner.query(`
      ALTER TABLE "freight_quotes"
      DROP COLUMN IF EXISTS "reviewedByUserId"
    `);
        await queryRunner.query(`
      ALTER TABLE "freight_quotes"
      DROP COLUMN IF EXISTS "extractionConfidence"
    `);
        await queryRunner.query(`
      ALTER TABLE "freight_quotes"
      DROP COLUMN IF EXISTS "isLatestVersion"
    `);
        await queryRunner.query(`
      ALTER TABLE "freight_quotes"
      DROP COLUMN IF EXISTS "versionNumber"
    `);
        await queryRunner.query(`
      ALTER TABLE "freight_quotes"
      DROP COLUMN IF EXISTS "reviewStatus"
    `);
        await queryRunner.query(`
      ALTER TABLE "freight_quotes"
      DROP COLUMN IF EXISTS "comparisonFields"
    `);
        await queryRunner.query(`
      ALTER TABLE "freight_quotes"
      DROP COLUMN IF EXISTS "receivedAt"
    `);
        await queryRunner.query(`
      ALTER TABLE "freight_quotes"
      DROP COLUMN IF EXISTS "inboundMessageId"
    `);
        await queryRunner.query('DROP TABLE IF EXISTS "quote_inbound_messages" CASCADE');
        await queryRunner.query('DROP TABLE IF EXISTS "quote_ignore_rules" CASCADE');
        await queryRunner.query('DROP TABLE IF EXISTS "quote_mailbox_scan_states" CASCADE');
    }
}
exports.AppQuoteInboxFoundation2026041810000 = AppQuoteInboxFoundation2026041810000;
//# sourceMappingURL=2026041810000-AppQuoteInboxFoundation.js.map