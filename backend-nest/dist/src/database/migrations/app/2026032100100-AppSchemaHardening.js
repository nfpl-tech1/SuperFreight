"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppSchemaHardening2026032100100 = void 0;
const migration_helpers_1 = require("../migration-helpers");
class AppSchemaHardening2026032100100 {
    name = 'AppSchemaHardening2026032100100';
    async up(queryRunner) {
        await (0, migration_helpers_1.addUniqueConstraintIfMissing)(queryRunner, 'user_departments', 'UQ_user_departments_userId_department', ['userId', 'department']);
        await (0, migration_helpers_1.addUniqueConstraintIfMissing)(queryRunner, 'user_role_assignments', 'UQ_user_role_assignments_userId_roleId', ['userId', 'roleId']);
        await (0, migration_helpers_1.addUniqueConstraintIfMissing)(queryRunner, 'role_permissions', 'UQ_role_permissions_roleId_moduleKey', ['roleId', 'moduleKey']);
        await (0, migration_helpers_1.addUniqueConstraintIfMissing)(queryRunner, 'role_scope_rules', 'UQ_role_scope_rules_roleId_scopeType_scopeValue', ['roleId', 'scopeType', 'scopeValue']);
        await (0, migration_helpers_1.addUniqueConstraintIfMissing)(queryRunner, 'rfq_field_specs', 'UQ_rfq_field_specs_rfqId_fieldKey', ['rfqId', 'fieldKey']);
        await (0, migration_helpers_1.addUniqueConstraintIfMissing)(queryRunner, 'outlook_subscriptions', 'UQ_outlook_subscriptions_userId', ['userId']);
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_user_departments_userId', 'user_departments', '("userId")');
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_user_role_assignments_userId', 'user_role_assignments', '("userId")');
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_user_role_assignments_roleId', 'user_role_assignments', '("roleId")');
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_role_permissions_roleId', 'role_permissions', '("roleId")');
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_role_scope_rules_roleId', 'role_scope_rules', '("roleId")');
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_rfq_field_specs_rfqId', 'rfq_field_specs', '("rfqId")');
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_freight_quotes_createdAt', 'freight_quotes', '("createdAt")');
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_freight_quotes_inquiryId_createdAt', 'freight_quotes', '("inquiryId", "createdAt")');
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_freight_quotes_rfqId', 'freight_quotes', '("rfqId")');
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_freight_quotes_vendorId', 'freight_quotes', '("vendorId")');
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_customer_drafts_createdAt', 'customer_drafts', '("createdAt")');
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_customer_drafts_inquiryId', 'customer_drafts', '("inquiryId")');
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_customer_drafts_quoteId', 'customer_drafts', '("quoteId")');
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_customer_drafts_generatedByUserId', 'customer_drafts', '("generatedByUserId")');
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_rfqs_createdAt', 'rfqs', '("createdAt")');
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_rfqs_inquiryId', 'rfqs', '("inquiryId")');
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_rfqs_createdByUserId', 'rfqs', '("createdByUserId")');
    }
    async down(queryRunner) {
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_rfqs_createdByUserId');
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_rfqs_inquiryId');
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_rfqs_createdAt');
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_customer_drafts_generatedByUserId');
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_customer_drafts_quoteId');
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_customer_drafts_inquiryId');
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_customer_drafts_createdAt');
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_freight_quotes_vendorId');
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_freight_quotes_rfqId');
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_freight_quotes_inquiryId_createdAt');
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_freight_quotes_createdAt');
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_rfq_field_specs_rfqId');
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_role_scope_rules_roleId');
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_role_permissions_roleId');
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_user_role_assignments_roleId');
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_user_role_assignments_userId');
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_user_departments_userId');
        await (0, migration_helpers_1.dropConstraintIfExists)(queryRunner, 'outlook_subscriptions', 'UQ_outlook_subscriptions_userId');
        await (0, migration_helpers_1.dropConstraintIfExists)(queryRunner, 'rfq_field_specs', 'UQ_rfq_field_specs_rfqId_fieldKey');
        await (0, migration_helpers_1.dropConstraintIfExists)(queryRunner, 'role_scope_rules', 'UQ_role_scope_rules_roleId_scopeType_scopeValue');
        await (0, migration_helpers_1.dropConstraintIfExists)(queryRunner, 'role_permissions', 'UQ_role_permissions_roleId_moduleKey');
        await (0, migration_helpers_1.dropConstraintIfExists)(queryRunner, 'user_role_assignments', 'UQ_user_role_assignments_userId_roleId');
        await (0, migration_helpers_1.dropConstraintIfExists)(queryRunner, 'user_departments', 'UQ_user_departments_userId_department');
    }
}
exports.AppSchemaHardening2026032100100 = AppSchemaHardening2026032100100;
//# sourceMappingURL=2026032100100-AppSchemaHardening.js.map