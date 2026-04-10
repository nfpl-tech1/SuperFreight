import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  addUniqueConstraintIfMissing,
  createEnumTypeIfMissing,
  createIndexIfMissing,
  createUuidExtension,
  dropConstraintIfExists,
  dropEnumTypeIfExists,
  dropIndexIfExists,
} from '../migration-helpers';

export class BusinessVendorMasterPhase12026032400400
  implements MigrationInterface
{
  name = 'BusinessVendorMasterPhase12026032400400';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await createUuidExtension(queryRunner);
    await createEnumTypeIfMissing(queryRunner, 'port_master_portmode_enum', [
      'AIRPORT',
      'SEAPORT',
    ]);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "port_master" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "code" character varying NOT NULL,
        "name" character varying NOT NULL,
        "cityName" character varying,
        "stateName" character varying,
        "countryName" character varying NOT NULL,
        "portMode" "port_master_portmode_enum" NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "notes" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_port_master_id" PRIMARY KEY ("id")
      )
    `);

    await addUniqueConstraintIfMissing(
      queryRunner,
      'port_master',
      'UQ_port_master_portMode_code',
      ['portMode', 'code'],
    );

    await createIndexIfMissing(
      queryRunner,
      'IDX_port_master_name',
      'port_master',
      '("name")',
    );
    await createIndexIfMissing(
      queryRunner,
      'IDX_port_master_country_city',
      'port_master',
      '("countryName", "cityName")',
    );
    await createIndexIfMissing(
      queryRunner,
      'IDX_port_master_portMode_isActive',
      'port_master',
      '("portMode", "isActive")',
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "vendor_master" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "companyName" character varying NOT NULL,
        "normalizedName" character varying NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "notes" text,
        "primaryOfficeId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_vendor_master_id" PRIMARY KEY ("id")
      )
    `);

    await addUniqueConstraintIfMissing(
      queryRunner,
      'vendor_master',
      'UQ_vendor_master_normalizedName',
      ['normalizedName'],
    );

    await createIndexIfMissing(
      queryRunner,
      'IDX_vendor_master_companyName',
      'vendor_master',
      '("companyName")',
    );
    await createIndexIfMissing(
      queryRunner,
      'IDX_vendor_master_isActive',
      'vendor_master',
      '("isActive")',
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "vendor_offices" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "vendorId" uuid NOT NULL,
        "officeName" character varying NOT NULL,
        "cityName" character varying,
        "stateName" character varying,
        "countryName" character varying,
        "addressRaw" text,
        "externalCode" character varying,
        "specializationRaw" text,
        "isActive" boolean NOT NULL DEFAULT true,
        "isIataCertified" boolean NOT NULL DEFAULT false,
        "doesSeaFreight" boolean NOT NULL DEFAULT false,
        "doesProjectCargo" boolean NOT NULL DEFAULT false,
        "doesOwnConsolidation" boolean NOT NULL DEFAULT false,
        "doesOwnTransportation" boolean NOT NULL DEFAULT false,
        "doesOwnWarehousing" boolean NOT NULL DEFAULT false,
        "doesOwnCustomClearance" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_vendor_offices_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_vendor_offices_vendorId"
          FOREIGN KEY ("vendorId") REFERENCES "vendor_master"("id")
          ON DELETE CASCADE
      )
    `);

    await addUniqueConstraintIfMissing(
      queryRunner,
      'vendor_offices',
      'UQ_vendor_offices_vendorId_officeName',
      ['vendorId', 'officeName'],
    );

    await createIndexIfMissing(
      queryRunner,
      'IDX_vendor_offices_vendorId',
      'vendor_offices',
      '("vendorId")',
    );
    await createIndexIfMissing(
      queryRunner,
      'IDX_vendor_offices_country_city',
      'vendor_offices',
      '("countryName", "cityName")',
    );
    await createIndexIfMissing(
      queryRunner,
      'IDX_vendor_offices_externalCode',
      'vendor_offices',
      '("externalCode")',
    );
    await createIndexIfMissing(
      queryRunner,
      'IDX_vendor_offices_isActive',
      'vendor_offices',
      '("isActive")',
    );

    await queryRunner.query(`
      ALTER TABLE "vendor_master"
      ADD CONSTRAINT "FK_vendor_master_primaryOfficeId"
      FOREIGN KEY ("primaryOfficeId") REFERENCES "vendor_offices"("id")
      ON DELETE SET NULL
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "vendor_type_master" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "typeCode" character varying NOT NULL,
        "typeName" character varying NOT NULL,
        "description" text,
        "sortOrder" integer NOT NULL DEFAULT 0,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_vendor_type_master_id" PRIMARY KEY ("id")
      )
    `);

    await addUniqueConstraintIfMissing(
      queryRunner,
      'vendor_type_master',
      'UQ_vendor_type_master_typeCode',
      ['typeCode'],
    );

    await createIndexIfMissing(
      queryRunner,
      'IDX_vendor_type_master_sortOrder_isActive',
      'vendor_type_master',
      '("sortOrder", "isActive")',
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "vendor_office_type_map" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "officeId" uuid NOT NULL,
        "vendorTypeId" uuid NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_vendor_office_type_map_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_vendor_office_type_map_officeId"
          FOREIGN KEY ("officeId") REFERENCES "vendor_offices"("id")
          ON DELETE CASCADE,
        CONSTRAINT "FK_vendor_office_type_map_vendorTypeId"
          FOREIGN KEY ("vendorTypeId") REFERENCES "vendor_type_master"("id")
      )
    `);

    await addUniqueConstraintIfMissing(
      queryRunner,
      'vendor_office_type_map',
      'UQ_vendor_office_type_map_officeId_vendorTypeId',
      ['officeId', 'vendorTypeId'],
    );

    await createIndexIfMissing(
      queryRunner,
      'IDX_vendor_office_type_map_vendorTypeId',
      'vendor_office_type_map',
      '("vendorTypeId")',
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "vendor_office_ports" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "officeId" uuid NOT NULL,
        "portId" uuid NOT NULL,
        "isPrimary" boolean NOT NULL DEFAULT false,
        "notes" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_vendor_office_ports_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_vendor_office_ports_officeId"
          FOREIGN KEY ("officeId") REFERENCES "vendor_offices"("id")
          ON DELETE CASCADE,
        CONSTRAINT "FK_vendor_office_ports_portId"
          FOREIGN KEY ("portId") REFERENCES "port_master"("id")
      )
    `);

    await addUniqueConstraintIfMissing(
      queryRunner,
      'vendor_office_ports',
      'UQ_vendor_office_ports_officeId_portId',
      ['officeId', 'portId'],
    );

    await createIndexIfMissing(
      queryRunner,
      'IDX_vendor_office_ports_portId',
      'vendor_office_ports',
      '("portId")',
    );
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_vendor_office_ports_officeId_primary"
      ON "vendor_office_ports" ("officeId")
      WHERE "isPrimary" = true
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "vendor_contacts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "officeId" uuid NOT NULL,
        "contactName" character varying NOT NULL,
        "salutation" character varying,
        "designation" character varying,
        "emailPrimary" character varying,
        "emailSecondary" character varying,
        "mobile1" character varying,
        "mobile2" character varying,
        "landline" character varying,
        "whatsappNumber" character varying,
        "isPrimary" boolean NOT NULL DEFAULT false,
        "isActive" boolean NOT NULL DEFAULT true,
        "notes" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_vendor_contacts_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_vendor_contacts_officeId"
          FOREIGN KEY ("officeId") REFERENCES "vendor_offices"("id")
          ON DELETE CASCADE
      )
    `);

    await createIndexIfMissing(
      queryRunner,
      'IDX_vendor_contacts_officeId',
      'vendor_contacts',
      '("officeId")',
    );
    await createIndexIfMissing(
      queryRunner,
      'IDX_vendor_contacts_emailPrimary',
      'vendor_contacts',
      '("emailPrimary")',
    );
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_vendor_contacts_officeId_primary"
      ON "vendor_contacts" ("officeId")
      WHERE "isPrimary" = true
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "vendor_cc_recipients" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "officeId" uuid NOT NULL,
        "email" character varying NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_vendor_cc_recipients_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_vendor_cc_recipients_officeId"
          FOREIGN KEY ("officeId") REFERENCES "vendor_offices"("id")
          ON DELETE CASCADE
      )
    `);

    await addUniqueConstraintIfMissing(
      queryRunner,
      'vendor_cc_recipients',
      'UQ_vendor_cc_recipients_officeId_email',
      ['officeId', 'email'],
    );

    await createIndexIfMissing(
      queryRunner,
      'IDX_vendor_cc_recipients_officeId',
      'vendor_cc_recipients',
      '("officeId")',
    );

    await queryRunner.query(`
      INSERT INTO "vendor_type_master" ("typeCode", "typeName", "description", "sortOrder")
      VALUES
        ('TRANSPORTER', 'Transporter', 'Domestic transporter contacts imported from local sheets.', 10),
        ('CFS_BUFFER_YARD', 'CFS / Buffer Yard', 'Container freight station and buffer yard operators.', 20),
        ('CHA', 'CHA', 'Custom house agent vendors.', 30),
        ('IATA', 'IATA', 'Air freight / IATA-focused vendor list.', 40),
        ('CO_LOADER', 'Co-Loader', 'Co-loader vendor list.', 50),
        ('CARRIER', 'Carrier', 'Carrier / NVOCC / line contacts.', 60),
        ('SHIPPING_LINE', 'Shipping Line', 'Shipping line master type for future import templates.', 70),
        ('PACKER', 'Packer', 'Packing vendors.', 80),
        ('LICENSING', 'Licensing', 'Licensing-related vendor list.', 90),
        ('WCA_AGENT', 'WCA Agent', 'WCA-sourced international partner offices.', 100)
      ON CONFLICT ("typeCode") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await dropIndexIfExists(
      queryRunner,
      'IDX_vendor_cc_recipients_officeId',
    );
    await dropConstraintIfExists(
      queryRunner,
      'vendor_cc_recipients',
      'UQ_vendor_cc_recipients_officeId_email',
    );
    await queryRunner.query('DROP TABLE IF EXISTS "vendor_cc_recipients"');

    await dropIndexIfExists(
      queryRunner,
      'UQ_vendor_contacts_officeId_primary',
    );
    await dropIndexIfExists(queryRunner, 'IDX_vendor_contacts_emailPrimary');
    await dropIndexIfExists(queryRunner, 'IDX_vendor_contacts_officeId');
    await queryRunner.query('DROP TABLE IF EXISTS "vendor_contacts"');

    await dropIndexIfExists(
      queryRunner,
      'UQ_vendor_office_ports_officeId_primary',
    );
    await dropIndexIfExists(queryRunner, 'IDX_vendor_office_ports_portId');
    await dropConstraintIfExists(
      queryRunner,
      'vendor_office_ports',
      'UQ_vendor_office_ports_officeId_portId',
    );
    await queryRunner.query('DROP TABLE IF EXISTS "vendor_office_ports"');

    await dropIndexIfExists(
      queryRunner,
      'IDX_vendor_office_type_map_vendorTypeId',
    );
    await dropConstraintIfExists(
      queryRunner,
      'vendor_office_type_map',
      'UQ_vendor_office_type_map_officeId_vendorTypeId',
    );
    await queryRunner.query('DROP TABLE IF EXISTS "vendor_office_type_map"');

    await dropIndexIfExists(
      queryRunner,
      'IDX_vendor_type_master_sortOrder_isActive',
    );
    await dropConstraintIfExists(
      queryRunner,
      'vendor_type_master',
      'UQ_vendor_type_master_typeCode',
    );
    await queryRunner.query('DROP TABLE IF EXISTS "vendor_type_master"');

    await dropConstraintIfExists(
      queryRunner,
      'vendor_master',
      'FK_vendor_master_primaryOfficeId',
    );

    await dropIndexIfExists(queryRunner, 'IDX_vendor_offices_isActive');
    await dropIndexIfExists(queryRunner, 'IDX_vendor_offices_externalCode');
    await dropIndexIfExists(queryRunner, 'IDX_vendor_offices_country_city');
    await dropIndexIfExists(queryRunner, 'IDX_vendor_offices_vendorId');
    await dropConstraintIfExists(
      queryRunner,
      'vendor_offices',
      'UQ_vendor_offices_vendorId_officeName',
    );
    await queryRunner.query('DROP TABLE IF EXISTS "vendor_offices"');

    await dropIndexIfExists(queryRunner, 'IDX_vendor_master_isActive');
    await dropIndexIfExists(queryRunner, 'IDX_vendor_master_companyName');
    await dropConstraintIfExists(
      queryRunner,
      'vendor_master',
      'UQ_vendor_master_normalizedName',
    );
    await queryRunner.query('DROP TABLE IF EXISTS "vendor_master"');

    await dropIndexIfExists(
      queryRunner,
      'IDX_port_master_portMode_isActive',
    );
    await dropIndexIfExists(queryRunner, 'IDX_port_master_country_city');
    await dropIndexIfExists(queryRunner, 'IDX_port_master_name');
    await dropConstraintIfExists(
      queryRunner,
      'port_master',
      'UQ_port_master_portMode_code',
    );
    await queryRunner.query('DROP TABLE IF EXISTS "port_master"');

    await dropEnumTypeIfExists(queryRunner, 'port_master_portmode_enum');
  }
}
