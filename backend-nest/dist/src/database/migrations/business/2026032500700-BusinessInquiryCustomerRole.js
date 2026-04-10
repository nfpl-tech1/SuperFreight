"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessInquiryCustomerRole2026032500700 = void 0;
class BusinessInquiryCustomerRole2026032500700 {
    name = 'BusinessInquiryCustomerRole2026032500700';
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "inquiries"
      ADD COLUMN IF NOT EXISTS "customerRole" character varying
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "inquiries"
      DROP COLUMN IF EXISTS "customerRole"
    `);
    }
}
exports.BusinessInquiryCustomerRole2026032500700 = BusinessInquiryCustomerRole2026032500700;
//# sourceMappingURL=2026032500700-BusinessInquiryCustomerRole.js.map