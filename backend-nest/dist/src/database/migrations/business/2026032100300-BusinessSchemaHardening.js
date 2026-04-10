"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessSchemaHardening2026032100300 = void 0;
const migration_helpers_1 = require("../migration-helpers");
class BusinessSchemaHardening2026032100300 {
    name = 'BusinessSchemaHardening2026032100300';
    async up(queryRunner) {
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_inquiries_createdAt', 'inquiries', '("createdAt")');
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_inquiries_ownerUserId_createdAt', 'inquiries', '("ownerUserId", "createdAt")');
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_inquiries_mailboxOwnerUserId_createdAt', 'inquiries', '("mailboxOwnerUserId", "createdAt")');
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_job_service_parts_jobId', 'job_service_parts', '("jobId")');
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_ownership_assignments_inquiryId_createdAt', 'ownership_assignments', '("inquiryId", "createdAt")');
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_external_thread_refs_inquiryId', 'external_thread_refs', '("inquiryId")');
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_rate_sheets_effectiveMonth_shippingLine', 'rate_sheets', '("effectiveMonth", "shippingLine")');
    }
    async down(queryRunner) {
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_rate_sheets_effectiveMonth_shippingLine');
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_external_thread_refs_inquiryId');
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_ownership_assignments_inquiryId_createdAt');
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_job_service_parts_jobId');
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_inquiries_mailboxOwnerUserId_createdAt');
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_inquiries_ownerUserId_createdAt');
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_inquiries_createdAt');
    }
}
exports.BusinessSchemaHardening2026032100300 = BusinessSchemaHardening2026032100300;
//# sourceMappingURL=2026032100300-BusinessSchemaHardening.js.map