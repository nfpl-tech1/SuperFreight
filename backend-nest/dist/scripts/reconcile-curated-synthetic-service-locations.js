"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("node:fs/promises");
const path = __importStar(require("node:path"));
const string_1 = require("../src/common/normalization/string");
const typeorm_options_1 = require("../src/database/typeorm-options");
const port_alias_entity_1 = require("../src/modules/vendors/entities/port-alias.entity");
const port_master_entity_1 = require("../src/modules/vendors/entities/port-master.entity");
const service_location_alias_entity_1 = require("../src/modules/vendors/entities/service-location-alias.entity");
const service_location_master_entity_1 = require("../src/modules/vendors/entities/service-location-master.entity");
const vendor_office_port_entity_1 = require("../src/modules/vendors/entities/vendor-office-port.entity");
const vendor_office_service_location_entity_1 = require("../src/modules/vendors/entities/vendor-office-service-location.entity");
const DEFAULT_OUTPUT_JSON_PATH = '.\\reports\\curated-synthetic-service-locations.reconciled.json';
const SOURCE_WORKBOOK = 'Phase 1 Vendor Port Curation';
const SOURCE_SHEET = 'Manual Service Location Aliases';
const CURATED_MAPPINGS = [
    {
        syntheticCode: 'SEA-0119',
        canonicalName: 'Johannesburg',
        countryName: 'South Africa',
        locationKind: service_location_master_entity_1.ServiceLocationKind.INLAND_CITY,
        aliases: ['ZAJNB'],
        notes: 'Curated inland-city replacement for SEA-0119. Cross-checked against OG DB carrier coverage; UN/LOCODE reference ZAJNB.',
    },
    {
        syntheticCode: 'SEA-0244',
        canonicalName: 'Kamalapur/Dhaka',
        countryName: 'Bangladesh',
        locationKind: service_location_master_entity_1.ServiceLocationKind.ICD,
        aliases: ['ICD Dhaka', 'Icd Dhaka', 'Icd Dhaka/Kamalapur', 'BDKAM'],
        notes: 'Curated ICD replacement for SEA-0244. Cross-checked against OG DB carrier coverage; UN/LOCODE reference BDKAM.',
    },
    {
        syntheticCode: 'SEA-0064',
        canonicalName: 'Yunfu',
        countryName: 'China',
        locationKind: service_location_master_entity_1.ServiceLocationKind.INLAND_CITY,
        aliases: ['Yunfu, Guangdong', 'CNYUF'],
        notes: 'Curated inland-city replacement for SEA-0064. Cross-checked against OG DB carrier coverage; UN/LOCODE reference CNYUF.',
    },
];
function appendNote(current, note) {
    if (!current) {
        return note;
    }
    return current.includes(note) ? current : `${current}\n${note}`;
}
function getArgValue(args, flag) {
    const index = args.indexOf(flag);
    return index >= 0 ? (args[index + 1] ?? null) : null;
}
async function ensureServiceLocationAlias(manager, serviceLocation, aliasValue) {
    const normalizedAlias = (0, string_1.normalizeTextKey)(aliasValue);
    if (!normalizedAlias) {
        return;
    }
    const aliasRepo = manager.getRepository(service_location_alias_entity_1.ServiceLocationAlias);
    const existing = await aliasRepo.findOne({
        where: {
            serviceLocationId: serviceLocation.id,
            normalizedAlias,
            countryName: serviceLocation.countryName,
            locationKind: serviceLocation.locationKind,
        },
    });
    if (existing) {
        return;
    }
    await aliasRepo.save(aliasRepo.create({
        serviceLocationId: serviceLocation.id,
        alias: aliasValue,
        normalizedAlias,
        countryName: serviceLocation.countryName,
        locationKind: serviceLocation.locationKind,
        isPrimary: normalizedAlias === (0, string_1.normalizeTextKey)(serviceLocation.name),
        sourceWorkbook: SOURCE_WORKBOOK,
        sourceSheet: SOURCE_SHEET,
    }));
}
async function resolveOrCreateServiceLocation(manager, mapping) {
    const repo = manager.getRepository(service_location_master_entity_1.ServiceLocationMaster);
    const normalizedName = (0, string_1.normalizeTextKey)(mapping.canonicalName);
    const normalizedCountryName = (0, string_1.normalizeTextKey)(mapping.countryName);
    let serviceLocation = await repo.findOne({
        where: {
            normalizedName,
            normalizedCountryName,
            locationKind: mapping.locationKind,
        },
    });
    let created = false;
    if (!serviceLocation) {
        serviceLocation = await repo.save(repo.create({
            name: mapping.canonicalName,
            normalizedName,
            cityName: mapping.canonicalName,
            normalizedCityName: normalizedName,
            stateName: null,
            countryName: mapping.countryName,
            normalizedCountryName,
            locationKind: mapping.locationKind,
            regionId: null,
            isActive: true,
            notes: mapping.notes,
        }));
        created = true;
    }
    else {
        serviceLocation.isActive = true;
        serviceLocation.notes = appendNote(serviceLocation.notes, mapping.notes);
        serviceLocation = await repo.save(serviceLocation);
    }
    const aliases = new Set([mapping.canonicalName, ...mapping.aliases]);
    for (const alias of aliases) {
        await ensureServiceLocationAlias(manager, serviceLocation, alias);
    }
    return { serviceLocation, created };
}
async function migrateSyntheticPortToServiceLocation(manager, mapping) {
    const portRepo = manager.getRepository(port_master_entity_1.PortMaster);
    const portAliasRepo = manager.getRepository(port_alias_entity_1.PortAlias);
    const officePortRepo = manager.getRepository(vendor_office_port_entity_1.VendorOfficePort);
    const officeServiceLocationRepo = manager.getRepository(vendor_office_service_location_entity_1.VendorOfficeServiceLocation);
    const syntheticPort = await portRepo.findOne({
        where: {
            code: mapping.syntheticCode,
            isActive: true,
        },
    });
    if (!syntheticPort) {
        return null;
    }
    const { serviceLocation, created } = await resolveOrCreateServiceLocation(manager, mapping);
    const [syntheticAliases, officeLinks] = await Promise.all([
        portAliasRepo.findBy({ portId: syntheticPort.id }),
        officePortRepo.findBy({ portId: syntheticPort.id }),
    ]);
    const aliasValues = new Set([
        syntheticPort.name,
        syntheticPort.cityName ?? '',
        ...mapping.aliases,
        ...syntheticAliases.map((alias) => alias.alias),
    ]);
    for (const alias of aliasValues) {
        if (alias) {
            await ensureServiceLocationAlias(manager, serviceLocation, alias);
        }
    }
    for (const officeLink of officeLinks) {
        const existingServiceLink = await officeServiceLocationRepo.findOne({
            where: {
                officeId: officeLink.officeId,
                serviceLocationId: serviceLocation.id,
            },
        });
        if (!existingServiceLink) {
            await officeServiceLocationRepo.save(officeServiceLocationRepo.create({
                officeId: officeLink.officeId,
                serviceLocationId: serviceLocation.id,
                isPrimary: false,
                notes: `Migrated from synthetic port ${mapping.syntheticCode}.`,
            }));
        }
        await officePortRepo.delete({ id: officeLink.id });
    }
    if (syntheticAliases.length > 0) {
        await portAliasRepo.delete({ portId: syntheticPort.id });
    }
    syntheticPort.isActive = false;
    syntheticPort.notes = appendNote(syntheticPort.notes, `Migrated to service location ${serviceLocation.name} during synthetic location reconciliation.`);
    await portRepo.save(syntheticPort);
    return {
        syntheticCode: mapping.syntheticCode,
        syntheticName: syntheticPort.name,
        serviceLocationName: serviceLocation.name,
        serviceLocationKind: serviceLocation.locationKind,
        linkedOfficeCount: officeLinks.length,
        createdServiceLocation: created,
    };
}
async function main() {
    const args = process.argv.slice(2);
    const outputJsonPath = getArgValue(args, '--output-json') ?? DEFAULT_OUTPUT_JSON_PATH;
    const dataSource = (0, typeorm_options_1.createBusinessDataSource)();
    await dataSource.initialize();
    try {
        const items = await dataSource.transaction(async (manager) => {
            const migrated = [];
            for (const mapping of CURATED_MAPPINGS) {
                const item = await migrateSyntheticPortToServiceLocation(manager, mapping);
                if (item) {
                    migrated.push(item);
                }
            }
            return migrated;
        });
        const output = {
            generatedAt: new Date().toISOString(),
            mappings: CURATED_MAPPINGS,
            migratedSyntheticPorts: items.length,
            createdServiceLocations: items.filter((item) => item.createdServiceLocation).length,
            items,
        };
        const resolvedOutputJsonPath = path.resolve(outputJsonPath);
        await (0, promises_1.mkdir)(path.dirname(resolvedOutputJsonPath), { recursive: true });
        await (0, promises_1.writeFile)(resolvedOutputJsonPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
        console.log(JSON.stringify({
            outputJsonPath: resolvedOutputJsonPath,
            migratedSyntheticPorts: output.migratedSyntheticPorts,
            createdServiceLocations: output.createdServiceLocations,
            items: output.items,
        }, null, 2));
    }
    finally {
        await dataSource.destroy();
    }
}
main().catch((error) => {
    console.error('Curated synthetic service-location reconciliation failed.');
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=reconcile-curated-synthetic-service-locations.js.map