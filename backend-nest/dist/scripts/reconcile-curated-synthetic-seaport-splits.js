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
const vendor_office_port_entity_1 = require("../src/modules/vendors/entities/vendor-office-port.entity");
const DEFAULT_OUTPUT_JSON_PATH = '.\\reports\\curated-synthetic-seaport-splits.reconciled.json';
const SOURCE_WORKBOOK = 'Phase 1 Vendor Port Curation';
const SOURCE_SHEET = 'Manual Port Aliases';
const CURATED_SPLITS = [
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
async function ensurePortAlias(manager, port, aliasValue) {
    const normalizedAlias = (0, string_1.normalizeTextKey)(aliasValue);
    if (!normalizedAlias) {
        return;
    }
    const aliasRepo = manager.getRepository(port_alias_entity_1.PortAlias);
    const existing = await aliasRepo.findOne({
        where: {
            portId: port.id,
            normalizedAlias,
            countryName: port.countryName,
            portMode: port.portMode,
        },
    });
    if (existing) {
        return;
    }
    await aliasRepo.save(aliasRepo.create({
        portId: port.id,
        alias: aliasValue,
        normalizedAlias,
        countryName: port.countryName,
        portMode: port.portMode,
        isPrimary: normalizedAlias === (0, string_1.normalizeTextKey)(port.name),
        sourceWorkbook: SOURCE_WORKBOOK,
        sourceSheet: SOURCE_SHEET,
    }));
}
async function resolveOrCreateCanonicalPort(manager, target, notes) {
    const repo = manager.getRepository(port_master_entity_1.PortMaster);
    let port = await repo.findOne({
        where: {
            code: target.code,
            portMode: port_master_entity_1.PortMode.SEAPORT,
        },
    });
    let created = false;
    if (!port) {
        port = await repo.save(repo.create({
            code: target.code,
            name: target.name,
            normalizedName: (0, string_1.normalizeTextKey)(target.name),
            cityName: target.cityName,
            normalizedCityName: (0, string_1.normalizeTextKey)(target.cityName),
            stateName: null,
            countryName: target.countryName,
            normalizedCountryName: (0, string_1.normalizeTextKey)(target.countryName),
            portMode: port_master_entity_1.PortMode.SEAPORT,
            regionId: null,
            unlocode: target.code,
            sourceConfidence: 'MASTER',
            isActive: true,
            notes,
        }));
        created = true;
    }
    else {
        port.name = target.name;
        port.normalizedName = (0, string_1.normalizeTextKey)(target.name);
        port.cityName = target.cityName;
        port.normalizedCityName = (0, string_1.normalizeTextKey)(target.cityName);
        port.countryName = target.countryName;
        port.normalizedCountryName = (0, string_1.normalizeTextKey)(target.countryName);
        port.unlocode = target.code;
        port.sourceConfidence = 'MASTER';
        port.isActive = true;
        port.notes = appendNote(port.notes, notes);
        port = await repo.save(port);
    }
    const aliases = new Set([target.cityName, ...(target.aliases ?? [])]);
    for (const alias of aliases) {
        await ensurePortAlias(manager, port, alias);
    }
    return { port, created };
}
async function splitSyntheticPort(manager, mapping) {
    const portRepo = manager.getRepository(port_master_entity_1.PortMaster);
    const portAliasRepo = manager.getRepository(port_alias_entity_1.PortAlias);
    const officePortRepo = manager.getRepository(vendor_office_port_entity_1.VendorOfficePort);
    const syntheticPort = await portRepo.findOne({
        where: {
            code: mapping.syntheticCode,
            portMode: port_master_entity_1.PortMode.SEAPORT,
            isActive: true,
        },
    });
    if (!syntheticPort) {
        return null;
    }
    const createdCanonicalPorts = [];
    const canonicalPorts = [];
    for (const target of mapping.targets) {
        const { port, created } = await resolveOrCreateCanonicalPort(manager, target, mapping.notes);
        canonicalPorts.push(port);
        if (created) {
            createdCanonicalPorts.push(port.code);
        }
    }
    const [syntheticAliases, officeLinks] = await Promise.all([
        portAliasRepo.findBy({ portId: syntheticPort.id }),
        officePortRepo.findBy({ portId: syntheticPort.id }),
    ]);
    const aliasValues = new Set([
        syntheticPort.name,
        syntheticPort.cityName ?? '',
        ...syntheticAliases.map((alias) => alias.alias),
    ]);
    for (const canonicalPort of canonicalPorts) {
        for (const alias of aliasValues) {
            if (alias) {
                await ensurePortAlias(manager, canonicalPort, alias);
            }
        }
    }
    for (const officeLink of officeLinks) {
        for (const canonicalPort of canonicalPorts) {
            const existing = await officePortRepo.findOne({
                where: {
                    officeId: officeLink.officeId,
                    portId: canonicalPort.id,
                },
            });
            if (!existing) {
                await officePortRepo.save(officePortRepo.create({
                    officeId: officeLink.officeId,
                    portId: canonicalPort.id,
                    isPrimary: false,
                    notes: `Split from synthetic port ${mapping.syntheticCode}.`,
                }));
            }
        }
        await officePortRepo.delete({ id: officeLink.id });
    }
    if (syntheticAliases.length > 0) {
        await portAliasRepo.delete({ portId: syntheticPort.id });
    }
    syntheticPort.isActive = false;
    syntheticPort.notes = appendNote(syntheticPort.notes, `Split into ${canonicalPorts.map((port) => port.code).join(', ')} during synthetic seaport reconciliation.`);
    await portRepo.save(syntheticPort);
    return {
        syntheticCode: mapping.syntheticCode,
        syntheticName: syntheticPort.name,
        linkedOfficeCount: officeLinks.length,
        canonicalCodes: canonicalPorts.map((port) => port.code),
        createdCanonicalPorts,
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
            for (const mapping of CURATED_SPLITS) {
                const item = await splitSyntheticPort(manager, mapping);
                if (item) {
                    migrated.push(item);
                }
            }
            return migrated;
        });
        const output = {
            generatedAt: new Date().toISOString(),
            mappings: CURATED_SPLITS,
            migratedSyntheticPorts: items.length,
            createdCanonicalPorts: items.reduce((count, item) => count + item.createdCanonicalPorts.length, 0),
            items,
        };
        const resolvedOutputJsonPath = path.resolve(outputJsonPath);
        await (0, promises_1.mkdir)(path.dirname(resolvedOutputJsonPath), { recursive: true });
        await (0, promises_1.writeFile)(resolvedOutputJsonPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
        console.log(JSON.stringify({
            outputJsonPath: resolvedOutputJsonPath,
            migratedSyntheticPorts: output.migratedSyntheticPorts,
            createdCanonicalPorts: output.createdCanonicalPorts,
            items: output.items,
        }, null, 2));
    }
    finally {
        await dataSource.destroy();
    }
}
main().catch((error) => {
    console.error('Curated synthetic seaport split reconciliation failed.');
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=reconcile-curated-synthetic-seaport-splits.js.map