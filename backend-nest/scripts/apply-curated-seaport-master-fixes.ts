import { createBusinessDataSource } from '../src/database/typeorm-options';
import { normalizeTextKey } from '../src/common/normalization';
import { PortAlias } from '../src/modules/vendors/entities/port-alias.entity';
import { PortMaster, PortMode } from '../src/modules/vendors/entities/port-master.entity';
import { Repository } from 'typeorm';

type CuratedSeaportEntry = {
  code: string;
  name: string;
  cityName: string;
  countryName: string;
  note: string;
  aliases?: string[];
};

const CURATED_SEAPORT_ENTRIES: CuratedSeaportEntry[] = [
  {
    code: 'CHBSL',
    name: '(CHBSL) Basel',
    cityName: 'Basel',
    countryName: 'Switzerland',
    note:
      'Curated seaport addition based on UN/LOCODE CH BSL function 12345---, which includes port function 1.',
  },
  {
    code: 'PYASU',
    name: '(PYASU) Asuncion',
    cityName: 'Asuncion',
    countryName: 'Paraguay',
    note:
      'Curated seaport addition based on UN/LOCODE PY ASU function 1--45---, which includes port function 1.',
  },
  {
    code: 'BSFPO',
    name: '(BSFPO) Freeport, Grand Bahama',
    cityName: 'Freeport, Grand Bahama',
    countryName: 'Bahamas',
    note:
      'Curated alias completion based on UN/LOCODE BS FPO function 1--4----, which includes port function 1.',
    aliases: ['Freeport'],
  },
];

async function ensureAlias(
  aliasRepo: Repository<PortAlias>,
  portRepo: Repository<PortMaster>,
  port: PortMaster,
  aliasValue: string,
) {
  const normalizedAlias = normalizeTextKey(aliasValue);
  if (!normalizedAlias) {
    return 'skipped' as const;
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
    return 'existing' as const;
  }

  const conflicting = existing.find((alias) => alias.portId !== port.id);
  if (conflicting) {
    const conflictingPort = await portRepo.findOneBy({ id: conflicting.portId });
    return {
      status: 'conflict' as const,
      conflictingCode: conflictingPort?.code ?? null,
    };
  }

  await aliasRepo.save(
    aliasRepo.create({
      portId: port.id,
      alias: aliasValue,
      normalizedAlias,
      countryName: port.countryName,
      portMode: PortMode.SEAPORT,
      isPrimary: normalizedAlias === normalizeTextKey(port.name),
      sourceWorkbook: 'Curated seaport master fixes',
      sourceSheet: port.notes ?? 'Curated seaport master fixes',
    }),
  );

  return 'created' as const;
}

async function main() {
  const dataSource = createBusinessDataSource();
  await dataSource.initialize();

  try {
    const result = await dataSource.transaction(async (manager) => {
      const portRepo = manager.getRepository(PortMaster);
      const aliasRepo = manager.getRepository(PortAlias);

      const items: Array<Record<string, unknown>> = [];

      for (const entry of CURATED_SEAPORT_ENTRIES) {
        let port = await portRepo.findOne({
          where: {
            code: entry.code,
            portMode: PortMode.SEAPORT,
          },
        });

        let action: 'created' | 'updated' = 'updated';
        if (!port) {
          port = portRepo.create({
            code: entry.code,
            name: entry.name,
            normalizedName: normalizeTextKey(entry.name),
            cityName: entry.cityName,
            normalizedCityName: normalizeTextKey(entry.cityName),
            stateName: null,
            countryName: entry.countryName,
            normalizedCountryName: normalizeTextKey(entry.countryName),
            portMode: PortMode.SEAPORT,
            regionId: null,
            unlocode: entry.code,
            sourceConfidence: 'MASTER',
            isActive: true,
            notes: entry.note,
          });
          action = 'created';
        } else {
          port.name = entry.name;
          port.normalizedName = normalizeTextKey(entry.name);
          port.cityName = entry.cityName;
          port.normalizedCityName = normalizeTextKey(entry.cityName);
          port.countryName = entry.countryName;
          port.normalizedCountryName = normalizeTextKey(entry.countryName);
          port.unlocode = entry.code;
          port.sourceConfidence = 'MASTER';
          port.isActive = true;
          port.notes = entry.note;
        }

        port = await portRepo.save(port);

        const aliasResults: Array<Record<string, unknown>> = [];
        for (const aliasValue of entry.aliases ?? []) {
          const aliasResult = await ensureAlias(aliasRepo, portRepo, port, aliasValue);
          aliasResults.push(
            typeof aliasResult === 'string'
              ? { alias: aliasValue, status: aliasResult }
              : { alias: aliasValue, ...aliasResult },
          );
        }

        items.push({
          code: entry.code,
          action,
          portId: port.id,
          aliasResults,
        });
      }

      return {
        total: CURATED_SEAPORT_ENTRIES.length,
        createdPorts: items.filter((item) => item.action === 'created').length,
        updatedPorts: items.filter((item) => item.action === 'updated').length,
        createdAliases: items.reduce((count, item) => {
          const aliasResults = Array.isArray(item.aliasResults) ? item.aliasResults : [];
          return (
            count +
            aliasResults.filter(
              (aliasResult) =>
                typeof aliasResult === 'object' &&
                aliasResult !== null &&
                'status' in aliasResult &&
                aliasResult.status === 'created',
            ).length
          );
        }, 0),
        items,
      };
    });

    console.log(JSON.stringify(result, null, 2));
  } finally {
    await dataSource.destroy();
  }
}

main().catch((error) => {
  console.error('Applying curated seaport master fixes failed.');
  console.error(error);
  process.exit(1);
});
