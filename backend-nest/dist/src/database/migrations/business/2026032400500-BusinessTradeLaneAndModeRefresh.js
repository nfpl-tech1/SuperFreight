"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessTradeLaneAndModeRefresh2026032400500 = void 0;
class BusinessTradeLaneAndModeRefresh2026032400500 {
    name = 'BusinessTradeLaneAndModeRefresh2026032400500';
    async up(queryRunner) {
        if ((await queryRunner.hasColumn('inquiries', 'tradeDirection')) &&
            !(await queryRunner.hasColumn('inquiries', 'tradeLane'))) {
            await queryRunner.renameColumn('inquiries', 'tradeDirection', 'tradeLane');
        }
        if ((await queryRunner.hasColumn('jobs', 'tradeDirection')) &&
            !(await queryRunner.hasColumn('jobs', 'tradeLane'))) {
            await queryRunner.renameColumn('jobs', 'tradeDirection', 'tradeLane');
        }
        if ((await queryRunner.hasColumn('rate_sheets', 'route')) &&
            !(await queryRunner.hasColumn('rate_sheets', 'tradeLane'))) {
            await queryRunner.renameColumn('rate_sheets', 'route', 'tradeLane');
        }
        await queryRunner.query(`
      UPDATE "inquiries"
      SET "tradeLane" = CASE "tradeLane"
        WHEN 'EXPORT' THEN 'Export'
        WHEN 'IMPORT' THEN 'Import'
        WHEN 'CROSS_TRADE' THEN 'Cross Trade'
        ELSE "tradeLane"
      END
      WHERE "tradeLane" IS NOT NULL
    `);
        await queryRunner.query(`
      UPDATE "jobs"
      SET "tradeLane" = CASE "tradeLane"
        WHEN 'EXPORT' THEN 'Export'
        WHEN 'IMPORT' THEN 'Import'
        WHEN 'CROSS_TRADE' THEN 'Cross Trade'
        ELSE "tradeLane"
      END
      WHERE "tradeLane" IS NOT NULL
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      UPDATE "jobs"
      SET "tradeLane" = CASE "tradeLane"
        WHEN 'Export' THEN 'EXPORT'
        WHEN 'Import' THEN 'IMPORT'
        WHEN 'Cross Trade' THEN 'CROSS_TRADE'
        ELSE "tradeLane"
      END
      WHERE "tradeLane" IS NOT NULL
    `);
        await queryRunner.query(`
      UPDATE "inquiries"
      SET "tradeLane" = CASE "tradeLane"
        WHEN 'Export' THEN 'EXPORT'
        WHEN 'Import' THEN 'IMPORT'
        WHEN 'Cross Trade' THEN 'CROSS_TRADE'
        ELSE "tradeLane"
      END
      WHERE "tradeLane" IS NOT NULL
    `);
        if ((await queryRunner.hasColumn('rate_sheets', 'tradeLane')) &&
            !(await queryRunner.hasColumn('rate_sheets', 'route'))) {
            await queryRunner.renameColumn('rate_sheets', 'tradeLane', 'route');
        }
        if ((await queryRunner.hasColumn('jobs', 'tradeLane')) &&
            !(await queryRunner.hasColumn('jobs', 'tradeDirection'))) {
            await queryRunner.renameColumn('jobs', 'tradeLane', 'tradeDirection');
        }
        if ((await queryRunner.hasColumn('inquiries', 'tradeLane')) &&
            !(await queryRunner.hasColumn('inquiries', 'tradeDirection'))) {
            await queryRunner.renameColumn('inquiries', 'tradeLane', 'tradeDirection');
        }
    }
}
exports.BusinessTradeLaneAndModeRefresh2026032400500 = BusinessTradeLaneAndModeRefresh2026032400500;
//# sourceMappingURL=2026032400500-BusinessTradeLaneAndModeRefresh.js.map