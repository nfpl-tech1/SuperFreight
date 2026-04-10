import { DataSource } from 'typeorm';
import { PortAlias } from './entities/port-alias.entity';
import { PortMaster, PortMode } from './entities/port-master.entity';

const EVIDENCE_LINKS = [
  'https://service.unece.org/trade/locode/Service/LocodeColumn.htm',
  'https://www.iata.org/en/iata-repository/pressroom/fact-sheets/fact-sheet-iata-location-codes/',
];

type PortLookupSource = 'port.name' | 'port.cityName' | 'alias';

export type PortLookupIssuePort = {
  id: string;
  code: string;
  name: string;
  cityName: string | null;
  countryName: string;
  normalizedCountryName: string | null;
  sourceConfidence: string | null;
  notes: string | null;
};

export type PortLookupIssue = {
  portMode: PortMode;
  normalizedLookup: string;
  rawExamples: string[];
  sources: PortLookupSource[];
  ports: PortLookupIssuePort[];
  countries: string[];
  issueType: 'cross-country collision' | 'duplicate active records';
};

export type PortLookupResolvedIssue = PortLookupIssue & {
  resolutionStatus: 'resolved';
  resolutionMethod:
    | 'exact_code_distinguishes_country'
    | 'exact_code_distinguishes_airport';
  resolutionReason: string;
  recommendedHandling: string;
  evidenceLinks: string[];
};

export type PortLookupUnresolvedIssue = PortLookupIssue & {
  resolutionStatus: 'unresolved';
  resolutionReason: string;
  evidenceLinks: string[];
};

export type PortLookupIssueReport<TIssue extends PortLookupIssue> = {
  generatedAt: string;
  source: 'database';
  portMode: PortMode;
  resolutionRule: string;
  count: number;
  issues: TIssue[];
};

type PortRecord = PortLookupIssuePort & {
  portMode: PortMode;
  normalizedName: string | null;
  normalizedCityName: string | null;
  isActive: boolean;
};

type LookupGroup = {
  portMode: PortMode;
  normalizedLookup: string;
  rawExamples: Set<string>;
  sources: Set<PortLookupSource>;
  ports: Map<string, PortLookupIssuePort>;
};

export type PortLookupAmbiguityReports = {
  raw: PortLookupIssueReport<PortLookupIssue>;
  resolved: PortLookupIssueReport<PortLookupResolvedIssue>;
  unresolved: PortLookupIssueReport<PortLookupUnresolvedIssue>;
};

export async function generatePortLookupAmbiguityReports(
  dataSource: DataSource,
  portMode: PortMode,
): Promise<PortLookupAmbiguityReports> {
  const portRepo = dataSource.getRepository(PortMaster);
  const portAliasRepo = dataSource.getRepository(PortAlias);

  const activePorts = await portRepo.find({
    where: {
      isActive: true,
      portMode,
    },
    select: [
      'id',
      'code',
      'name',
      'normalizedName',
      'cityName',
      'normalizedCityName',
      'countryName',
      'normalizedCountryName',
      'portMode',
      'sourceConfidence',
      'notes',
      'isActive',
    ],
  });

  const portsById = new Map<string, PortRecord>(
    activePorts.map((port) => [port.id, port]),
  );
  const aliases = await portAliasRepo.find({
    where: {
      portMode,
    },
    select: ['portId', 'alias', 'normalizedAlias'],
  });

  const groups = new Map<string, LookupGroup>();

  for (const port of activePorts) {
    addLookupGroup(groups, port, port.normalizedName, port.name, 'port.name');
    addLookupGroup(
      groups,
      port,
      port.normalizedCityName,
      port.cityName,
      'port.cityName',
    );
  }

  for (const alias of aliases) {
    const port = portsById.get(alias.portId);
    if (!port || !alias.normalizedAlias) {
      continue;
    }

    addLookupGroup(groups, port, alias.normalizedAlias, alias.alias, 'alias');
  }

  const rawIssues = Array.from(groups.values())
    .filter((group) => group.ports.size > 1)
    .map((group) => toIssue(group))
    .sort(compareIssues);

  const resolvedIssues: PortLookupResolvedIssue[] = [];
  const unresolvedIssues: PortLookupUnresolvedIssue[] = [];

  for (const issue of rawIssues) {
    const resolution = classifyIssue(issue);
    if (resolution.resolutionStatus === 'resolved') {
      resolvedIssues.push({
        ...issue,
        ...resolution,
      });
    } else {
      unresolvedIssues.push({
        ...issue,
        ...resolution,
      });
    }
  }

  const generatedAt = new Date().toISOString();

  return {
    raw: {
      generatedAt,
      source: 'database',
      portMode,
      resolutionRule:
        'Lists every active lookup collision before applying exact-code classification.',
      count: rawIssues.length,
      issues: rawIssues,
    },
    resolved: {
      generatedAt,
      source: 'database',
      portMode,
      resolutionRule:
        'Resolved when the collision is benign because exact location codes already distinguish either the country or the airport.',
      count: resolvedIssues.length,
      issues: resolvedIssues,
    },
    unresolved: {
      generatedAt,
      source: 'database',
      portMode,
      resolutionRule:
        'Left unresolved only when the active lookup collision still requires manual cleanup or a stronger canonical rule.',
      count: unresolvedIssues.length,
      issues: unresolvedIssues,
    },
  };
}

function addLookupGroup(
  groups: Map<string, LookupGroup>,
  port: PortRecord,
  normalizedLookup: string | null,
  rawExample: string | null,
  source: PortLookupSource,
) {
  if (!normalizedLookup) {
    return;
  }

  const key = `${port.portMode}::${normalizedLookup}`;
  const existing = groups.get(key) ?? {
    portMode: port.portMode,
    normalizedLookup,
    rawExamples: new Set<string>(),
    sources: new Set<PortLookupSource>(),
    ports: new Map<string, PortLookupIssuePort>(),
  };

  if (rawExample) {
    existing.rawExamples.add(rawExample);
  }
  existing.sources.add(source);
  existing.ports.set(port.id, {
    id: port.id,
    code: port.code,
    name: port.name,
    cityName: port.cityName,
    countryName: port.countryName,
    normalizedCountryName: port.normalizedCountryName,
    sourceConfidence: port.sourceConfidence,
    notes: port.notes,
  });
  groups.set(key, existing);
}

function toIssue(group: LookupGroup): PortLookupIssue {
  const ports = Array.from(group.ports.values()).sort((left, right) =>
    left.code.localeCompare(right.code),
  );
  const countries = Array.from(
    new Set(ports.map((port) => port.countryName).filter(Boolean)),
  ).sort((left, right) => left.localeCompare(right));

  return {
    portMode: group.portMode,
    normalizedLookup: group.normalizedLookup,
    rawExamples: Array.from(group.rawExamples).sort((left, right) =>
      left.localeCompare(right),
    ),
    sources: Array.from(group.sources).sort((left, right) =>
      left.localeCompare(right),
    ) as PortLookupSource[],
    ports,
    countries,
    issueType:
      hasDistinctCountryPrefixes(ports)
        ? 'cross-country collision'
        : 'duplicate active records',
  };
}

function compareIssues(left: PortLookupIssue, right: PortLookupIssue) {
  return (
    left.normalizedLookup.localeCompare(right.normalizedLookup) ||
    left.portMode.localeCompare(right.portMode)
  );
}

function classifyIssue(
  issue: PortLookupIssue,
):
  | Omit<PortLookupResolvedIssue, keyof PortLookupIssue>
  | Omit<PortLookupUnresolvedIssue, keyof PortLookupIssue> {
  if (hasDistinctCountryPrefixes(issue.ports)) {
    return {
      resolutionStatus: 'resolved',
      resolutionMethod: 'exact_code_distinguishes_country',
      resolutionReason:
        'The competing records are in different countries, and the location codes already disambiguate them.',
      recommendedHandling:
        'Keep these records active and avoid treating city-only lookups as canonical when the country is unknown.',
      evidenceLinks: EVIDENCE_LINKS,
    };
  }

  if (issue.portMode === PortMode.AIRPORT && hasDistinctCodes(issue.ports)) {
    return {
      resolutionStatus: 'resolved',
      resolutionMethod: 'exact_code_distinguishes_airport',
      resolutionReason:
        'The competing airport records already use different exact location codes, so the collision only exists when matching by city-level text alone.',
      recommendedHandling:
        'Keep exact-code matching as the canonical path and use city-name matching only as a fallback.',
      evidenceLinks: EVIDENCE_LINKS,
    };
  }

  return {
    resolutionStatus: 'unresolved',
    resolutionReason:
      'Multiple active records still collide on the same lookup within one country, and there is no safe exact-code rule to dismiss this as benign.',
    evidenceLinks: EVIDENCE_LINKS,
  };
}

function hasDistinctCodes(ports: PortLookupIssuePort[]) {
  const codes = ports
    .map((port) => port.code.trim().toUpperCase())
    .filter((code) => code.length > 0);
  return codes.length > 1 && new Set(codes).size === codes.length;
}

function hasDistinctCountryPrefixes(ports: PortLookupIssuePort[]) {
  const normalizedCodes = ports
    .map((port) => port.code.trim().toUpperCase())
    .filter((code) => code.length > 0);
  if (
    normalizedCodes.length < 2 ||
    normalizedCodes.some((code) => isSyntheticPortCode(code))
  ) {
    return false;
  }

  const prefixes = normalizedCodes
    .map((code) => code.slice(0, 2))
    .filter((prefix) => prefix.length === 2);
  return prefixes.length > 1 && new Set(prefixes).size > 1;
}

function isSyntheticPortCode(code: string) {
  return code.startsWith('AIR-') || code.startsWith('SEA-');
}
