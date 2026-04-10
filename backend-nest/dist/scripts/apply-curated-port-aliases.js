"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_options_1 = require("../src/database/typeorm-options");
const normalization_1 = require("../src/common/normalization");
const port_alias_entity_1 = require("../src/modules/vendors/entities/port-alias.entity");
const port_master_entity_1 = require("../src/modules/vendors/entities/port-master.entity");
const CURATED_PORT_ALIASES = [
    {
        code: 'VNVTU',
        alias: 'Ba Ria Vung Tau',
        note: 'Carrier export coverage cleanup: normalize province-style Vietnam seaport label to Vung Tau.',
    },
    {
        code: 'VNCMP',
        alias: 'Ba Ria Vung Tau (Cai Mep)',
        note: 'Carrier export coverage cleanup: resolve explicit Cai Mep label to Cai Mep rather than broader Vung Tau.',
    },
    {
        code: 'EGPSD',
        alias: 'Port Said West',
        note: 'Carrier export coverage cleanup: normalize Port Said directional variant to canonical Port Said seaport.',
    },
    {
        code: 'EGPSD',
        alias: 'Port Said East',
        note: 'Carrier export coverage cleanup: normalize Port Said directional variant to canonical Port Said seaport.',
    },
    {
        code: 'CNDCB',
        alias: 'Da Chen Bay',
        note: 'Carrier export coverage cleanup: resolve spelling variant of Da Chan Bay.',
    },
    {
        code: 'MXLZC',
        alias: 'Lazaro Cardinas',
        note: 'Carrier export coverage cleanup: resolve misspelling of Lazaro Cardenas.',
    },
    {
        code: 'MXLZC',
        alias: 'Lazaro Cardinos',
        note: 'Carrier export coverage cleanup: resolve misspelling of Lazaro Cardenas.',
    },
    {
        code: 'SAKAC',
        alias: 'King Abdullah',
        note: 'Carrier export coverage cleanup: normalize shortened King Abdullah Port label.',
    },
    {
        code: 'AEKHL',
        alias: 'Khalifa - Auh',
        note: 'Carrier export coverage cleanup: resolve Abu Dhabi-qualified Khalifa label to Mina Khalifa/Abu Dhabi.',
    },
    {
        code: 'AEKHL',
        alias: 'Khalifa (Abu Dhabhi)',
        note: 'Carrier export coverage cleanup: resolve Abu Dhabi-qualified Khalifa label to Mina Khalifa/Abu Dhabi.',
    },
    {
        code: 'CNSJQ',
        alias: 'Sanshui New Port',
        note: 'Carrier export coverage cleanup: normalize Sanshui terminal label to canonical Sanshui seaport.',
    },
    {
        code: 'IRBUZ',
        alias: 'Bandar Bushehr',
        note: 'Carrier export coverage cleanup: normalize Bandar-prefixed Bushehr label to canonical Bushehr seaport.',
    },
    {
        code: 'PHMNN',
        alias: 'North Manila',
        note: 'Carrier export coverage cleanup: resolve directional Manila label to Manila North.',
    },
    {
        code: 'USPEF',
        alias: 'Port Everglades / Miami',
        note: 'Carrier export coverage cleanup: resolve explicit Port Everglades label to Port Everglades instead of generic Miami.',
    },
];
async function main() {
    const dataSource = (0, typeorm_options_1.createBusinessDataSource)();
    await dataSource.initialize();
    try {
        const result = await dataSource.transaction(async (manager) => {
            const portRepo = manager.getRepository(port_master_entity_1.PortMaster);
            const aliasRepo = manager.getRepository(port_alias_entity_1.PortAlias);
            const applied = [];
            for (const item of CURATED_PORT_ALIASES) {
                const port = await portRepo.findOne({
                    where: {
                        code: item.code,
                        portMode: port_master_entity_1.PortMode.SEAPORT,
                        isActive: true,
                    },
                });
                if (!port) {
                    applied.push({
                        code: item.code,
                        alias: item.alias,
                        action: 'missing_port',
                    });
                    continue;
                }
                const normalizedAlias = (0, normalization_1.normalizeTextKey)(item.alias);
                if (!normalizedAlias) {
                    continue;
                }
                const existing = await aliasRepo.find({
                    where: {
                        normalizedAlias,
                        countryName: port.countryName,
                        portMode: port_master_entity_1.PortMode.SEAPORT,
                    },
                });
                const existingForPort = existing.find((alias) => alias.portId === port.id);
                if (existingForPort) {
                    applied.push({
                        code: item.code,
                        alias: item.alias,
                        action: 'existing',
                        portName: port.name,
                    });
                    continue;
                }
                const conflicting = existing.find((alias) => alias.portId !== port.id);
                if (conflicting) {
                    const conflictingPort = await portRepo.findOneBy({ id: conflicting.portId });
                    applied.push({
                        code: item.code,
                        alias: item.alias,
                        action: 'conflict',
                        portName: port.name,
                        conflictingCode: conflictingPort?.code,
                    });
                    continue;
                }
                await aliasRepo.save(aliasRepo.create({
                    portId: port.id,
                    alias: item.alias,
                    normalizedAlias,
                    countryName: port.countryName,
                    portMode: port_master_entity_1.PortMode.SEAPORT,
                    isPrimary: false,
                    sourceWorkbook: 'Carrier export coverage cleanup',
                    sourceSheet: item.note,
                }));
                applied.push({
                    code: item.code,
                    alias: item.alias,
                    action: 'created',
                    portName: port.name,
                });
            }
            return {
                total: CURATED_PORT_ALIASES.length,
                created: applied.filter((item) => item.action === 'created').length,
                existing: applied.filter((item) => item.action === 'existing').length,
                conflicts: applied.filter((item) => item.action === 'conflict').length,
                missingPorts: applied.filter((item) => item.action === 'missing_port').length,
                items: applied,
            };
        });
        console.log(JSON.stringify(result, null, 2));
    }
    finally {
        await dataSource.destroy();
    }
}
main().catch((error) => {
    console.error('Applying curated port aliases failed.');
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=apply-curated-port-aliases.js.map