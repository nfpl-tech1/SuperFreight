"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessSyntheticLocationReconciliation2026041009000 = void 0;
const SOURCE_WORKBOOK = 'Phase 1 Vendor Port Curation';
const PORT_SOURCE_SHEET = 'Manual Port Aliases';
const SERVICE_LOCATION_SOURCE_SHEET = 'Manual Service Location Aliases';
const SYNTHETIC_SERVICE_LOCATION_MAPPINGS = [
    {
        syntheticCode: 'SEA-0119',
        canonicalName: 'Johannesburg',
        countryName: 'South Africa',
        locationKind: 'INLAND_CITY',
        aliases: ['ZAJNB'],
        notes: 'Curated inland-city replacement for SEA-0119. Cross-checked against OG DB carrier coverage; UN/LOCODE reference ZAJNB.',
    },
    {
        syntheticCode: 'SEA-0244',
        canonicalName: 'Kamalapur/Dhaka',
        countryName: 'Bangladesh',
        locationKind: 'ICD',
        aliases: ['ICD Dhaka', 'Icd Dhaka', 'Icd Dhaka/Kamalapur', 'BDKAM'],
        notes: 'Curated ICD replacement for SEA-0244. Cross-checked against OG DB carrier coverage; UN/LOCODE reference BDKAM.',
    },
    {
        syntheticCode: 'SEA-0064',
        canonicalName: 'Yunfu',
        countryName: 'China',
        locationKind: 'INLAND_CITY',
        aliases: ['Yunfu, Guangdong', 'CNYUF'],
        notes: 'Curated inland-city replacement for SEA-0064. Cross-checked against OG DB carrier coverage; UN/LOCODE reference CNYUF.',
    },
];
const SYNTHETIC_SEAPORT_SPLIT_MAPPINGS = [
    {
        syntheticCode: 'SEA-0168',
        targets: [
            {
                code: 'CVMIN',
                name: '(CVMIN) Mindelo',
                cityName: 'Mindelo',
                countryName: 'Cape Verde',
                aliases: ['Mindelo/Praia'],
            },
            {
                code: 'CVRAI',
                name: '(CVRAI) Praia',
                cityName: 'Praia',
                countryName: 'Cape Verde',
                aliases: ['Mindelo/Praia'],
            },
        ],
        notes: 'Curated seaport split for a composite carrier-coverage label from OG DB.',
    },
    {
        syntheticCode: 'SEA-0217',
        targets: [
            {
                code: 'CAMTR',
                name: '(CAMTR) Montreal',
                cityName: 'Montreal',
                countryName: 'Canada',
                aliases: ['Montreal / Halifax'],
            },
            {
                code: 'CAHAL',
                name: '(CAHAL) Halifax',
                cityName: 'Halifax',
                countryName: 'Canada',
                aliases: ['Montreal / Halifax'],
            },
        ],
        notes: 'Curated seaport split for a composite carrier-coverage label from OG DB.',
    },
];
function normalizeTextKey(value) {
    return (value ?? '')
        .replace(/\u00a0/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toUpperCase()
        .replace(/&/g, ' AND ')
        .replace(/[^A-Z0-9]+/g, ' ')
        .trim();
}
function appendNote(current, note) {
    if (!current) {
        return note;
    }
    return current.includes(note) ? current : `${current}\n${note}`;
}
async function findPortByCode(queryRunner, code, portMode) {
    const rows = (await queryRunner.query(`
      SELECT "id", "code", "name", "cityName", "countryName", "portMode", "isActive", "notes"
      FROM "port_master"
      WHERE "code" = $1
        ${portMode ? 'AND "portMode" = $2' : ''}
      LIMIT 1
    `, portMode ? [code, portMode] : [code]));
    return rows[0] ?? null;
}
async function ensurePortAlias(queryRunner, port, aliasValue, sourceSheet) {
    const normalizedAlias = normalizeTextKey(aliasValue);
    if (!normalizedAlias) {
        return;
    }
    const existing = await queryRunner.query(`
      SELECT "id"
      FROM "port_alias"
      WHERE "portId" = $1
        AND "normalizedAlias" = $2
        AND "countryName" = $3
        AND "portMode" = $4::"port_master_portmode_enum"
      LIMIT 1
    `, [port.id, normalizedAlias, port.countryName, port.portMode]);
    if (existing.length > 0) {
        return;
    }
    await queryRunner.query(`
      INSERT INTO "port_alias" (
        "id", "portId", "alias", "normalizedAlias", "countryName",
        "portMode", "isPrimary", "sourceWorkbook", "sourceSheet",
        "createdAt", "updatedAt"
      )
      VALUES (
        uuid_generate_v4(), $1, $2, $3, $4,
        $5::"port_master_portmode_enum", $6, $7, $8,
        now(), now()
      )
    `, [
        port.id,
        aliasValue,
        normalizedAlias,
        port.countryName,
        port.portMode,
        normalizedAlias === normalizeTextKey(port.name),
        SOURCE_WORKBOOK,
        sourceSheet,
    ]);
}
async function ensureServiceLocationAlias(queryRunner, serviceLocation, aliasValue) {
    const normalizedAlias = normalizeTextKey(aliasValue);
    if (!normalizedAlias) {
        return;
    }
    const existing = await queryRunner.query(`
      SELECT "id"
      FROM "service_location_alias"
      WHERE "serviceLocationId" = $1
        AND "normalizedAlias" = $2
        AND "countryName" = $3
        AND "locationKind" = $4::"service_location_kind_enum"
      LIMIT 1
    `, [
        serviceLocation.id,
        normalizedAlias,
        serviceLocation.countryName,
        serviceLocation.locationKind,
    ]);
    if (existing.length > 0) {
        return;
    }
    await queryRunner.query(`
      INSERT INTO "service_location_alias" (
        "id", "serviceLocationId", "alias", "normalizedAlias", "countryName",
        "locationKind", "isPrimary", "sourceWorkbook", "sourceSheet",
        "createdAt", "updatedAt"
      )
      VALUES (
        uuid_generate_v4(), $1, $2, $3, $4,
        $5::"service_location_kind_enum", $6, $7, $8,
        now(), now()
      )
    `, [
        serviceLocation.id,
        aliasValue,
        normalizedAlias,
        serviceLocation.countryName,
        serviceLocation.locationKind,
        normalizedAlias === normalizeTextKey(serviceLocation.name),
        SOURCE_WORKBOOK,
        SERVICE_LOCATION_SOURCE_SHEET,
    ]);
}
async function ensureServiceLocation(queryRunner, mapping) {
    const normalizedName = normalizeTextKey(mapping.canonicalName);
    const normalizedCountryName = normalizeTextKey(mapping.countryName);
    const existingRows = (await queryRunner.query(`
      SELECT "id", "name", "countryName", "locationKind", "notes"
      FROM "service_location_master"
      WHERE "normalizedName" = $1
        AND "normalizedCountryName" = $2
        AND "locationKind" = $3::"service_location_kind_enum"
      LIMIT 1
    `, [normalizedName, normalizedCountryName, mapping.locationKind]));
    if (existingRows.length === 0) {
        const inserted = (await queryRunner.query(`
        INSERT INTO "service_location_master" (
          "id", "name", "normalizedName", "cityName", "normalizedCityName",
          "stateName", "countryName", "normalizedCountryName", "locationKind",
          "regionId", "isActive", "notes", "createdAt", "updatedAt"
        )
        VALUES (
          uuid_generate_v4(), $1, $2, $3, $4,
          NULL, $5, $6, $7::"service_location_kind_enum",
          NULL, true, $8, now(), now()
        )
        RETURNING "id", "name", "countryName", "locationKind", "notes"
      `, [
            mapping.canonicalName,
            normalizedName,
            mapping.canonicalName,
            normalizedName,
            mapping.countryName,
            normalizedCountryName,
            mapping.locationKind,
            mapping.notes,
        ]));
        return inserted[0];
    }
    const existing = existingRows[0];
    await queryRunner.query(`
      UPDATE "service_location_master"
      SET "isActive" = true,
          "notes" = $2,
          "updatedAt" = now()
      WHERE "id" = $1
    `, [existing.id, appendNote(existing.notes, mapping.notes)]);
    return {
        ...existing,
        notes: appendNote(existing.notes, mapping.notes),
    };
}
async function ensureCanonicalPort(queryRunner, target, notes) {
    const normalizedName = normalizeTextKey(target.name);
    const normalizedCityName = normalizeTextKey(target.cityName);
    const normalizedCountryName = normalizeTextKey(target.countryName);
    const existing = await findPortByCode(queryRunner, target.code, 'SEAPORT');
    if (!existing) {
        const inserted = (await queryRunner.query(`
        INSERT INTO "port_master" (
          "id", "code", "name", "normalizedName", "cityName", "normalizedCityName",
          "stateName", "countryName", "normalizedCountryName", "portMode",
          "regionId", "unlocode", "sourceConfidence", "isActive", "notes",
          "createdAt", "updatedAt"
        )
        VALUES (
          uuid_generate_v4(), $1, $2, $3, $4, $5,
          NULL, $6, $7, 'SEAPORT'::"port_master_portmode_enum",
          NULL, $8, 'MASTER', true, $9,
          now(), now()
        )
        RETURNING "id", "code", "name", "cityName", "countryName", "portMode", "isActive", "notes"
      `, [
            target.code,
            target.name,
            normalizedName,
            target.cityName,
            normalizedCityName,
            target.countryName,
            normalizedCountryName,
            target.code,
            notes,
        ]));
        return inserted[0];
    }
    const nextNotes = appendNote(existing.notes, notes);
    await queryRunner.query(`
      UPDATE "port_master"
      SET "name" = $2,
          "normalizedName" = $3,
          "cityName" = $4,
          "normalizedCityName" = $5,
          "countryName" = $6,
          "normalizedCountryName" = $7,
          "unlocode" = $8,
          "sourceConfidence" = 'MASTER',
          "isActive" = true,
          "notes" = $9,
          "updatedAt" = now()
      WHERE "id" = $1
    `, [
        existing.id,
        target.name,
        normalizedName,
        target.cityName,
        normalizedCityName,
        target.countryName,
        normalizedCountryName,
        target.code,
        nextNotes,
    ]);
    return {
        ...existing,
        name: target.name,
        cityName: target.cityName,
        countryName: target.countryName,
        isActive: true,
        notes: nextNotes,
    };
}
async function migrateSyntheticPortToServiceLocation(queryRunner, mapping) {
    const syntheticPort = await findPortByCode(queryRunner, mapping.syntheticCode);
    if (!syntheticPort) {
        return;
    }
    const serviceLocation = await ensureServiceLocation(queryRunner, mapping);
    const syntheticAliases = (await queryRunner.query(`
      SELECT "alias"
      FROM "port_alias"
      WHERE "portId" = $1
    `, [syntheticPort.id]));
    const officeLinks = (await queryRunner.query(`
      SELECT "id", "officeId"
      FROM "vendor_office_ports"
      WHERE "portId" = $1
    `, [syntheticPort.id]));
    const aliasValues = new Set([
        syntheticPort.name,
        syntheticPort.cityName ?? '',
        ...mapping.aliases,
        ...syntheticAliases.map((alias) => alias.alias),
    ]);
    for (const aliasValue of aliasValues) {
        if (aliasValue) {
            await ensureServiceLocationAlias(queryRunner, serviceLocation, aliasValue);
        }
    }
    for (const officeLink of officeLinks) {
        const existing = await queryRunner.query(`
        SELECT "id"
        FROM "vendor_office_service_locations"
        WHERE "officeId" = $1
          AND "serviceLocationId" = $2
        LIMIT 1
      `, [officeLink.officeId, serviceLocation.id]);
        if (existing.length === 0) {
            await queryRunner.query(`
          INSERT INTO "vendor_office_service_locations" (
            "id", "officeId", "serviceLocationId", "isPrimary", "notes", "createdAt", "updatedAt"
          )
          VALUES (
            uuid_generate_v4(), $1, $2, false, $3, now(), now()
          )
        `, [
                officeLink.officeId,
                serviceLocation.id,
                `Migrated from synthetic port ${mapping.syntheticCode}.`,
            ]);
        }
    }
    await queryRunner.query(`DELETE FROM "vendor_office_ports" WHERE "portId" = $1`, [syntheticPort.id]);
    await queryRunner.query(`DELETE FROM "port_alias" WHERE "portId" = $1`, [syntheticPort.id]);
    await queryRunner.query(`
      UPDATE "port_master"
      SET "isActive" = false,
          "notes" = $2,
          "updatedAt" = now()
      WHERE "id" = $1
    `, [
        syntheticPort.id,
        appendNote(syntheticPort.notes, `Migrated to service location ${serviceLocation.name} during synthetic location reconciliation.`),
    ]);
}
async function splitSyntheticPort(queryRunner, mapping) {
    const syntheticPort = await findPortByCode(queryRunner, mapping.syntheticCode, 'SEAPORT');
    if (!syntheticPort) {
        return;
    }
    const canonicalPorts = [];
    for (const target of mapping.targets) {
        const canonicalPort = await ensureCanonicalPort(queryRunner, target, mapping.notes);
        canonicalPorts.push(canonicalPort);
        const aliases = new Set([target.cityName, ...(target.aliases ?? [])]);
        for (const aliasValue of aliases) {
            await ensurePortAlias(queryRunner, canonicalPort, aliasValue, PORT_SOURCE_SHEET);
        }
    }
    const syntheticAliases = (await queryRunner.query(`
      SELECT "alias"
      FROM "port_alias"
      WHERE "portId" = $1
    `, [syntheticPort.id]));
    const officeLinks = (await queryRunner.query(`
      SELECT "id", "officeId"
      FROM "vendor_office_ports"
      WHERE "portId" = $1
    `, [syntheticPort.id]));
    const aliasValues = new Set([
        syntheticPort.name,
        syntheticPort.cityName ?? '',
        ...syntheticAliases.map((alias) => alias.alias),
    ]);
    for (const canonicalPort of canonicalPorts) {
        for (const aliasValue of aliasValues) {
            if (aliasValue) {
                await ensurePortAlias(queryRunner, canonicalPort, aliasValue, PORT_SOURCE_SHEET);
            }
        }
    }
    for (const officeLink of officeLinks) {
        for (const canonicalPort of canonicalPorts) {
            const existing = await queryRunner.query(`
          SELECT "id"
          FROM "vendor_office_ports"
          WHERE "officeId" = $1
            AND "portId" = $2
          LIMIT 1
        `, [officeLink.officeId, canonicalPort.id]);
            if (existing.length === 0) {
                await queryRunner.query(`
            INSERT INTO "vendor_office_ports" (
              "id", "officeId", "portId", "isPrimary", "notes", "createdAt", "updatedAt"
            )
            VALUES (
              uuid_generate_v4(), $1, $2, false, $3, now(), now()
            )
          `, [
                    officeLink.officeId,
                    canonicalPort.id,
                    `Split from synthetic port ${mapping.syntheticCode}.`,
                ]);
            }
        }
    }
    await queryRunner.query(`DELETE FROM "vendor_office_ports" WHERE "portId" = $1`, [syntheticPort.id]);
    await queryRunner.query(`DELETE FROM "port_alias" WHERE "portId" = $1`, [syntheticPort.id]);
    await queryRunner.query(`
      UPDATE "port_master"
      SET "isActive" = false,
          "notes" = $2,
          "updatedAt" = now()
      WHERE "id" = $1
    `, [
        syntheticPort.id,
        appendNote(syntheticPort.notes, `Split into ${canonicalPorts.map((port) => port.code).join(', ')} during synthetic seaport reconciliation.`),
    ]);
}
class BusinessSyntheticLocationReconciliation2026041009000 {
    name = 'BusinessSyntheticLocationReconciliation2026041009000';
    async up(queryRunner) {
        for (const mapping of SYNTHETIC_SERVICE_LOCATION_MAPPINGS) {
            await migrateSyntheticPortToServiceLocation(queryRunner, mapping);
        }
        for (const mapping of SYNTHETIC_SEAPORT_SPLIT_MAPPINGS) {
            await splitSyntheticPort(queryRunner, mapping);
        }
    }
    async down() {
    }
}
exports.BusinessSyntheticLocationReconciliation2026041009000 = BusinessSyntheticLocationReconciliation2026041009000;
//# sourceMappingURL=2026041009000-BusinessSyntheticLocationReconciliation.js.map