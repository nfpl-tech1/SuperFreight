"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessDropVendorSchema2026032700900 = void 0;
const migration_helpers_1 = require("../migration-helpers");
const _2026032400400_BusinessVendorMasterPhase1_1 = require("./2026032400400-BusinessVendorMasterPhase1");
const _2026032700800_BusinessVendorLocationSourcing_1 = require("./2026032700800-BusinessVendorLocationSourcing");
class BusinessDropVendorSchema2026032700900 {
    name = 'BusinessDropVendorSchema2026032700900';
    async up(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "import_source_audit"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "vendor_office_service_locations"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "service_location_alias"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "vendor_cc_recipients"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "vendor_contacts"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "vendor_office_ports"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "vendor_office_type_map"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "port_alias"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "service_location_master"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "country_region_map"`);
        await queryRunner.query(`
      DO $$
      BEGIN
        IF to_regclass('public.vendor_master') IS NOT NULL THEN
          ALTER TABLE "vendor_master"
          DROP CONSTRAINT IF EXISTS "FK_vendor_master_primaryOfficeId";
        END IF;
      END
      $$;
    `);
        await queryRunner.query(`DROP TABLE IF EXISTS "vendor_offices"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "vendor_type_master"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "vendor_master"`);
        await queryRunner.query(`
      DO $$
      BEGIN
        IF to_regclass('public.port_master') IS NOT NULL THEN
          ALTER TABLE "port_master"
          DROP CONSTRAINT IF EXISTS "FK_port_master_regionId";
        END IF;
      END
      $$;
    `);
        await queryRunner.query(`DROP TABLE IF EXISTS "port_master"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "region_master"`);
        await (0, migration_helpers_1.dropEnumTypeIfExists)(queryRunner, 'import_source_audit_action_enum');
        await (0, migration_helpers_1.dropEnumTypeIfExists)(queryRunner, 'import_source_audit_entitykind_enum');
        await (0, migration_helpers_1.dropEnumTypeIfExists)(queryRunner, 'service_location_kind_enum');
        await (0, migration_helpers_1.dropEnumTypeIfExists)(queryRunner, 'port_master_portmode_enum');
    }
    async down(queryRunner) {
        const vendorPhase1 = new _2026032400400_BusinessVendorMasterPhase1_1.BusinessVendorMasterPhase12026032400400();
        const vendorLocationSourcing = new _2026032700800_BusinessVendorLocationSourcing_1.BusinessVendorLocationSourcing2026032700800();
        await vendorPhase1.up(queryRunner);
        await vendorLocationSourcing.up(queryRunner);
    }
}
exports.BusinessDropVendorSchema2026032700900 = BusinessDropVendorSchema2026032700900;
//# sourceMappingURL=2026032700900-BusinessDropVendorSchema.js.map