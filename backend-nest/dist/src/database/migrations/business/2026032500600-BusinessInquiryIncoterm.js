"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessInquiryIncoterm2026032500600 = void 0;
class BusinessInquiryIncoterm2026032500600 {
    name = 'BusinessInquiryIncoterm2026032500600';
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "inquiries"
      ADD COLUMN IF NOT EXISTS "incoterm" character varying
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "inquiries"
      DROP COLUMN IF EXISTS "incoterm"
    `);
    }
}
exports.BusinessInquiryIncoterm2026032500600 = BusinessInquiryIncoterm2026032500600;
//# sourceMappingURL=2026032500600-BusinessInquiryIncoterm.js.map