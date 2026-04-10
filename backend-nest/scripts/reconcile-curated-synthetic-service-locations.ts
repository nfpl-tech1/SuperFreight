import { mkdir, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { EntityManager } from 'typeorm';
import { normalizeTextKey } from '../src/common/normalization/string';
import { createBusinessDataSource } from '../src/database/typeorm-options';
import { PortAlias } from '../src/modules/vendors/entities/port-alias.entity';
import { PortMaster } from '../src/modules/vendors/entities/port-master.entity';
import { ServiceLocationAlias } from '../src/modules/vendors/entities/service-location-alias.entity';
import {
  ServiceLocationKind,
  ServiceLocationMaster,
} from '../src/modules/vendors/entities/service-location-master.entity';
import { VendorOfficePort } from '../src/modules/vendors/entities/vendor-office-port.entity';
import { VendorOfficeServiceLocation } from '../src/modules/vendors/entities/vendor-office-service-location.entity';

const DEFAULT_OUTPUT_JSON_PATH =
  '.\\reports\\curated-synthetic-service-locations.reconciled.json';
const SOURCE_WORKBOOK = 'Phase 1 Vendor Port Curation';
const SOURCE_SHEET = 'Manual Service Location Aliases';

type CuratedSyntheticServiceLocationMapping = {
  syntheticCode: string;
  canonicalName: string;
  countryName: string;
  locationKind: ServiceLocationKind;
  aliases: string[];
  notes: string;
};

type CuratedSyntheticServiceLocationItem = {
  syntheticCode: string;
  syntheticName: string;
  serviceLocationName: string;
  serviceLocationKind: ServiceLocationKind;
  linkedOfficeCount: number;
  createdServiceLocation: boolean;
};

const CURATED_MAPPINGS: CuratedSyntheticServiceLocationMapping[] = [
  {
    syntheticCode: 'SEA-0119',
    canonicalName: 'Johannesburg',
    countryName: 'South Africa',
    locationKind: ServiceLocationKind.INLAND_CITY,
    aliases: ['ZAJNB'],
    notes:
      'Curated inland-city replacement for SEA-0119. Cross-checked against OG DB carrier coverage; UN/LOCODE reference ZAJNB.',
  },
  {
    syntheticCode: 'SEA-0244',
    canonicalName: 'Kamalapur/Dhaka',
    countryName: 'Bangladesh',
    locationKind: ServiceLocationKind.ICD,
    aliases: ['ICD Dhaka', 'Icd Dhaka', 'Icd Dhaka/Kamalapur', 'BDKAM'],
    notes:
      'Curated ICD replacement for SEA-0244. Cross-checked against OG DB carrier coverage; UN/LOCODE reference BDKAM.',
  },
  {
    syntheticCode: 'SEA-0064',
    canonicalName: 'Yunfu',
    countryName: 'China',
    locationKind: ServiceLocationKind.INLAND_CITY,
    aliases: ['Yunfu, Guangdong', 'CNYUF'],
    notes:
      'Curated inland-city replacement for SEA-0064. Cross-checked against OG DB carrier coverage; UN/LOCODE reference CNYUF.',
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

async function ensureServiceLocationAlias(
  manager: EntityManager,
  serviceLocation: ServiceLocationMaster,
  aliasValue: string,
) {
  const normalizedAlias = normalizeTextKey(aliasValue);
  if (!normalizedAlias) {
    return;
  }

  const aliasRepo = manager.getRepository(ServiceLocationAlias);
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

  await aliasRepo.save(
    aliasRepo.create({
      serviceLocationId: serviceLocation.id,
      alias: aliasValue,
      normalizedAlias,
      countryName: serviceLocation.countryName,
      locationKind: serviceLocation.locationKind,
      isPrimary: normalizedAlias === normalizeTextKey(serviceLocation.name),
      sourceWorkbook: SOURCE_WORKBOOK,
      sourceSheet: SOURCE_SHEET,
    }),
  );
}

async function resolveOrCreateServiceLocation(
  manager: EntityManager,
  mapping: CuratedSyntheticServiceLocationMapping,
) {
  const repo = manager.getRepository(ServiceLocationMaster);
  const normalizedName = normalizeTextKey(mapping.canonicalName);
  const normalizedCountryName = normalizeTextKey(mapping.countryName);

  let serviceLocation = await repo.findOne({
    where: {
      normalizedName,
      normalizedCountryName,
      locationKind: mapping.locationKind,
    },
  });

  let created = false;
  if (!serviceLocation) {
    serviceLocation = await repo.save(
      repo.create({
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
      }),
    );
    created = true;
  } else {
    serviceLocation.isActive = true;
    serviceLocation.notes = appendNote(serviceLocation.notes, mapping.notes);
    serviceLocation = await repo.save(serviceLocation);
  }

  const aliases = new Set<string>([mapping.canonicalName, ...mapping.aliases]);
  for (const alias of aliases) {
    await ensureServiceLocationAlias(manager, serviceLocation, alias);
  }

  return { serviceLocation, created };
}

async function migrateSyntheticPortToServiceLocation(
  manager: EntityManager,
  mapping: CuratedSyntheticServiceLocationMapping,
) {
  const portRepo = manager.getRepository(PortMaster);
  const portAliasRepo = manager.getRepository(PortAlias);
  const officePortRepo = manager.getRepository(VendorOfficePort);
  const officeServiceLocationRepo = manager.getRepository(
    VendorOfficeServiceLocation,
  );

  const syntheticPort = await portRepo.findOne({
    where: {
      code: mapping.syntheticCode,
      isActive: true,
    },
  });
  if (!syntheticPort) {
    return null;
  }

  const { serviceLocation, created } = await resolveOrCreateServiceLocation(
    manager,
    mapping,
  );

  const [syntheticAliases, officeLinks] = await Promise.all([
    portAliasRepo.findBy({ portId: syntheticPort.id }),
    officePortRepo.findBy({ portId: syntheticPort.id }),
  ]);

  const aliasValues = new Set<string>([
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
      await officeServiceLocationRepo.save(
        officeServiceLocationRepo.create({
          officeId: officeLink.officeId,
          serviceLocationId: serviceLocation.id,
          isPrimary: false,
          notes: `Migrated from synthetic port ${mapping.syntheticCode}.`,
        }),
      );
    }

    await officePortRepo.delete({ id: officeLink.id });
  }

  if (syntheticAliases.length > 0) {
    await portAliasRepo.delete({ portId: syntheticPort.id });
  }

  syntheticPort.isActive = false;
  syntheticPort.notes = appendNote(
    syntheticPort.notes,
    `Migrated to service location ${serviceLocation.name} during synthetic location reconciliation.`,
  );
  await portRepo.save(syntheticPort);

  return {
    syntheticCode: mapping.syntheticCode,
    syntheticName: syntheticPort.name,
    serviceLocationName: serviceLocation.name,
    serviceLocationKind: serviceLocation.locationKind,
    linkedOfficeCount: officeLinks.length,
    createdServiceLocation: created,
  } satisfies CuratedSyntheticServiceLocationItem;
}

async function main() {
  const args = process.argv.slice(2);
  const outputJsonPath =
    getArgValue(args, '--output-json') ?? DEFAULT_OUTPUT_JSON_PATH;

  const dataSource = createBusinessDataSource();
  await dataSource.initialize();

  try {
    const items = await dataSource.transaction(async (manager) => {
      const migrated: CuratedSyntheticServiceLocationItem[] = [];

      for (const mapping of CURATED_MAPPINGS) {
        const item = await migrateSyntheticPortToServiceLocation(
          manager,
          mapping,
        );
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
      createdServiceLocations: items.filter(
        (item) => item.createdServiceLocation,
      ).length,
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
          createdServiceLocations: output.createdServiceLocations,
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
  console.error('Curated synthetic service-location reconciliation failed.');
  console.error(error);
  process.exit(1);
});
