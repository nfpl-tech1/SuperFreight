"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessVendorLocationSourcing2026032700800 = void 0;
const migration_helpers_1 = require("../migration-helpers");
class BusinessVendorLocationSourcing2026032700800 {
    name = 'BusinessVendorLocationSourcing2026032700800';
    async up(queryRunner) {
        await (0, migration_helpers_1.createUuidExtension)(queryRunner);
        await (0, migration_helpers_1.createEnumTypeIfMissing)(queryRunner, 'service_location_kind_enum', [
            'INLAND_CITY',
            'ICD',
            'CFS',
            'WAREHOUSE_ZONE',
            'CUSTOMS_NODE',
            'AIR_CARGO_AREA',
            'UNKNOWN',
        ]);
        await (0, migration_helpers_1.createEnumTypeIfMissing)(queryRunner, 'import_source_audit_entitykind_enum', [
            'VENDOR',
            'OFFICE',
            'PORT',
            'SERVICE_LOCATION',
            'PORT_LINK',
            'SERVICE_LOCATION_LINK',
            'CONTACT',
        ]);
        await (0, migration_helpers_1.createEnumTypeIfMissing)(queryRunner, 'import_source_audit_action_enum', ['CREATED', 'UPDATED', 'SKIPPED', 'REVIEW_REQUIRED']);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "region_master" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "sectorName" character varying NOT NULL,
        "normalizedSectorName" character varying NOT NULL,
        "displayName" character varying NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_region_master_id" PRIMARY KEY ("id")
      )
    `);
        await (0, migration_helpers_1.addUniqueConstraintIfMissing)(queryRunner, 'region_master', 'UQ_region_master_normalizedSectorName', ['normalizedSectorName']);
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_region_master_isActive', 'region_master', '("isActive")');
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "country_region_map" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "countryName" character varying NOT NULL,
        "normalizedCountryName" character varying NOT NULL,
        "regionId" uuid NOT NULL,
        "sourceWorkbook" character varying,
        "sourceSheet" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_country_region_map_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_country_region_map_regionId"
          FOREIGN KEY ("regionId") REFERENCES "region_master"("id")
          ON DELETE CASCADE
      )
    `);
        await (0, migration_helpers_1.addUniqueConstraintIfMissing)(queryRunner, 'country_region_map', 'UQ_country_region_map_normalizedCountryName_regionId', ['normalizedCountryName', 'regionId']);
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_country_region_map_regionId', 'country_region_map', '("regionId")');
        await queryRunner.query(`
      ALTER TABLE "port_master"
      ADD COLUMN IF NOT EXISTS "normalizedName" character varying
    `);
        await queryRunner.query(`
      ALTER TABLE "port_master"
      ADD COLUMN IF NOT EXISTS "normalizedCityName" character varying
    `);
        await queryRunner.query(`
      ALTER TABLE "port_master"
      ADD COLUMN IF NOT EXISTS "normalizedCountryName" character varying
    `);
        await queryRunner.query(`
      ALTER TABLE "port_master"
      ADD COLUMN IF NOT EXISTS "regionId" uuid
    `);
        await queryRunner.query(`
      ALTER TABLE "port_master"
      ADD COLUMN IF NOT EXISTS "unlocode" character varying
    `);
        await queryRunner.query(`
      ALTER TABLE "port_master"
      ADD COLUMN IF NOT EXISTS "sourceConfidence" character varying
    `);
        await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'FK_port_master_regionId'
            AND conrelid = to_regclass('public.port_master')
        ) THEN
          ALTER TABLE "port_master"
          ADD CONSTRAINT "FK_port_master_regionId"
          FOREIGN KEY ("regionId") REFERENCES "region_master"("id")
          ON DELETE SET NULL;
        END IF;
      END
      $$;
    `);
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_port_master_mode_country_name', 'port_master', '("portMode", "normalizedCountryName", "normalizedName")');
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_port_master_normalizedCityName', 'port_master', '("normalizedCityName")');
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_port_master_regionId', 'port_master', '("regionId")');
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "port_alias" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "portId" uuid NOT NULL,
        "alias" character varying NOT NULL,
        "normalizedAlias" character varying NOT NULL,
        "countryName" character varying,
        "portMode" "port_master_portmode_enum",
        "isPrimary" boolean NOT NULL DEFAULT false,
        "sourceWorkbook" character varying,
        "sourceSheet" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_port_alias_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_port_alias_portId"
          FOREIGN KEY ("portId") REFERENCES "port_master"("id")
          ON DELETE CASCADE
      )
    `);
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_port_alias_portId', 'port_alias', '("portId")');
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_port_alias_normalizedAlias_countryName_portMode', 'port_alias', '("normalizedAlias", "countryName", "portMode")');
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "service_location_master" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "normalizedName" character varying NOT NULL,
        "cityName" character varying,
        "normalizedCityName" character varying,
        "stateName" character varying,
        "countryName" character varying NOT NULL,
        "normalizedCountryName" character varying NOT NULL,
        "locationKind" "service_location_kind_enum" NOT NULL,
        "regionId" uuid,
        "isActive" boolean NOT NULL DEFAULT true,
        "notes" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_service_location_master_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_service_location_master_regionId"
          FOREIGN KEY ("regionId") REFERENCES "region_master"("id")
          ON DELETE SET NULL
      )
    `);
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_service_location_master_kind_country_name', 'service_location_master', '("locationKind", "normalizedCountryName", "normalizedName")');
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_service_location_master_city', 'service_location_master', '("normalizedCityName")');
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_service_location_master_regionId', 'service_location_master', '("regionId")');
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "service_location_alias" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "serviceLocationId" uuid NOT NULL,
        "alias" character varying NOT NULL,
        "normalizedAlias" character varying NOT NULL,
        "countryName" character varying,
        "locationKind" "service_location_kind_enum",
        "isPrimary" boolean NOT NULL DEFAULT false,
        "sourceWorkbook" character varying,
        "sourceSheet" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_service_location_alias_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_service_location_alias_serviceLocationId"
          FOREIGN KEY ("serviceLocationId") REFERENCES "service_location_master"("id")
          ON DELETE CASCADE
      )
    `);
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_service_location_alias_serviceLocationId', 'service_location_alias', '("serviceLocationId")');
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_service_location_alias_normalizedAlias_country_kind', 'service_location_alias', '("normalizedAlias", "countryName", "locationKind")');
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "vendor_office_service_locations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "officeId" uuid NOT NULL,
        "serviceLocationId" uuid NOT NULL,
        "isPrimary" boolean NOT NULL DEFAULT false,
        "notes" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_vendor_office_service_locations_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_vendor_office_service_locations_officeId"
          FOREIGN KEY ("officeId") REFERENCES "vendor_offices"("id")
          ON DELETE CASCADE,
        CONSTRAINT "FK_vendor_office_service_locations_serviceLocationId"
          FOREIGN KEY ("serviceLocationId") REFERENCES "service_location_master"("id")
          ON DELETE CASCADE
      )
    `);
        await (0, migration_helpers_1.addUniqueConstraintIfMissing)(queryRunner, 'vendor_office_service_locations', 'UQ_vendor_office_service_locations_officeId_serviceLocationId', ['officeId', 'serviceLocationId']);
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_vendor_office_service_locations_serviceLocationId', 'vendor_office_service_locations', '("serviceLocationId")');
        await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_vendor_office_service_locations_officeId_primary"
      ON "vendor_office_service_locations" ("officeId")
      WHERE "isPrimary" = true
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "import_source_audit" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "sourceWorkbook" character varying NOT NULL,
        "sourceSheet" character varying NOT NULL,
        "sourceRowNumber" integer NOT NULL,
        "entityKind" "import_source_audit_entitykind_enum" NOT NULL,
        "action" "import_source_audit_action_enum" NOT NULL,
        "confidence" character varying,
        "normalizedKey" character varying,
        "vendorId" uuid,
        "officeId" uuid,
        "portId" uuid,
        "serviceLocationId" uuid,
        "reason" text,
        "rawPayloadJson" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_import_source_audit_id" PRIMARY KEY ("id")
      )
    `);
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_import_source_audit_source', 'import_source_audit', '("sourceWorkbook", "sourceSheet", "sourceRowNumber")');
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_import_source_audit_entity', 'import_source_audit', '("entityKind", "action")');
    }
    async down(queryRunner) {
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_import_source_audit_entity');
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_import_source_audit_source');
        await queryRunner.query(`DROP TABLE IF EXISTS "import_source_audit"`);
        await queryRunner.query(`
      DROP INDEX IF EXISTS "UQ_vendor_office_service_locations_officeId_primary"
    `);
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_vendor_office_service_locations_serviceLocationId');
        await (0, migration_helpers_1.dropConstraintIfExists)(queryRunner, 'vendor_office_service_locations', 'UQ_vendor_office_service_locations_officeId_serviceLocationId');
        await queryRunner.query(`DROP TABLE IF EXISTS "vendor_office_service_locations"`);
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_service_location_alias_normalizedAlias_country_kind');
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_service_location_alias_serviceLocationId');
        await queryRunner.query(`DROP TABLE IF EXISTS "service_location_alias"`);
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_service_location_master_regionId');
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_service_location_master_city');
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_service_location_master_kind_country_name');
        await queryRunner.query(`DROP TABLE IF EXISTS "service_location_master"`);
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_port_alias_normalizedAlias_countryName_portMode');
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_port_alias_portId');
        await queryRunner.query(`DROP TABLE IF EXISTS "port_alias"`);
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_port_master_regionId');
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_port_master_normalizedCityName');
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_port_master_mode_country_name');
        await queryRunner.query(`
      ALTER TABLE "port_master"
      DROP CONSTRAINT IF EXISTS "FK_port_master_regionId"
    `);
        await queryRunner.query(`
      ALTER TABLE "port_master"
      DROP COLUMN IF EXISTS "sourceConfidence"
    `);
        await queryRunner.query(`
      ALTER TABLE "port_master"
      DROP COLUMN IF EXISTS "unlocode"
    `);
        await queryRunner.query(`
      ALTER TABLE "port_master"
      DROP COLUMN IF EXISTS "regionId"
    `);
        await queryRunner.query(`
      ALTER TABLE "port_master"
      DROP COLUMN IF EXISTS "normalizedCountryName"
    `);
        await queryRunner.query(`
      ALTER TABLE "port_master"
      DROP COLUMN IF EXISTS "normalizedCityName"
    `);
        await queryRunner.query(`
      ALTER TABLE "port_master"
      DROP COLUMN IF EXISTS "normalizedName"
    `);
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_country_region_map_regionId');
        await (0, migration_helpers_1.dropConstraintIfExists)(queryRunner, 'country_region_map', 'UQ_country_region_map_normalizedCountryName_regionId');
        await queryRunner.query(`DROP TABLE IF EXISTS "country_region_map"`);
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_region_master_isActive');
        await (0, migration_helpers_1.dropConstraintIfExists)(queryRunner, 'region_master', 'UQ_region_master_normalizedSectorName');
        await queryRunner.query(`DROP TABLE IF EXISTS "region_master"`);
        await (0, migration_helpers_1.dropEnumTypeIfExists)(queryRunner, 'import_source_audit_action_enum');
        await (0, migration_helpers_1.dropEnumTypeIfExists)(queryRunner, 'import_source_audit_entitykind_enum');
        await (0, migration_helpers_1.dropEnumTypeIfExists)(queryRunner, 'service_location_kind_enum');
    }
}
exports.BusinessVendorLocationSourcing2026032700800 = BusinessVendorLocationSourcing2026032700800;
//# sourceMappingURL=2026032700800-BusinessVendorLocationSourcing.js.map