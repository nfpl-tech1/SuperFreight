"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessPortMasterDemoAdditions2026032701200 = void 0;
const DEMO_PORTS = [
    { name: 'Nhava Sheva', countryName: 'India', portMode: 'SEAPORT' },
    { name: 'Mundra', countryName: 'India', portMode: 'SEAPORT' },
    { name: 'Chennai', countryName: 'India', portMode: 'SEAPORT' },
    { name: 'Dadri ICD', countryName: 'India', portMode: 'SEAPORT' },
    { name: 'Agra ICD', countryName: 'India', portMode: 'SEAPORT' },
    { name: 'Hazira', countryName: 'India', portMode: 'SEAPORT' },
    { name: 'Tuticorin', countryName: 'India', portMode: 'SEAPORT' },
    { name: 'Cochin', countryName: 'India', portMode: 'SEAPORT' },
    { name: 'Vizag', countryName: 'India', portMode: 'SEAPORT' },
    { name: 'Kolkata', countryName: 'India', portMode: 'SEAPORT' },
    { name: 'Pithampur', countryName: 'India', portMode: 'SEAPORT' },
    { name: 'Pipavav', countryName: 'India', portMode: 'SEAPORT' },
    { name: 'Calcutta', countryName: 'India', portMode: 'SEAPORT' },
    { name: 'Haldia', countryName: 'India', portMode: 'SEAPORT' },
    { name: 'Kattupalli', countryName: 'India', portMode: 'SEAPORT' },
    { name: 'Krishnapatnam', countryName: 'India', portMode: 'SEAPORT' },
    { name: 'Mumbai', countryName: 'India', portMode: 'AIRPORT' },
    { name: 'Delhi', countryName: 'India', portMode: 'AIRPORT' },
    { name: 'Ahmedabad', countryName: 'India', portMode: 'AIRPORT' },
    { name: 'Chennai', countryName: 'India', portMode: 'AIRPORT' },
];
function normalizeValue(value) {
    return value
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
function buildCode(name, portMode) {
    const prefix = portMode === 'AIRPORT' ? 'AIR' : 'SEA';
    const slug = normalizeValue(name).replace(/\s+/g, '-').slice(0, 24);
    return `${prefix}-${slug}`;
}
class BusinessPortMasterDemoAdditions2026032701200 {
    name = 'BusinessPortMasterDemoAdditions2026032701200';
    async up(queryRunner) {
        for (const port of DEMO_PORTS) {
            await queryRunner.query(`
          INSERT INTO "port_master" (
            "code",
            "name",
            "normalizedName",
            "cityName",
            "normalizedCityName",
            "stateName",
            "countryName",
            "normalizedCountryName",
            "portMode",
            "regionId",
            "unlocode",
            "sourceConfidence",
            "isActive",
            "notes"
          )
          SELECT
            $1::varchar,
            $2::varchar,
            $3::varchar,
            $2::varchar,
            $3::varchar,
            NULL,
            $4::varchar,
            $5::varchar,
            $6::"port_master_portmode_enum",
            NULL,
            NULL,
            'MANUAL_DEMO',
            true,
            'Demo-specific India port/airport addition'
          WHERE NOT EXISTS (
            SELECT 1
            FROM "port_master"
            WHERE "name" = $2::varchar
              AND "countryName" = $4::varchar
              AND "portMode" = $6::"port_master_portmode_enum"
          )
        `, [
                buildCode(port.name, port.portMode),
                port.name,
                normalizeValue(port.name),
                port.countryName,
                normalizeValue(port.countryName),
                port.portMode,
            ]);
        }
    }
    async down(queryRunner) {
        for (const port of DEMO_PORTS) {
            await queryRunner.query(`
          DELETE FROM "port_master"
          WHERE "name" = $1
            AND "countryName" = $2
            AND "portMode" = $3
            AND "sourceConfidence" = 'MANUAL_DEMO'
        `, [port.name, port.countryName, port.portMode]);
        }
    }
}
exports.BusinessPortMasterDemoAdditions2026032701200 = BusinessPortMasterDemoAdditions2026032701200;
//# sourceMappingURL=2026032701200-BusinessPortMasterDemoAdditions.js.map