import { createBusinessDataSource } from '../src/database/typeorm-options';
import { normalizeTextKey } from '../src/common/normalization';
import { PortAlias } from '../src/modules/vendors/entities/port-alias.entity';
import { PortMaster, PortMode } from '../src/modules/vendors/entities/port-master.entity';

type CuratedPortAlias = {
  code: string;
  alias: string;
  note: string;
};

const CURATED_PORT_ALIASES: CuratedPortAlias[] = [
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
  const dataSource = createBusinessDataSource();
  await dataSource.initialize();

  try {
    const result = await dataSource.transaction(async (manager) => {
      const portRepo = manager.getRepository(PortMaster);
      const aliasRepo = manager.getRepository(PortAlias);

      const applied: Array<{
        code: string;
        alias: string;
        action: 'created' | 'existing' | 'conflict' | 'missing_port';
        portName?: string;
        conflictingCode?: string;
      }> = [];

      for (const item of CURATED_PORT_ALIASES) {
        const port = await portRepo.findOne({
          where: {
            code: item.code,
            portMode: PortMode.SEAPORT,
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

        const normalizedAlias = normalizeTextKey(item.alias);
        if (!normalizedAlias) {
          continue;
        }

        const existing = await aliasRepo.find({
          where: {
            normalizedAlias,
            countryName: port.countryName,
            portMode: PortMode.SEAPORT,
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

        await aliasRepo.save(
          aliasRepo.create({
            portId: port.id,
            alias: item.alias,
            normalizedAlias,
            countryName: port.countryName,
            portMode: PortMode.SEAPORT,
            isPrimary: false,
            sourceWorkbook: 'Carrier export coverage cleanup',
            sourceSheet: item.note,
          }),
        );

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
  } finally {
    await dataSource.destroy();
  }
}

main().catch((error) => {
  console.error('Applying curated port aliases failed.');
  console.error(error);
  process.exit(1);
});
