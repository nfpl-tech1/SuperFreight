import { mkdir, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { EntityManager } from 'typeorm';
import { normalizeTextKey } from '../src/common/normalization/string';
import { createBusinessDataSource } from '../src/database/typeorm-options';
import { PortAlias } from '../src/modules/vendors/entities/port-alias.entity';
import {
  PortMaster,
  PortMode,
} from '../src/modules/vendors/entities/port-master.entity';
import { VendorOfficePort } from '../src/modules/vendors/entities/vendor-office-port.entity';

const DEFAULT_OUTPUT_JSON_PATH =
  '.\\reports\\curated-synthetic-seaport-splits.reconciled.json';
const SOURCE_WORKBOOK = 'Phase 1 Vendor Port Curation';
const SOURCE_SHEET = 'Manual Port Aliases';

type SplitTarget = {
  code: string;
  name: string;
  cityName: string;
  countryName: string;
  aliases?: string[];
};

type CuratedSyntheticSeaportSplitMapping = {
  syntheticCode: string;
  targets: SplitTarget[];
  notes: string;
};

type CuratedSyntheticSeaportSplitItem = {
  syntheticCode: string;
  syntheticName: string;
  linkedOfficeCount: number;
  canonicalCodes: string[];
  createdCanonicalPorts: string[];
};

const CURATED_SPLITS: CuratedSyntheticSeaportSplitMapping[] = [
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
    notes:
      'Curated seaport split for a composite carrier-coverage label from OG DB.',
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
    notes:
      'Curated seaport split for a composite carrier-coverage label from OG DB.',
  },
];

function appendNote(current: string | null, note: string) {
  if (!current) {
    return note;
  }

  return current.includes(note) ? current : `${current}\n${note}`;
}

function getArgValue(args: string[], flag: string) {
  const index = args.indexOf(flag);
  return index >= 0 ? (args[index + 1] ?? null) : null;
}

async function ensurePortAlias(
  manager: EntityManager,
  port: PortMaster,
  aliasValue: string,
) {
  const normalizedAlias = normalizeTextKey(aliasValue);
  if (!normalizedAlias) {
    return;
  }

  const aliasRepo = manager.getRepository(PortAlias);
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

  await aliasRepo.save(
    aliasRepo.create({
      portId: port.id,
      alias: aliasValue,
      normalizedAlias,
      countryName: port.countryName,
      portMode: port.portMode,
      isPrimary: normalizedAlias === normalizeTextKey(port.name),
      sourceWorkbook: SOURCE_WORKBOOK,
      sourceSheet: SOURCE_SHEET,
    }),
  );
}

async function resolveOrCreateCanonicalPort(
  manager: EntityManager,
  target: SplitTarget,
  notes: string,
) {
  const repo = manager.getRepository(PortMaster);

  let port = await repo.findOne({
    where: {
      code: target.code,
      portMode: PortMode.SEAPORT,
    },
  });

  let created = false;
  if (!port) {
    port = await repo.save(
      repo.create({
        code: target.code,
        name: target.name,
        normalizedName: normalizeTextKey(target.name),
        cityName: target.cityName,
        normalizedCityName: normalizeTextKey(target.cityName),
        stateName: null,
        countryName: target.countryName,
        normalizedCountryName: normalizeTextKey(target.countryName),
        portMode: PortMode.SEAPORT,
        regionId: null,
        unlocode: target.code,
        sourceConfidence: 'MASTER',
        isActive: true,
        notes,
      }),
    );
    created = true;
  } else {
    port.name = target.name;
    port.normalizedName = normalizeTextKey(target.name);
    port.cityName = target.cityName;
    port.normalizedCityName = normalizeTextKey(target.cityName);
    port.countryName = target.countryName;
    port.normalizedCountryName = normalizeTextKey(target.countryName);
    port.unlocode = target.code;
    port.sourceConfidence = 'MASTER';
    port.isActive = true;
    port.notes = appendNote(port.notes, notes);
    port = await repo.save(port);
  }

  const aliases = new Set<string>([target.cityName, ...(target.aliases ?? [])]);
  for (const alias of aliases) {
    await ensurePortAlias(manager, port, alias);
  }

  return { port, created };
}

async function splitSyntheticPort(
  manager: EntityManager,
  mapping: CuratedSyntheticSeaportSplitMapping,
) {
  const portRepo = manager.getRepository(PortMaster);
  const portAliasRepo = manager.getRepository(PortAlias);
  const officePortRepo = manager.getRepository(VendorOfficePort);

  const syntheticPort = await portRepo.findOne({
    where: {
      code: mapping.syntheticCode,
      portMode: PortMode.SEAPORT,
      isActive: true,
    },
  });
  if (!syntheticPort) {
    return null;
  }

  const createdCanonicalPorts: string[] = [];
  const canonicalPorts: PortMaster[] = [];

  for (const target of mapping.targets) {
    const { port, created } = await resolveOrCreateCanonicalPort(
      manager,
      target,
      mapping.notes,
    );
    canonicalPorts.push(port);
    if (created) {
      createdCanonicalPorts.push(port.code);
    }
  }

  const [syntheticAliases, officeLinks] = await Promise.all([
    portAliasRepo.findBy({ portId: syntheticPort.id }),
    officePortRepo.findBy({ portId: syntheticPort.id }),
  ]);

  const aliasValues = new Set<string>([
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
        await officePortRepo.save(
          officePortRepo.create({
            officeId: officeLink.officeId,
            portId: canonicalPort.id,
            isPrimary: false,
            notes: `Split from synthetic port ${mapping.syntheticCode}.`,
          }),
        );
      }
    }

    await officePortRepo.delete({ id: officeLink.id });
  }

  if (syntheticAliases.length > 0) {
    await portAliasRepo.delete({ portId: syntheticPort.id });
  }

  syntheticPort.isActive = false;
  syntheticPort.notes = appendNote(
    syntheticPort.notes,
    `Split into ${canonicalPorts.map((port) => port.code).join(', ')} during synthetic seaport reconciliation.`,
  );
  await portRepo.save(syntheticPort);

  return {
    syntheticCode: mapping.syntheticCode,
    syntheticName: syntheticPort.name,
    linkedOfficeCount: officeLinks.length,
    canonicalCodes: canonicalPorts.map((port) => port.code),
    createdCanonicalPorts,
  } satisfies CuratedSyntheticSeaportSplitItem;
}

async function main() {
  const args = process.argv.slice(2);
  const outputJsonPath =
    getArgValue(args, '--output-json') ?? DEFAULT_OUTPUT_JSON_PATH;

  const dataSource = createBusinessDataSource();
  await dataSource.initialize();

  try {
    const items = await dataSource.transaction(async (manager) => {
      const migrated: CuratedSyntheticSeaportSplitItem[] = [];

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
      createdCanonicalPorts: items.reduce(
        (count, item) => count + item.createdCanonicalPorts.length,
        0,
      ),
      items,
    };

    const resolvedOutputJsonPath = path.resolve(outputJsonPath);
    await mkdir(path.dirname(resolvedOutputJsonPath), { recursive: true });
    await writeFile(
      resolvedOutputJsonPath,
      `${JSON.stringify(output, null, 2)}\n`,
      'utf8',
    );

    console.log(
      JSON.stringify(
        {
          outputJsonPath: resolvedOutputJsonPath,
          migratedSyntheticPorts: output.migratedSyntheticPorts,
          createdCanonicalPorts: output.createdCanonicalPorts,
          items: output.items,
        },
        null,
        2,
      ),
    );
  } finally {
    await dataSource.destroy();
  }
}

main().catch((error) => {
  console.error('Curated synthetic seaport split reconciliation failed.');
  console.error(error);
  process.exit(1);
});
