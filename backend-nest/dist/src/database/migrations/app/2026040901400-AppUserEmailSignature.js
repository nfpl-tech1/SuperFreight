"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppUserEmailSignature2026040901400 = void 0;
class AppUserEmailSignature2026040901400 {
    name = 'AppUserEmailSignature2026040901400';
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "emailSignature" text NULL
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "emailSignature"
    `);
    }
}
exports.AppUserEmailSignature2026040901400 = AppUserEmailSignature2026040901400;
//# sourceMappingURL=2026040901400-AppUserEmailSignature.js.map