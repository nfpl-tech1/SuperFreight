import { createHash } from 'node:crypto';
import * as path from 'node:path';
import * as XLSX from 'xlsx';
import { EntityManager, Repository } from 'typeorm';
import {
  normalizeTextKey,
  optionalText,
  toSmartTitleCase,
} from '../../common/normalization';
import { CountryRegionMap } from './entities/country-region-map.entity';
import { PortAlias } from './entities/port-alias.entity';
import { PortMaster, PortMode } from './entities/port-master.entity';
import { RegionMaster } from './entities/region-master.entity';
import { ServiceLocationAlias } from './entities/service-location-alias.entity';
import {
  ServiceLocationKind,
  ServiceLocationMaster,
} from './entities/service-location-master.entity';
import { VendorOfficePort } from './entities/vendor-office-port.entity';
import { VendorOfficeServiceLocation } from './entities/vendor-office-service-location.entity';
import { VendorMaster } from './entities/vendor-master.entity';
import { VendorTypeCode } from './entities/vendor-type-master.entity';

export const DEFAULT_ALLOWED_WCA_COUNTRIES = [
  'China',
  'Thailand',
  'Indonesia',
  'United States',
  'Egypt',
  'United Kingdom',
  'Germany',
  'Malaysia',
  'France',
  'Australia',
  'Singapore',
  'Japan',
  'Italy',
  'Netherlands',
  'Korea',
] as const;

export type LocationImportSummary = {
  regionsCreated: number;
  countryRegionLinksCreated: number;
  portsCreated: number;
  portAliasesCreated: number;
  serviceLocationsCreated: number;
  serviceLocationAliasesCreated: number;
  officePortLinksCreated: number;
  officeServiceLocationLinksCreated: number;
  auditRowsCreated: number;
};

export type SyntheticPortAuditItem = {
  syntheticPortId: string;
  syntheticCode: string;
  syntheticName: string;
  countryName: string;
  portMode: PortMode;
  sourceConfidence: string | null;
  linkedOfficeCount: number;
  canonicalPortId: string | null;
  canonicalCode: string | null;
  canonicalName: string | null;
  canonicalSourceConfidence: string | null;
};

export type SyntheticPortAuditSummary = {
  totalSyntheticPorts: number;
  mergeableSyntheticPorts: number;
  linkedSyntheticPorts: number;
  items: SyntheticPortAuditItem[];
};

export type SyntheticPortReconciliationSummary = {
  mergedSyntheticPorts: number;
  items: SyntheticPortAuditItem[];
};

export type CuratedSyntheticPortMapping = {
  syntheticCode: string;
  code: string;
  name: string;
  cityName?: string;
  countryName: string;
  aliases?: string[];
  notes?: string | null;
};

export type CuratedSyntheticPortReconciliationItem = {
  syntheticCode: string;
  syntheticName: string;
  canonicalCode: string;
  canonicalName: string;
  canonicalPortId: string;
  linkedOfficeCount: number;
  canonicalPortCreated: boolean;
};

export type CuratedSyntheticPortReconciliationSummary = {
  migratedSyntheticPorts: number;
  createdCanonicalPorts: number;
  skippedSyntheticCodes: string[];
  items: CuratedSyntheticPortReconciliationItem[];
};

export type RegularWcaOverlaySummary = {
  sheetsProcessed: number;
  vendorsFlagged: number;
  unmatchedRows: number;
};

type LocationCapabilityHints = {
  isIataCertified?: boolean;
  doesSeaFreight?: boolean;
};

type LocationSyncInput = {
  officeId: string;
  vendorName?: string | null;
  officeName?: string | null;
  officeCountryName: string | null;
  officeCityName: string | null;
  typeCodes: Iterable<VendorTypeCode>;
  locationCandidates: Iterable<string>;
  capabilityHints?: LocationCapabilityHints;
};

export type PortLinkReviewSuggestion = {
  portId: string;
  code: string;
  name: string;
  cityName: string | null;
  countryName: string;
  portMode: PortMode;
  confidence: 'high' | 'medium' | 'low';
  rationale: string;
};

export type PortLinkReviewItem = {
  vendorName: string | null;
  officeName: string | null;
  officeCountryName: string | null;
  officeCityName: string | null;
  candidate: string;
  normalizedCandidate: string | null;
  preferredModes: PortMode[];
  reason: 'unresolved' | 'ambiguous';
  suggestions: PortLinkReviewSuggestion[];
};

type IndexedPortAlias = {
  port: PortMaster;
  normalizedAlias: string;
  simplifiedAlias: string | null;
  countryName: string | null;
  portMode: PortMode;
  displayAlias: string;
};

type MutableLocationState = {
  regionsByName: Map<string, RegionMaster>;
  countryRegionKeys: Set<string>;
  portsByCountryAndAlias: Map<string, PortMaster>;
  portsByGlobalAlias: Map<string, PortMaster | null>;
  portsByCountryAliasAndMode: Map<string, PortMaster>;
  portsByGlobalAliasAndMode: Map<string, PortMaster | null>;
  portsByModeAndCode: Map<string, PortMaster>;
  indexedPortAliases: Map<string, IndexedPortAlias>;
  serviceLocationsByCountryAndAlias: Map<string, ServiceLocationMaster>;
  officePortKeys: Set<string>;
  primaryPortOfficeIds: Set<string>;
  officeServiceLocationKeys: Set<string>;
};

type ParsedPortMasterWorkbookRow = {
  code: string;
  name: string;
  cityName: string;
  countryName: string;
  portMode: PortMode;
  unlocode: string;
  aliases?: string[];
  notes?: string | null;
};

type ManualPortAliasOverride = {
  code: string;
  portMode: PortMode;
  alias: string;
};

type ManualPortCanonicalOverride = {
  code: string;
  portMode: PortMode;
  name: string;
  cityName: string;
  aliases?: string[];
};

export type VendorLocationImportContext = {
  summary: LocationImportSummary;
  portLinkReviewItems: PortLinkReviewItem[];
  syncOfficeLocations: (input: LocationSyncInput) => Promise<void>;
  previewOfficeLocations: (input: LocationSyncInput) => Promise<void>;
};

const DIRECT_WCA_COUNTRY_MAP: Record<string, string> = {
  GERMANY: 'Germany',
  THAILAND: 'Thailand',
  INDONESIA: 'Indonesia',
  USA: 'United States',
  EGYPT: 'Egypt',
  UK: 'United Kingdom',
  MALAYSIA: 'Malaysia',
  FRANCE: 'France',
  AUSTRALIA: 'Australia',
  SINGAPORE: 'Singapore',
  JAPAN: 'Japan',
  ITALY: 'Italy',
  NETHERLAND: 'Netherlands',
  'SOUTH KOREA': 'Korea',
  KOREA: 'Korea',
  MUMBAI: 'India',
  'NEW DELHI': 'India',
  QINGDAO: 'China',
  SHANGHAI: 'China',
  TIANJIN: 'China',
};

const PORT_RELEVANT_VENDOR_TYPES = new Set<VendorTypeCode>([
  VendorTypeCode.CFS_BUFFER_YARD,
  VendorTypeCode.CHA,
  VendorTypeCode.CARRIER,
  VendorTypeCode.SHIPPING_LINE,
  VendorTypeCode.CO_LOADER,
  VendorTypeCode.IATA,
  VendorTypeCode.WCA_AGENT,
]);

const SERVICE_LOCATION_RELEVANT_VENDOR_TYPES = new Set<VendorTypeCode>([
  VendorTypeCode.TRANSPORTER,
  VendorTypeCode.CFS_BUFFER_YARD,
  VendorTypeCode.CHA,
  VendorTypeCode.PACKER,
  VendorTypeCode.LICENSING,
  VendorTypeCode.WCA_AGENT,
]);

const COUNTRY_NAME_FIXES: Record<string, string> = {
  USA: 'United States',
  UK: 'United Kingdom',
  NETHERLAND: 'Netherlands',
  PHILLIPINES: 'Philippines',
  COLUMBIA: 'Colombia',
  'SOUTH KOREA': 'Korea',
};

const LOCATION_FIXES: Record<string, string> = {
  COCHIN: 'Kochi',
  CHITTAGONG: 'Chattogram',
  'NHAVA SHEVA': 'Nhava Sheva',
  'NAVA SHEVA': 'Nhava Sheva',
  NAVASEVA: 'Nhava Sheva',
  PUSAN: 'Busan',
  'PORT KELANG': 'Port Klang',
  LEHARVE: 'Le Havre',
  'LE HARVE': 'Le Havre',
  ILLIONS: 'Illinois',
};

const PORT_LOOKUP_VARIANT_FIXES: Record<string, string[]> = {
  CHATTOGRAM: ['Chittagong'],
  CHITTAGONG: ['Chattogram'],
  SOKHNA: ['Ain Sokhna'],
  PUSAN: ['Busan'],
  'PORT KELANG': ['Port Klang'],
  LEHARVE: ['Le Havre'],
  'LE HARVE': ['Le Havre'],
  'DAR ES SALAAM': ['Dar Es Salaam'],
  'HO CHI MINH': ['Ho Chi Minh'],
  'RAS AL KHAIMAH': ['Ras Al Khaimah'],
  'ALEXANDRIA EL DEKHEILA': ['Alexandria El Dekheila'],
  'ALEXANDRIA DEKHEILA': ['Alexandria El Dekheila'],
  'LAEM CHABANG': ['Laem Chabang'],
  'TINCAN ISLAND': ['Tin Can Island'],
  'PORT KLANG': ['Port Klang'],
};

const MANUAL_PORT_CURATION_SOURCE_WORKBOOK = 'Phase 1 Vendor Port Curation';
const MANUAL_PORT_SEED_SOURCE_SHEET = 'Manual Port Seeds';
const MANUAL_PORT_CANONICAL_SOURCE_SHEET = 'Manual Port Canonical Overrides';
const MANUAL_PORT_ALIAS_SOURCE_SHEET = 'Manual Port Aliases';

const PHASE_ONE_PORT_MASTER_SEEDS: ParsedPortMasterWorkbookRow[] = [
  {
    code: 'EGDAM',
    name: '(EGDAM) Damietta',
    cityName: 'Damietta',
    countryName: 'Egypt',
    portMode: PortMode.SEAPORT,
    unlocode: 'EGDAM',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'TRIST',
    name: '(TRIST) Istanbul',
    cityName: 'Istanbul',
    countryName: 'Turkey',
    portMode: PortMode.SEAPORT,
    unlocode: 'TRIST',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'EGALY',
    name: '(EGALY) Alexandria',
    cityName: 'Alexandria',
    countryName: 'Egypt',
    portMode: PortMode.SEAPORT,
    unlocode: 'EGALY',
    aliases: ['Alexandria Old Port'],
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'BRSSZ',
    name: '(BRSSZ) Santos',
    cityName: 'Santos',
    countryName: 'Brazil',
    portMode: PortMode.SEAPORT,
    unlocode: 'BRSSZ',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'NGTIN',
    name: '(NGTIN) Tin Can Island',
    cityName: 'Tin Can Island',
    countryName: 'Nigeria',
    portMode: PortMode.SEAPORT,
    unlocode: 'NGTIN',
    aliases: ['Tincan Island'],
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'IRBND',
    name: '(IRBND) Bandar Abbas',
    cityName: 'Bandar Abbas',
    countryName: 'Iran',
    portMode: PortMode.SEAPORT,
    unlocode: 'IRBND',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'KWSWK',
    name: '(KWSWK) Shuwaikh',
    cityName: 'Shuwaikh',
    countryName: 'Kuwait',
    portMode: PortMode.SEAPORT,
    unlocode: 'KWSWK',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'SDPZU',
    name: '(SDPZU) Port Sudan',
    cityName: 'Port Sudan',
    countryName: 'Sudan',
    portMode: PortMode.SEAPORT,
    unlocode: 'SDPZU',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'IQUQR',
    name: '(IQUQR) Umm Qasr',
    cityName: 'Umm Qasr',
    countryName: 'Iraq',
    portMode: PortMode.SEAPORT,
    unlocode: 'IQUQR',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'EGEDK',
    name: '(EGEDK) Alexandria El Dekheila',
    cityName: 'Alexandria El Dekheila',
    countryName: 'Egypt',
    portMode: PortMode.SEAPORT,
    unlocode: 'EGEDK',
    aliases: ['Alexandria Dekheila', 'El Dekheila'],
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'SYLTK',
    name: '(SYLTK) Lattakia',
    cityName: 'Lattakia',
    countryName: 'Syria',
    portMode: PortMode.SEAPORT,
    unlocode: 'SYLTK',
    aliases: ['Latakia'],
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'LYMRA',
    name: '(LYMRA) Misurata',
    cityName: 'Misurata',
    countryName: 'Libya',
    portMode: PortMode.SEAPORT,
    unlocode: 'LYMRA',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'NGAPP',
    name: '(NGAPP) Apapa',
    cityName: 'Apapa',
    countryName: 'Nigeria',
    portMode: PortMode.SEAPORT,
    unlocode: 'NGAPP',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'NICIO',
    name: '(NICIO) Corinto',
    cityName: 'Corinto',
    countryName: 'Nicaragua',
    portMode: PortMode.SEAPORT,
    unlocode: 'NICIO',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'FRLEH',
    name: '(FRLEH) Le Havre',
    cityName: 'Le Havre',
    countryName: 'France',
    portMode: PortMode.SEAPORT,
    unlocode: 'FRLEH',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'MVMLE',
    name: '(MVMLE) Male',
    cityName: 'Male',
    countryName: 'Maldives',
    portMode: PortMode.SEAPORT,
    unlocode: 'MVMLE',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'PHMNN',
    name: '(PHMNN) Manila North',
    cityName: 'Manila North',
    countryName: 'Philippines',
    portMode: PortMode.SEAPORT,
    unlocode: 'PHMNN',
    aliases: ['Manila North Harbor', 'Manila North Harbour'],
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'ESVLC',
    name: '(ESVLC) Valencia',
    cityName: 'Valencia',
    countryName: 'Spain',
    portMode: PortMode.SEAPORT,
    unlocode: 'ESVLC',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'IRBUZ',
    name: '(IRBUZ) Bushehr',
    cityName: 'Bushehr',
    countryName: 'Iran',
    portMode: PortMode.SEAPORT,
    unlocode: 'IRBUZ',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'GRPIR',
    name: '(GRPIR) Piraeus',
    cityName: 'Piraeus',
    countryName: 'Greece',
    portMode: PortMode.SEAPORT,
    unlocode: 'GRPIR',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'TZDAR',
    name: '(TZDAR) Dar Es Salaam',
    cityName: 'Dar Es Salaam',
    countryName: 'Tanzania',
    portMode: PortMode.SEAPORT,
    unlocode: 'TZDAR',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'GHTEM',
    name: '(GHTEM) Tema',
    cityName: 'Tema',
    countryName: 'Ghana',
    portMode: PortMode.SEAPORT,
    unlocode: 'GHTEM',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'RUNVS',
    name: '(RUNVS) Novorossiysk',
    cityName: 'Novorossiysk',
    countryName: 'Russia',
    portMode: PortMode.SEAPORT,
    unlocode: 'RUNVS',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'AEAJM',
    name: '(AEAJM) Ajman',
    cityName: 'Ajman',
    countryName: 'United Arab Emirates',
    portMode: PortMode.SEAPORT,
    unlocode: 'AEAJM',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'AEKHL',
    name: '(AEKHL) Mina Khalifa/Abu Dhabi',
    cityName: 'Mina Khalifa/Abu Dhabi',
    countryName: 'United Arab Emirates',
    portMode: PortMode.SEAPORT,
    unlocode: 'AEKHL',
    aliases: ['Khalifa', 'Khalifa Port'],
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'AEQIW',
    name: '(AEQIW) Umm Al Quwain',
    cityName: 'Umm Al Quwain',
    countryName: 'United Arab Emirates',
    portMode: PortMode.SEAPORT,
    unlocode: 'AEQIW',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'TRMER',
    name: '(TRMER) Mersin',
    cityName: 'Mersin',
    countryName: 'Turkey',
    portMode: PortMode.SEAPORT,
    unlocode: 'TRMER',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'CNDAL',
    name: '(CNDAL) Dalian',
    cityName: 'Dalian',
    countryName: 'China',
    portMode: PortMode.SEAPORT,
    unlocode: 'CNDAL',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'CNNTG',
    name: '(CNNTG) Nantong',
    cityName: 'Nantong',
    countryName: 'China',
    portMode: PortMode.SEAPORT,
    unlocode: 'CNNTG',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'CNFZH',
    name: '(CNFZH) Fuzhou',
    cityName: 'Fuzhou',
    countryName: 'China',
    portMode: PortMode.SEAPORT,
    unlocode: 'CNFZH',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'KRKAN',
    name: '(KRKAN) Gwangyang',
    cityName: 'Gwangyang',
    countryName: 'Korea',
    portMode: PortMode.SEAPORT,
    unlocode: 'KRKAN',
    aliases: ['Kwangyang'],
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'PHMNS',
    name: '(PHMNS) Manila South Harbour',
    cityName: 'Manila South Harbour',
    countryName: 'Philippines',
    portMode: PortMode.SEAPORT,
    unlocode: 'PHMNS',
    aliases: ['Manila South'],
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'PHGES',
    name: '(PHGES) General Santos',
    cityName: 'General Santos',
    countryName: 'Philippines',
    portMode: PortMode.SEAPORT,
    unlocode: 'PHGES',
    aliases: ['Dadiangas'],
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'PHCEB',
    name: '(PHCEB) Cebu',
    cityName: 'Cebu',
    countryName: 'Philippines',
    portMode: PortMode.SEAPORT,
    unlocode: 'PHCEB',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'PHDVO',
    name: '(PHDVO) Davao',
    cityName: 'Davao',
    countryName: 'Philippines',
    portMode: PortMode.SEAPORT,
    unlocode: 'PHDVO',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'COBUN',
    name: '(COBUN) Buenaventura',
    cityName: 'Buenaventura',
    countryName: 'Colombia',
    portMode: PortMode.SEAPORT,
    unlocode: 'COBUN',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'PECLL',
    name: '(PECLL) Callao',
    cityName: 'Callao',
    countryName: 'Peru',
    portMode: PortMode.SEAPORT,
    unlocode: 'PECLL',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'ARBUE',
    name: '(ARBUE) Buenos Aires',
    cityName: 'Buenos Aires',
    countryName: 'Argentina',
    portMode: PortMode.SEAPORT,
    unlocode: 'ARBUE',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'AUFRE',
    name: '(AUFRE) Fremantle',
    cityName: 'Fremantle',
    countryName: 'Australia',
    portMode: PortMode.SEAPORT,
    unlocode: 'AUFRE',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'HNPCR',
    name: '(HNPCR) Puerto Cortes',
    cityName: 'Puerto Cortes',
    countryName: 'Honduras',
    portMode: PortMode.SEAPORT,
    unlocode: 'HNPCR',
    aliases: ['Cortes'],
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'KWSAA',
    name: '(KWSAA) Shuaiba',
    cityName: 'Shuaiba',
    countryName: 'Kuwait',
    portMode: PortMode.SEAPORT,
    unlocode: 'KWSAA',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'JPMOJ',
    name: '(JPMOJ) Moji/Kitakyushu',
    cityName: 'Moji/Kitakyushu',
    countryName: 'Japan',
    portMode: PortMode.SEAPORT,
    unlocode: 'JPMOJ',
    aliases: ['Moji'],
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'JPYKK',
    name: '(JPYKK) Yokkaichi',
    cityName: 'Yokkaichi',
    countryName: 'Japan',
    portMode: PortMode.SEAPORT,
    unlocode: 'JPYKK',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'JPHKT',
    name: '(JPHKT) Hakata/Fukuoka',
    cityName: 'Hakata/Fukuoka',
    countryName: 'Japan',
    portMode: PortMode.SEAPORT,
    unlocode: 'JPHKT',
    aliases: ['Hakata'],
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'JPHMD',
    name: '(JPHMD) Hamada',
    cityName: 'Hamada',
    countryName: 'Japan',
    portMode: PortMode.SEAPORT,
    unlocode: 'JPHMD',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'TRALI',
    name: '(TRALI) Aliaga',
    cityName: 'Aliaga',
    countryName: 'Turkey',
    portMode: PortMode.SEAPORT,
    unlocode: 'TRALI',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'TRGEM',
    name: '(TRGEM) Gemlik',
    cityName: 'Gemlik',
    countryName: 'Turkey',
    portMode: PortMode.SEAPORT,
    unlocode: 'TRGEM',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'TRGEB',
    name: '(TRGEB) Gebze',
    cityName: 'Gebze',
    countryName: 'Turkey',
    portMode: PortMode.SEAPORT,
    unlocode: 'TRGEB',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'TRISK',
    name: '(TRISK) Iskenderun',
    cityName: 'Iskenderun',
    countryName: 'Turkey',
    portMode: PortMode.SEAPORT,
    unlocode: 'TRISK',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'VNUIH',
    name: '(VNUIH) Qui Nhon',
    cityName: 'Qui Nhon',
    countryName: 'Vietnam',
    portMode: PortMode.SEAPORT,
    unlocode: 'VNUIH',
    aliases: ['Quy Nhon'],
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'VNDAD',
    name: '(VNDAD) Da Nang',
    cityName: 'Da Nang',
    countryName: 'Vietnam',
    portMode: PortMode.SEAPORT,
    unlocode: 'VNDAD',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'CNWHI',
    name: '(CNWHI) Wuhu Pt',
    cityName: 'Wuhu Pt',
    countryName: 'China',
    portMode: PortMode.SEAPORT,
    unlocode: 'CNWHI',
    aliases: ['Wuhu'],
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'CAPDV',
    name: '(CAPDV) Port Dover',
    cityName: 'Port Dover',
    countryName: 'Canada',
    portMode: PortMode.SEAPORT,
    unlocode: 'CAPDV',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'CNHUA',
    name: '(CNHUA) Huangpu Pt',
    cityName: 'Huangpu Pt',
    countryName: 'China',
    portMode: PortMode.SEAPORT,
    unlocode: 'CNHUA',
    aliases: ['Huangpu', 'Huangpu New Port'],
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'CNSTG',
    name: '(CNSTG) Shantou',
    cityName: 'Shantou',
    countryName: 'China',
    portMode: PortMode.SEAPORT,
    unlocode: 'CNSTG',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'CNNHS',
    name: '(CNNHS) Sanshan Pt',
    cityName: 'Sanshan Pt',
    countryName: 'China',
    portMode: PortMode.SEAPORT,
    unlocode: 'CNNHS',
    aliases: ['Sanshan'],
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'CNZSN',
    name: '(CNZSN) Zhongshan',
    cityName: 'Zhongshan',
    countryName: 'China',
    portMode: PortMode.SEAPORT,
    unlocode: 'CNZSN',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'CNZUH',
    name: '(CNZUH) Zhuhai',
    cityName: 'Zhuhai',
    countryName: 'China',
    portMode: PortMode.SEAPORT,
    unlocode: 'CNZUH',
    aliases: ['Zhuhai Province', 'Zuhai Province'],
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'KHKOS',
    name: '(KHKOS) Sihanoukville / Kampong Saom',
    cityName: 'Sihanoukville',
    countryName: 'Cambodia',
    portMode: PortMode.SEAPORT,
    unlocode: 'KHKOS',
    aliases: ['Kampong Saom'],
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'MYSDK',
    name: '(MYSDK) Sandakan',
    cityName: 'Sandakan',
    countryName: 'Malaysia',
    portMode: PortMode.SEAPORT,
    unlocode: 'MYSDK',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'MYTPP',
    name: '(MYTPP) Tanjung Pelepas',
    cityName: 'Tanjung Pelepas',
    countryName: 'Malaysia',
    portMode: PortMode.SEAPORT,
    unlocode: 'MYTPP',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'RUFIP',
    name: '(RUFIP) Vladivostok',
    cityName: 'Vladivostok',
    countryName: 'Russia',
    portMode: PortMode.SEAPORT,
    unlocode: 'RUFIP',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'NZTRG',
    name: '(NZTRG) Tauranga',
    cityName: 'Tauranga',
    countryName: 'New Zealand',
    portMode: PortMode.SEAPORT,
    unlocode: 'NZTRG',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'YEHOD',
    name: '(YEHOD) Hodeidah',
    cityName: 'Hodeidah',
    countryName: 'Yemen',
    portMode: PortMode.SEAPORT,
    unlocode: 'YEHOD',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'SOBBO',
    name: '(SOBBO) Berbera',
    cityName: 'Berbera',
    countryName: 'Somalia',
    portMode: PortMode.SEAPORT,
    unlocode: 'SOBBO',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'BRIOA',
    name: '(BRIOA) Itapoa',
    cityName: 'Itapoa',
    countryName: 'Brazil',
    portMode: PortMode.SEAPORT,
    unlocode: 'BRIOA',
    notes: 'Phase 1 vendor seaport supplement',
  },
  {
    code: 'BRNVT',
    name: '(BRNVT) Navegantes',
    cityName: 'Navegantes',
    countryName: 'Brazil',
    portMode: PortMode.SEAPORT,
    unlocode: 'BRNVT',
    notes: 'Phase 1 vendor seaport supplement',
  },
];

const PHASE_ONE_PORT_ALIAS_OVERRIDES: ManualPortAliasOverride[] = [
  { code: 'INNSA', portMode: PortMode.SEAPORT, alias: 'Nhava Sheva' },
  { code: 'VNSGN', portMode: PortMode.SEAPORT, alias: 'Ho Chi Minh' },
  {
    code: 'VNSGN',
    portMode: PortMode.SEAPORT,
    alias: 'Ho Chi Minh (Cat Lai)',
  },
  {
    code: 'VNSGN',
    portMode: PortMode.SEAPORT,
    alias: 'Ho Chi Minh - Catlai',
  },
  { code: 'VNSGN', portMode: PortMode.SEAPORT, alias: 'Ho Chi Minh (Vict)' },
  { code: 'VNSGN', portMode: PortMode.SEAPORT, alias: 'Hochiminh Vict' },
  { code: 'MYPGU', portMode: PortMode.SEAPORT, alias: 'Pasir Gudang' },
  { code: 'MYPGU', portMode: PortMode.SEAPORT, alias: 'Pasirgudang' },
  { code: 'CNYTN', portMode: PortMode.SEAPORT, alias: 'Yantian' },
  { code: 'THBKK', portMode: PortMode.SEAPORT, alias: 'Bangkok - Pat' },
  { code: 'THBKK', portMode: PortMode.SEAPORT, alias: 'Bangkok Pat' },
  { code: 'THBKK', portMode: PortMode.SEAPORT, alias: 'Bangkok Pat/Bmt' },
  { code: 'MYPKL', portMode: PortMode.SEAPORT, alias: 'Portklang' },
  { code: 'MYPKL', portMode: PortMode.SEAPORT, alias: 'Port Klang West' },
  { code: 'MYPKL', portMode: PortMode.SEAPORT, alias: 'Port Klang North' },
  { code: 'HKHKG', portMode: PortMode.SEAPORT, alias: 'Hongkong' },
  { code: 'THLKR', portMode: PortMode.SEAPORT, alias: 'Latkrabang' },
  {
    code: 'AEDXB',
    portMode: PortMode.SEAPORT,
    alias: 'Bnd (Via Jebel Ali)',
  },
  {
    code: 'CNSHA',
    portMode: PortMode.SEAPORT,
    alias: 'ChangVia Shanghai',
  },
  { code: 'CNNSH', portMode: PortMode.SEAPORT, alias: 'Nansha New Port' },
  { code: 'CNNSH', portMode: PortMode.SEAPORT, alias: 'Panyunansha' },
  { code: 'CNHUA', portMode: PortMode.SEAPORT, alias: 'Huangpu' },
  { code: 'VNVTU', portMode: PortMode.SEAPORT, alias: 'Ba Ria Vung Tau' },
  { code: 'VNDAD', portMode: PortMode.SEAPORT, alias: 'Danang' },
  { code: 'QAHMD', portMode: PortMode.SEAPORT, alias: 'Hamad' },
  { code: 'QAHMD', portMode: PortMode.SEAPORT, alias: 'Hamad Port' },
  { code: 'EGSOK', portMode: PortMode.SEAPORT, alias: 'Al Sokhna' },
  { code: 'EGALY', portMode: PortMode.SEAPORT, alias: 'Alexandria Old Port' },
  { code: 'JPHKT', portMode: PortMode.SEAPORT, alias: 'Hakata' },
  { code: 'JPMOJ', portMode: PortMode.SEAPORT, alias: 'Moji' },
  { code: 'NGTIN', portMode: PortMode.SEAPORT, alias: 'Tincan' },
];

const PHASE_ONE_PORT_CANONICAL_OVERRIDES: ManualPortCanonicalOverride[] = [
  {
    code: 'INNSA',
    portMode: PortMode.SEAPORT,
    name: '(INNSA) Nhava Sheva',
    cityName: 'Nhava Sheva',
    aliases: ['Mumbai', 'JNPT', 'Jawaharlal Nehru Port'],
  },
];

const PORT_REVIEW_NOISE_KEYS = new Set([
  'AT',
  'BMT',
  'BND',
  'CMA',
  'EL',
  'FOR',
  'FRANCE',
  'LAOS',
  'PA',
  'PH',
  'SAN',
  'UST',
]);

const KNOWN_INLAND_LOCATION_KEYS = new Set([
  'ADDIS ABABA',
  'BANGALORE',
  'DELHI',
  'KAMPALA',
  'LUDHIANA',
  'MADRID',
]);

export async function createVendorLocationImportContext(
  manager: EntityManager,
  regionsWorkbookPath?: string | null,
  portMasterWorkbookPath?: string | null,
): Promise<VendorLocationImportContext> {
  const summary: LocationImportSummary = {
    regionsCreated: 0,
    countryRegionLinksCreated: 0,
    portsCreated: 0,
    portAliasesCreated: 0,
    serviceLocationsCreated: 0,
    serviceLocationAliasesCreated: 0,
    officePortLinksCreated: 0,
    officeServiceLocationLinksCreated: 0,
    auditRowsCreated: 0,
  };

  const state = await loadLocationState(manager);
  const portLinkReviewItems: PortLinkReviewItem[] = [];
  const recordedPortReviewKeys = new Set<string>();
  if (regionsWorkbookPath) {
    await importRegionsWorkbook(manager, regionsWorkbookPath, state, summary);
  }
  if (portMasterWorkbookPath) {
    await applyPhaseOneVendorPortSeeds(manager, state, summary);
    await importPortMasterWorkbook(
      manager,
      portMasterWorkbookPath,
      state,
      summary,
    );
    await applyPhaseOneVendorPortCanonicalOverrides(manager, state, summary);
    await reconcileSyntheticPortDuplicates(manager, state, summary);
    await applyPhaseOneVendorPortAliasOverrides(manager, state, summary);
  }

  return {
    summary,
    portLinkReviewItems,
    syncOfficeLocations: async (input) => {
      await syncOfficeLocations(
        manager,
        state,
        summary,
        input,
        portLinkReviewItems,
        recordedPortReviewKeys,
        'persist',
      );
    },
    previewOfficeLocations: async (input) => {
      await syncOfficeLocations(
        manager,
        state,
        summary,
        input,
        portLinkReviewItems,
        recordedPortReviewKeys,
        'preview',
      );
    },
  };
}

export async function applyRegularWcaOverlay(
  manager: EntityManager,
  workbookPath: string,
  allowedCountries: readonly string[] = DEFAULT_ALLOWED_WCA_COUNTRIES,
) {
  const vendorRepo = manager.getRepository(VendorMaster);
  const vendorsByNormalizedName = new Map(
    (await vendorRepo.find()).map((vendor) => [vendor.normalizedName, vendor]),
  );
  const workbook = XLSX.readFile(workbookPath, {
    cellDates: false,
    raw: false,
  });
  const allowedCountryKeys = new Set(
    allowedCountries.map((country) => normalizeCountryKey(country)),
  );
  const summary: RegularWcaOverlaySummary = {
    sheetsProcessed: 0,
    vendorsFlagged: 0,
    unmatchedRows: 0,
  };

  for (const sheetName of workbook.SheetNames) {
    const countryName = resolveWcaSheetCountry(sheetName);
    if (
      !countryName ||
      !allowedCountryKeys.has(normalizeCountryKey(countryName))
    ) {
      continue;
    }

    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      continue;
    }

    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: null,
      raw: false,
    });
    if (rows.length === 0) {
      continue;
    }

    summary.sheetsProcessed += 1;

    for (const row of rows) {
      const companyName = optionalText(row['COMPANY NAME']);
      if (!companyName) {
        continue;
      }

      const normalizedName = normalizeTextKey(companyName);
      const vendor = vendorsByNormalizedName.get(normalizedName);
      if (!vendor) {
        summary.unmatchedRows += 1;
        continue;
      }

      const existingNotes = optionalText(vendor.notes) ?? '';
      const marker = `Regular WCA shortlist (${countryName})`;
      if (existingNotes.includes(marker)) {
        continue;
      }

      vendor.notes = existingNotes ? `${existingNotes}\n${marker}` : marker;
      await vendorRepo.save(vendor);
      summary.vendorsFlagged += 1;
    }
  }

  return summary;
}

export async function auditSyntheticPortReconciliation(
  manager: EntityManager,
): Promise<SyntheticPortAuditSummary> {
  const state = await loadLocationState(manager);
  const syntheticPorts = Array.from(state.portsByModeAndCode.values()).filter(
    (port) => port.isActive && isSyntheticPortCode(port.code, port.portMode),
  );
  const linkedOfficeCounts = await loadPortLinkCounts(manager);
  const items = syntheticPorts
    .map((syntheticPort) =>
      buildSyntheticPortAuditItem(
        syntheticPort,
        findCanonicalPortForSynthetic(state, syntheticPort),
        linkedOfficeCounts.get(syntheticPort.id) ?? 0,
      ),
    )
    .sort(
      (left, right) =>
        right.linkedOfficeCount - left.linkedOfficeCount ||
        left.syntheticCode.localeCompare(right.syntheticCode),
    );

  return {
    totalSyntheticPorts: items.length,
    mergeableSyntheticPorts: items.filter((item) => item.canonicalPortId)
      .length,
    linkedSyntheticPorts: items.filter((item) => item.linkedOfficeCount > 0)
      .length,
    items,
  };
}

export async function reconcileSyntheticPortsWithExistingCanonicalRecords(
  manager: EntityManager,
): Promise<SyntheticPortReconciliationSummary> {
  const summary: LocationImportSummary = {
    regionsCreated: 0,
    countryRegionLinksCreated: 0,
    portsCreated: 0,
    portAliasesCreated: 0,
    serviceLocationsCreated: 0,
    serviceLocationAliasesCreated: 0,
    officePortLinksCreated: 0,
    officeServiceLocationLinksCreated: 0,
    auditRowsCreated: 0,
  };

  const state = await loadLocationState(manager);
  const linkedOfficeCounts = await loadPortLinkCounts(manager);
  const mergedItems: SyntheticPortAuditItem[] = [];

  await reconcileEquivalentSyntheticPortDuplicates(manager, state, summary);

  while (true) {
    const syntheticPort = Array.from(state.portsByModeAndCode.values()).find(
      (port) =>
        port.isActive &&
        isSyntheticPortCode(port.code, port.portMode) &&
        findCanonicalPortForSynthetic(state, port),
    );

    if (!syntheticPort) {
      break;
    }

    const canonicalPort = findCanonicalPortForSynthetic(state, syntheticPort);
    if (!canonicalPort) {
      break;
    }

    mergedItems.push(
      buildSyntheticPortAuditItem(
        syntheticPort,
        canonicalPort,
        linkedOfficeCounts.get(syntheticPort.id) ?? 0,
      ),
    );

    await mergeSyntheticPortIntoCanonical(
      manager,
      state,
      summary,
      syntheticPort,
      canonicalPort,
    );
  }

  return {
    mergedSyntheticPorts: mergedItems.length,
    items: mergedItems,
  };
}

export async function reconcileCuratedSyntheticPortMappings(
  manager: EntityManager,
  mappings: CuratedSyntheticPortMapping[],
): Promise<CuratedSyntheticPortReconciliationSummary> {
  const summary: LocationImportSummary = {
    regionsCreated: 0,
    countryRegionLinksCreated: 0,
    portsCreated: 0,
    portAliasesCreated: 0,
    serviceLocationsCreated: 0,
    serviceLocationAliasesCreated: 0,
    officePortLinksCreated: 0,
    officeServiceLocationLinksCreated: 0,
    auditRowsCreated: 0,
  };

  const state = await loadLocationState(manager);
  const linkedOfficeCounts = await loadPortLinkCounts(manager);
  const items: CuratedSyntheticPortReconciliationItem[] = [];
  const skippedSyntheticCodes: string[] = [];

  for (const mapping of mappings) {
    const syntheticPort = state.portsByModeAndCode.get(
      buildPortModeCodeKey(PortMode.SEAPORT, mapping.syntheticCode),
    );

    if (!syntheticPort || !syntheticPort.isActive) {
      skippedSyntheticCodes.push(mapping.syntheticCode);
      continue;
    }

    const row: ParsedPortMasterWorkbookRow = {
      code: mapping.code,
      name: mapping.name,
      cityName: mapping.cityName ?? mapping.name,
      countryName: mapping.countryName,
      portMode: PortMode.SEAPORT,
      unlocode: mapping.code,
      aliases: mapping.aliases,
      notes:
        mapping.notes ??
        `Curated official seaport replacement for ${mapping.syntheticCode}.`,
    };

    let canonicalPort = state.portsByModeAndCode.get(
      buildPortModeCodeKey(PortMode.SEAPORT, mapping.code),
    );
    let canonicalPortCreated = false;

    if (canonicalPort) {
      canonicalPort = await applyPortMasterRecordToPort(
        manager.getRepository(PortMaster),
        state,
        canonicalPort,
        row,
      );
      await ensurePortMasterAliases(
        manager.getRepository(PortAlias),
        state,
        canonicalPort,
        row,
        MANUAL_PORT_CURATION_SOURCE_WORKBOOK,
        MANUAL_PORT_ALIAS_SOURCE_SHEET,
        summary,
      );
    } else {
      canonicalPort = await createCanonicalPortForCuratedMapping(
        manager,
        state,
        row,
        summary,
      );
      canonicalPortCreated = true;
    }

    replaceLocationState(state, await loadLocationState(manager));

    const refreshedSyntheticPort = state.portsByModeAndCode.get(
      buildPortModeCodeKey(PortMode.SEAPORT, mapping.syntheticCode),
    );
    const refreshedCanonicalPort = state.portsByModeAndCode.get(
      buildPortModeCodeKey(PortMode.SEAPORT, mapping.code),
    );

    if (!refreshedSyntheticPort || !refreshedCanonicalPort) {
      skippedSyntheticCodes.push(mapping.syntheticCode);
      continue;
    }

    await mergeSyntheticPortIntoCanonical(
      manager,
      state,
      summary,
      refreshedSyntheticPort,
      refreshedCanonicalPort,
    );

    items.push({
      syntheticCode: mapping.syntheticCode,
      syntheticName: syntheticPort.name,
      canonicalCode: refreshedCanonicalPort.code,
      canonicalName: refreshedCanonicalPort.name,
      canonicalPortId: refreshedCanonicalPort.id,
      linkedOfficeCount: linkedOfficeCounts.get(syntheticPort.id) ?? 0,
      canonicalPortCreated,
    });
  }

  return {
    migratedSyntheticPorts: items.length,
    createdCanonicalPorts: items.filter((item) => item.canonicalPortCreated)
      .length,
    skippedSyntheticCodes,
    items,
  };
}

export function splitLocationCandidates(value: string | null | undefined) {
  const rawValue = optionalText(value);
  if (!rawValue) {
    return [];
  }

  return Array.from(
    new Set(
      rawValue
        .replace(/\r/g, '\n')
        .split(/\n|;|\/|,|\s{2,}/)
        .map((candidate) => cleanLocationToken(candidate))
        .filter((candidate): candidate is string => Boolean(candidate)),
    ),
  );
}

export function resolveWcaSheetCountry(sheetName: string) {
  const normalized = normalizeSheetTitle(sheetName);
  return (
    DIRECT_WCA_COUNTRY_MAP[normalized] ??
    COUNTRY_NAME_FIXES[normalized] ??
    toSmartTitleCase(sheetName.trim())
  );
}

export function isAllowedWcaSheet(
  sheetName: string,
  allowedCountries: readonly string[] = DEFAULT_ALLOWED_WCA_COUNTRIES,
) {
  const normalizedSheetName = normalizeSheetTitle(sheetName);
  if (
    normalizedSheetName === 'PROFILING RULES' ||
    normalizedSheetName === 'SHEET51'
  ) {
    return false;
  }

  const countryName = resolveWcaSheetCountry(sheetName);
  if (!countryName) {
    return false;
  }

  if (normalizeCountryKey(countryName) === normalizeCountryKey('India')) {
    return (
      normalizedSheetName === 'MUMBAI' || normalizedSheetName === 'NEW DELHI'
    );
  }

  const allowedCountryKeys = new Set(
    allowedCountries.map((country) => normalizeCountryKey(country)),
  );
  return allowedCountryKeys.has(normalizeCountryKey(countryName));
}

async function loadLocationState(
  manager: EntityManager,
): Promise<MutableLocationState> {
  const regionRepo = manager.getRepository(RegionMaster);
  const countryRegionRepo = manager.getRepository(CountryRegionMap);
  const portRepo = manager.getRepository(PortMaster);
  const portAliasRepo = manager.getRepository(PortAlias);
  const serviceLocationRepo = manager.getRepository(ServiceLocationMaster);
  const serviceLocationAliasRepo = manager.getRepository(ServiceLocationAlias);
  const officePortRepo = manager.getRepository(VendorOfficePort);
  const officeServiceLocationRepo = manager.getRepository(
    VendorOfficeServiceLocation,
  );

  const [
    regions,
    countryRegionMaps,
    ports,
    portAliases,
    serviceLocations,
    serviceLocationAliases,
    officePorts,
    officeServiceLocations,
  ] = await Promise.all([
    regionRepo.find(),
    countryRegionRepo.find(),
    portRepo.find(),
    portAliasRepo.find(),
    serviceLocationRepo.find(),
    serviceLocationAliasRepo.find(),
    officePortRepo.find(),
    officeServiceLocationRepo.find(),
  ]);

  const portsById = new Map(ports.map((port) => [port.id, port]));
  const serviceLocationsById = new Map(
    serviceLocations.map((serviceLocation) => [
      serviceLocation.id,
      serviceLocation,
    ]),
  );

  const state: MutableLocationState = {
    regionsByName: new Map(
      regions.map((region) => [region.normalizedSectorName, region]),
    ),
    countryRegionKeys: new Set(
      countryRegionMaps.map(
        (countryRegionMap) =>
          `${countryRegionMap.normalizedCountryName}::${countryRegionMap.regionId}`,
      ),
    ),
    portsByCountryAndAlias: new Map(),
    portsByGlobalAlias: new Map(),
    portsByCountryAliasAndMode: new Map(),
    portsByGlobalAliasAndMode: new Map(),
    portsByModeAndCode: new Map(),
    indexedPortAliases: new Map(),
    serviceLocationsByCountryAndAlias: new Map(),
    officePortKeys: new Set(
      officePorts.map((row) => `${row.officeId}::${row.portId}`),
    ),
    primaryPortOfficeIds: new Set(
      officePorts.filter((row) => row.isPrimary).map((row) => row.officeId),
    ),
    officeServiceLocationKeys: new Set(
      officeServiceLocations.map(
        (row) => `${row.officeId}::${row.serviceLocationId}`,
      ),
    ),
  };

  for (const port of ports) {
    if (!port.isActive) {
      continue;
    }
    indexPortCode(state, port);
    indexPort(state, port, port.name);
    indexPort(state, port, port.cityName);
  }
  for (const alias of portAliases) {
    const port = portsById.get(alias.portId);
    if (!port || !port.isActive) {
      continue;
    }
    indexPort(state, port, alias.alias, alias.countryName ?? port.countryName);
  }

  for (const serviceLocation of serviceLocations) {
    if (!serviceLocation.isActive) {
      continue;
    }
    indexServiceLocation(state, serviceLocation, serviceLocation.name);
    indexServiceLocation(state, serviceLocation, serviceLocation.cityName);
  }
  for (const alias of serviceLocationAliases) {
    const serviceLocation = serviceLocationsById.get(alias.serviceLocationId);
    if (!serviceLocation || !serviceLocation.isActive) {
      continue;
    }
    indexServiceLocation(
      state,
      serviceLocation,
      alias.alias,
      alias.countryName ?? serviceLocation.countryName,
    );
  }

  return state;
}

function replaceLocationState(
  target: MutableLocationState,
  nextState: MutableLocationState,
) {
  target.regionsByName = nextState.regionsByName;
  target.countryRegionKeys = nextState.countryRegionKeys;
  target.portsByCountryAndAlias = nextState.portsByCountryAndAlias;
  target.portsByGlobalAlias = nextState.portsByGlobalAlias;
  target.portsByCountryAliasAndMode = nextState.portsByCountryAliasAndMode;
  target.portsByGlobalAliasAndMode = nextState.portsByGlobalAliasAndMode;
  target.portsByModeAndCode = nextState.portsByModeAndCode;
  target.indexedPortAliases = nextState.indexedPortAliases;
  target.serviceLocationsByCountryAndAlias =
    nextState.serviceLocationsByCountryAndAlias;
  target.officePortKeys = nextState.officePortKeys;
  target.primaryPortOfficeIds = nextState.primaryPortOfficeIds;
  target.officeServiceLocationKeys = nextState.officeServiceLocationKeys;
}

async function importPortMasterWorkbook(
  manager: EntityManager,
  workbookPath: string,
  state: MutableLocationState,
  summary: LocationImportSummary,
) {
  const workbook = XLSX.readFile(workbookPath, {
    cellDates: false,
    raw: false,
  });
  const sourceWorkbook = path.basename(workbookPath);

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      continue;
    }

    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: null,
      raw: false,
    });

    for (const row of rows) {
      const parsedRow = parsePortMasterWorkbookRow(row);
      if (!parsedRow) {
        continue;
      }

      await upsertPortMasterWorkbookRow(
        manager,
        state,
        parsedRow,
        sourceWorkbook,
        sheetName,
        summary,
      );
    }
  }
}

async function applyPhaseOneVendorPortSeeds(
  manager: EntityManager,
  state: MutableLocationState,
  summary: LocationImportSummary,
) {
  for (const row of PHASE_ONE_PORT_MASTER_SEEDS) {
    await upsertPortMasterWorkbookRow(
      manager,
      state,
      row,
      MANUAL_PORT_CURATION_SOURCE_WORKBOOK,
      MANUAL_PORT_SEED_SOURCE_SHEET,
      summary,
    );
  }
}

async function applyPhaseOneVendorPortCanonicalOverrides(
  manager: EntityManager,
  state: MutableLocationState,
  summary: LocationImportSummary,
) {
  const portRepo = manager.getRepository(PortMaster);
  const portAliasRepo = manager.getRepository(PortAlias);
  const appliedOverrides: Array<{
    override: ManualPortCanonicalOverride;
    portCodeKey: string;
  }> = [];

  for (const override of PHASE_ONE_PORT_CANONICAL_OVERRIDES) {
    const portCodeKey = buildPortModeCodeKey(override.portMode, override.code);
    const port = state.portsByModeAndCode.get(portCodeKey);
    if (!port) {
      continue;
    }

    port.name = override.name;
    port.normalizedName = normalizeTextKey(override.name);
    port.cityName = override.cityName;
    port.normalizedCityName = normalizeTextKey(override.cityName);
    port.isActive = true;

    const saved = await portRepo.save(port);
    indexPortCode(state, saved);
    indexPort(state, saved, saved.name, saved.countryName);
    indexPort(state, saved, saved.cityName, saved.countryName);
    appliedOverrides.push({ override, portCodeKey });
  }

  if (appliedOverrides.length === 0) {
    return;
  }

  replaceLocationState(state, await loadLocationState(manager));

  for (const { override, portCodeKey } of appliedOverrides) {
    const port = state.portsByModeAndCode.get(portCodeKey);
    if (!port) {
      continue;
    }

    for (const alias of override.aliases ?? []) {
      await ensurePortAlias(
        portAliasRepo,
        state,
        port,
        alias,
        MANUAL_PORT_CURATION_SOURCE_WORKBOOK,
        MANUAL_PORT_CANONICAL_SOURCE_SHEET,
        summary,
      );
    }
  }
}

async function applyPhaseOneVendorPortAliasOverrides(
  manager: EntityManager,
  state: MutableLocationState,
  summary: LocationImportSummary,
) {
  const portAliasRepo = manager.getRepository(PortAlias);
  for (const override of PHASE_ONE_PORT_ALIAS_OVERRIDES) {
    const port = state.portsByModeAndCode.get(
      buildPortModeCodeKey(override.portMode, override.code),
    );
    if (!port) {
      continue;
    }

    await ensurePortAlias(
      portAliasRepo,
      state,
      port,
      override.alias,
      MANUAL_PORT_CURATION_SOURCE_WORKBOOK,
      MANUAL_PORT_ALIAS_SOURCE_SHEET,
      summary,
    );
  }
}

function findCanonicalPortForSynthetic(
  state: MutableLocationState,
  syntheticPort: PortMaster,
) {
  const normalizedCountryName = normalizeCountryKey(syntheticPort.countryName);
  const candidates = new Map<string, { port: PortMaster; score: number }>();
  const normalizedAliases = new Set<string>();
  const simplifiedAliases = new Set<string>();
  const recordCandidate = (port: PortMaster, score: number) => {
    const existingCandidate = candidates.get(port.id);
    if (!existingCandidate || score > existingCandidate.score) {
      candidates.set(port.id, { port, score });
    }
  };

  for (const token of [syntheticPort.cityName, syntheticPort.name]) {
    for (const variant of buildPortLookupVariants(token)) {
      const normalizedVariant = normalizeTextKey(variant);
      if (normalizedVariant) {
        normalizedAliases.add(normalizedVariant);

        for (const override of PHASE_ONE_PORT_ALIAS_OVERRIDES) {
          if (
            override.portMode !== syntheticPort.portMode ||
            normalizeTextKey(override.alias) !== normalizedVariant
          ) {
            continue;
          }

          const overridePort = state.portsByModeAndCode.get(
            buildPortModeCodeKey(override.portMode, override.code),
          );
          if (
            !overridePort ||
            overridePort.id === syntheticPort.id ||
            !overridePort.isActive ||
            normalizeCountryKey(overridePort.countryName) !==
              normalizedCountryName ||
            isSyntheticPortCode(overridePort.code, overridePort.portMode)
          ) {
            continue;
          }

          recordCandidate(overridePort, 100);
        }
      }

      const simplifiedVariant = simplifyPortLookupKey(variant);
      if (simplifiedVariant) {
        simplifiedAliases.add(simplifiedVariant);
      }
    }
  }

  for (const entry of state.indexedPortAliases.values()) {
    if (
      entry.port.id === syntheticPort.id ||
      !entry.port.isActive ||
      entry.port.portMode !== syntheticPort.portMode ||
      normalizeCountryKey(entry.port.countryName) !== normalizedCountryName ||
      isSyntheticPortCode(entry.port.code, entry.port.portMode)
    ) {
      continue;
    }

    const hasExactAliasMatch = normalizedAliases.has(entry.normalizedAlias);
    const hasSimplifiedExactMatch =
      entry.simplifiedAlias !== null &&
      simplifiedAliases.has(entry.simplifiedAlias);

    let hasSimplifiedOverlap = false;
    if (
      !hasExactAliasMatch &&
      !hasSimplifiedExactMatch &&
      entry.simplifiedAlias
    ) {
      for (const simplifiedAlias of simplifiedAliases) {
        const shorterAliasLength = Math.min(
          entry.simplifiedAlias.length,
          simplifiedAlias.length,
        );
        const longerAliasLength = Math.max(
          entry.simplifiedAlias.length,
          simplifiedAlias.length,
        );
        const overlapRatio =
          longerAliasLength === 0 ? 0 : shorterAliasLength / longerAliasLength;

        if (
          shorterAliasLength >= 4 &&
          overlapRatio >= 0.5 &&
          (entry.simplifiedAlias.includes(simplifiedAlias) ||
            simplifiedAlias.includes(entry.simplifiedAlias))
        ) {
          hasSimplifiedOverlap = true;
          break;
        }
      }
    }

    if (hasExactAliasMatch) {
      recordCandidate(entry.port, 80);
      continue;
    }

    if (hasSimplifiedExactMatch) {
      recordCandidate(entry.port, 70);
      continue;
    }

    if (hasSimplifiedOverlap) {
      recordCandidate(entry.port, 20);
    }
  }

  if (candidates.size === 0) {
    return null;
  }

  const rankedCandidates = Array.from(candidates.values()).sort(
    (left, right) =>
      right.score - left.score || left.port.code.localeCompare(right.port.code),
  );
  const strongestCandidate = rankedCandidates[0];
  const secondStrongestCandidate = rankedCandidates[1];

  if (!strongestCandidate) {
    return null;
  }

  if (
    secondStrongestCandidate &&
    strongestCandidate.score === secondStrongestCandidate.score
  ) {
    return null;
  }

  if (
    strongestCandidate.score < 70 &&
    secondStrongestCandidate &&
    strongestCandidate.score <= secondStrongestCandidate.score + 10
  ) {
    return null;
  }

  return strongestCandidate.port;
}

function appendPortNote(
  existingNote: string | null | undefined,
  nextNote: string,
) {
  const cleanedExisting = optionalText(existingNote);
  if (!cleanedExisting) {
    return nextNote;
  }

  if (cleanedExisting.includes(nextNote)) {
    return cleanedExisting;
  }

  return `${cleanedExisting}\n${nextNote}`;
}

async function reconcileSyntheticPortDuplicates(
  manager: EntityManager,
  state: MutableLocationState,
  summary: LocationImportSummary,
) {
  await reconcileEquivalentSyntheticPortDuplicates(manager, state, summary);

  const syntheticPorts = Array.from(state.portsByModeAndCode.values()).filter(
    (port) => port.isActive && isSyntheticPortCode(port.code, port.portMode),
  );

  for (const syntheticPort of syntheticPorts) {
    const canonicalPort = findCanonicalPortForSynthetic(state, syntheticPort);
    if (!canonicalPort) {
      continue;
    }

    await mergeSyntheticPortIntoCanonical(
      manager,
      state,
      summary,
      syntheticPort,
      canonicalPort,
    );
  }
}

function getSyntheticPortCanonicalLabel(port: PortMaster) {
  const cleanedCityName = cleanLocationToken(port.cityName);
  const cleanedName = cleanLocationToken(port.name);

  return (
    (cleanedCityName ? normalizeLocationLabel(cleanedCityName) : null) ??
    (cleanedName ? normalizeLocationLabel(cleanedName) : null) ??
    cleanedCityName ??
    cleanedName
  );
}

function buildSyntheticPortDuplicateGroupKey(port: PortMaster) {
  const canonicalLabel = getSyntheticPortCanonicalLabel(port);
  const normalizedLabel = normalizeTextKey(canonicalLabel);
  if (!normalizedLabel) {
    return null;
  }

  return `${normalizeCountryKey(port.countryName)}::${port.portMode}::${normalizedLabel}`;
}

function getSyntheticPortPreferenceScore(port: PortMaster) {
  const canonicalLabel = getSyntheticPortCanonicalLabel(port);
  const normalizedCanonicalLabel = normalizeTextKey(canonicalLabel);
  const normalizedName = normalizeTextKey(port.name);
  const normalizedCityName = normalizeTextKey(port.cityName);
  let score = 0;

  if (
    normalizedCanonicalLabel &&
    normalizedCanonicalLabel === normalizedCityName
  ) {
    score += 4;
  }
  if (normalizedCanonicalLabel && normalizedCanonicalLabel === normalizedName) {
    score += 3;
  }
  if (!/[,/()]/.test(port.name)) {
    score += 1;
  }
  if (!/[,/()]/.test(port.cityName ?? '')) {
    score += 1;
  }

  return score;
}

function choosePreferredSyntheticPort(ports: PortMaster[]) {
  return [...ports].sort((left, right) => {
    const scoreDelta =
      getSyntheticPortPreferenceScore(right) -
      getSyntheticPortPreferenceScore(left);
    if (scoreDelta !== 0) {
      return scoreDelta;
    }

    return left.code.localeCompare(right.code);
  })[0];
}

async function reconcileEquivalentSyntheticPortDuplicates(
  manager: EntityManager,
  state: MutableLocationState,
  summary: LocationImportSummary,
) {
  while (true) {
    const syntheticPorts = Array.from(state.portsByModeAndCode.values()).filter(
      (port) => port.isActive && isSyntheticPortCode(port.code, port.portMode),
    );
    const groupedPorts = new Map<string, PortMaster[]>();

    for (const syntheticPort of syntheticPorts) {
      const groupKey = buildSyntheticPortDuplicateGroupKey(syntheticPort);
      if (!groupKey) {
        continue;
      }

      const ports = groupedPorts.get(groupKey);
      if (ports) {
        ports.push(syntheticPort);
      } else {
        groupedPorts.set(groupKey, [syntheticPort]);
      }
    }

    const duplicateGroup = Array.from(groupedPorts.values()).find(
      (ports) => ports.length > 1,
    );
    if (!duplicateGroup) {
      return;
    }

    const preferredPort = choosePreferredSyntheticPort(duplicateGroup);
    for (const duplicatePort of duplicateGroup) {
      if (duplicatePort.id === preferredPort.id) {
        continue;
      }

      await mergeSyntheticPortIntoCanonical(
        manager,
        state,
        summary,
        duplicatePort,
        preferredPort,
      );
    }
  }
}

async function mergeSyntheticPortIntoCanonical(
  manager: EntityManager,
  state: MutableLocationState,
  summary: LocationImportSummary,
  syntheticPort: PortMaster,
  canonicalPort: PortMaster,
) {
  const portRepo = manager.getRepository(PortMaster);
  const portAliasRepo = manager.getRepository(PortAlias);
  const officePortRepo = manager.getRepository(VendorOfficePort);

  const [syntheticAliases, syntheticOfficeLinks] = await Promise.all([
    portAliasRepo.findBy({ portId: syntheticPort.id }),
    officePortRepo.findBy({ portId: syntheticPort.id }),
  ]);

  const aliasesToCarry = new Set(
    [
      syntheticPort.name,
      syntheticPort.cityName,
      ...syntheticAliases.map((alias) => alias.alias),
    ]
      .flatMap((alias) => Array.from(buildPortLookupVariants(alias)))
      .filter((alias): alias is string => Boolean(alias)),
  );

  for (const officeLink of syntheticOfficeLinks) {
    const existingCanonicalLink = await officePortRepo.findOneBy({
      officeId: officeLink.officeId,
      portId: canonicalPort.id,
    });

    if (existingCanonicalLink) {
      if (officeLink.isPrimary && !existingCanonicalLink.isPrimary) {
        existingCanonicalLink.isPrimary = true;
        await officePortRepo.save(existingCanonicalLink);
      }

      await officePortRepo.delete({ id: officeLink.id });
      continue;
    }

    officeLink.portId = canonicalPort.id;
    await officePortRepo.save(officeLink);
  }

  if (syntheticAliases.length > 0) {
    await portAliasRepo.delete({ portId: syntheticPort.id });
  }

  syntheticPort.isActive = false;
  syntheticPort.notes = appendPortNote(
    syntheticPort.notes,
    `Merged into ${canonicalPort.code} during synthetic port reconciliation.`,
  );
  await portRepo.save(syntheticPort);

  replaceLocationState(state, await loadLocationState(manager));

  const refreshedCanonicalPort = state.portsByModeAndCode.get(
    buildPortModeCodeKey(canonicalPort.portMode, canonicalPort.code),
  );
  if (!refreshedCanonicalPort) {
    return;
  }

  for (const alias of aliasesToCarry) {
    await ensurePortAlias(
      portAliasRepo,
      state,
      refreshedCanonicalPort,
      alias,
      MANUAL_PORT_CURATION_SOURCE_WORKBOOK,
      MANUAL_PORT_ALIAS_SOURCE_SHEET,
      summary,
    );
  }
}

async function loadPortLinkCounts(manager: EntityManager) {
  const rows = await manager
    .getRepository(VendorOfficePort)
    .createQueryBuilder('officePort')
    .select('officePort.portId', 'portId')
    .addSelect('COUNT(*)', 'count')
    .groupBy('officePort.portId')
    .getRawMany<{ portId: string; count: string }>();

  return new Map(rows.map((row) => [row.portId, Number(row.count ?? 0)]));
}

function buildSyntheticPortAuditItem(
  syntheticPort: PortMaster,
  canonicalPort: PortMaster | null,
  linkedOfficeCount: number,
): SyntheticPortAuditItem {
  return {
    syntheticPortId: syntheticPort.id,
    syntheticCode: syntheticPort.code,
    syntheticName: syntheticPort.name,
    countryName: syntheticPort.countryName,
    portMode: syntheticPort.portMode,
    sourceConfidence: syntheticPort.sourceConfidence,
    linkedOfficeCount,
    canonicalPortId: canonicalPort?.id ?? null,
    canonicalCode: canonicalPort?.code ?? null,
    canonicalName: canonicalPort?.name ?? null,
    canonicalSourceConfidence: canonicalPort?.sourceConfidence ?? null,
  };
}

async function importRegionsWorkbook(
  manager: EntityManager,
  workbookPath: string,
  state: MutableLocationState,
  summary: LocationImportSummary,
) {
  const workbook = XLSX.readFile(workbookPath, {
    cellDates: false,
    raw: false,
  });
  const regionRepo = manager.getRepository(RegionMaster);
  const countryRegionRepo = manager.getRepository(CountryRegionMap);

  for (const sheetName of workbook.SheetNames) {
    if (normalizeSheetTitle(sheetName) === 'SHEET1') {
      continue;
    }

    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      continue;
    }

    const rows = XLSX.utils.sheet_to_json<(string | null)[]>(sheet, {
      header: 1,
      defval: null,
      raw: false,
    });

    for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
      const row = rows[rowIndex];
      if (!row) {
        continue;
      }

      const sectorName = optionalText(row[1]);
      const countryName = normalizeCountryName(row[2]);
      const portsCell = optionalText(row[3]);

      if (!sectorName || !countryName || !portsCell) {
        continue;
      }

      const region = await upsertRegion(regionRepo, state, sectorName, summary);
      await upsertCountryRegionMap(
        countryRegionRepo,
        state,
        countryName,
        region.id,
        path.basename(workbookPath),
        sheetName,
        summary,
      );

      const locationTokens = splitLocationCandidates(portsCell);
      for (const token of locationTokens) {
        if (shouldTreatAsServiceLocation(token)) {
          await upsertServiceLocationReference(
            manager,
            state,
            token,
            countryName,
            inferServiceLocationKind(token),
            region.id,
            path.basename(workbookPath),
            sheetName,
            summary,
          );
          continue;
        }

        await upsertPortReference(
          manager,
          state,
          token,
          countryName,
          inferPortMode(token),
          region.id,
          path.basename(workbookPath),
          sheetName,
          summary,
        );
      }
    }
  }
}

async function syncOfficeLocations(
  manager: EntityManager,
  state: MutableLocationState,
  summary: LocationImportSummary,
  input: LocationSyncInput,
  portLinkReviewItems: PortLinkReviewItem[],
  recordedPortReviewKeys: Set<string>,
  syncMode: 'persist' | 'preview',
) {
  const countryName = normalizeCountryName(input.officeCountryName);
  const typeCodes = new Set(input.typeCodes);
  const candidateValues = Array.from(
    expandLocationCandidates([
      ...Array.from(input.locationCandidates),
      input.officeCityName ?? null,
    ]),
  );

  if (candidateValues.length === 0) {
    return;
  }

  const shouldLinkPorts = Array.from(typeCodes).some((typeCode) =>
    PORT_RELEVANT_VENDOR_TYPES.has(typeCode),
  );
  const shouldLinkServiceLocations = Array.from(typeCodes).some((typeCode) =>
    SERVICE_LOCATION_RELEVANT_VENDOR_TYPES.has(typeCode),
  );

  for (const candidate of candidateValues) {
    if (shouldLinkPorts) {
      const preferredModes = resolvePreferredPortModes(
        typeCodes,
        input.capabilityHints,
        candidate,
      );
      const matchedPorts = resolvePorts(
        state,
        candidate,
        countryName,
        preferredModes,
      );

      if (matchedPorts.length > 0) {
        if (syncMode === 'persist') {
          for (const port of matchedPorts) {
            await ensureOfficePortLink(
              manager.getRepository(VendorOfficePort),
              state,
              summary,
              input.officeId,
              port.id,
            );
          }
        }
      } else if (shouldReviewPortCandidate(candidate)) {
        recordPortLinkReview(
          portLinkReviewItems,
          recordedPortReviewKeys,
          input,
          candidate,
          preferredModes,
          'unresolved',
          suggestPorts(state, candidate, countryName, preferredModes),
        );
      }
    }

    if (shouldLinkServiceLocations && countryName) {
      const serviceLocation = await resolveOrCreateServiceLocation(
        manager,
        state,
        summary,
        candidate,
        countryName,
        inferServiceLocationKind(candidate),
        null,
        syncMode,
      );
      if (serviceLocation) {
        if (syncMode === 'persist') {
          await ensureOfficeServiceLocationLink(
            manager.getRepository(VendorOfficeServiceLocation),
            state,
            summary,
            input.officeId,
            serviceLocation.id,
          );
        }
      }
    }
  }
}

async function upsertRegion(
  regionRepo: Repository<RegionMaster>,
  state: MutableLocationState,
  sectorName: string,
  summary: LocationImportSummary,
) {
  const normalizedSectorName = normalizeTextKey(sectorName);
  const existing = state.regionsByName.get(normalizedSectorName);
  if (existing) {
    return existing;
  }

  const saved = await regionRepo.save(
    regionRepo.create({
      sectorName: toSmartTitleCase(sectorName),
      normalizedSectorName,
      displayName: toSmartTitleCase(sectorName),
      isActive: true,
    }),
  );
  state.regionsByName.set(normalizedSectorName, saved);
  summary.regionsCreated += 1;
  return saved;
}

async function upsertCountryRegionMap(
  countryRegionRepo: Repository<CountryRegionMap>,
  state: MutableLocationState,
  countryName: string,
  regionId: string,
  sourceWorkbook: string,
  sourceSheet: string,
  summary: LocationImportSummary,
) {
  const normalizedCountryName = normalizeCountryKey(countryName);
  const key = `${normalizedCountryName}::${regionId}`;
  if (state.countryRegionKeys.has(key)) {
    return;
  }

  await countryRegionRepo.save(
    countryRegionRepo.create({
      countryName,
      normalizedCountryName,
      regionId,
      sourceWorkbook,
      sourceSheet,
    }),
  );
  state.countryRegionKeys.add(key);
  summary.countryRegionLinksCreated += 1;
}

async function upsertPortReference(
  manager: EntityManager,
  state: MutableLocationState,
  token: string,
  countryName: string,
  portMode: PortMode,
  regionId: string | null,
  sourceWorkbook: string,
  sourceSheet: string,
  summary: LocationImportSummary,
) {
  const portRepo = manager.getRepository(PortMaster);
  const portAliasRepo = manager.getRepository(PortAlias);

  const canonicalName = normalizeLocationLabel(token);
  const existingPort =
    resolvePorts(state, canonicalName, countryName, [portMode])[0] ?? null;
  if (existingPort) {
    await ensurePortAlias(
      portAliasRepo,
      state,
      existingPort,
      token,
      sourceWorkbook,
      sourceSheet,
      summary,
    );
    return existingPort;
  }

  const saved = await portRepo.save(
    portRepo.create({
      code: buildSyntheticPortCode(countryName, canonicalName, portMode),
      name: canonicalName,
      normalizedName: normalizeTextKey(canonicalName),
      cityName: canonicalName,
      normalizedCityName: normalizeTextKey(canonicalName),
      stateName: null,
      countryName,
      normalizedCountryName: normalizeCountryKey(countryName),
      portMode,
      regionId,
      unlocode: null,
      sourceConfidence: 'REFERENCE',
      isActive: true,
      notes: token === canonicalName ? null : `Imported alias: ${token}`,
    }),
  );
  indexPortCode(state, saved);
  indexPort(state, saved, saved.name, countryName);
  indexPort(state, saved, saved.cityName, countryName);
  summary.portsCreated += 1;
  await ensurePortAlias(
    portAliasRepo,
    state,
    saved,
    token,
    sourceWorkbook,
    sourceSheet,
    summary,
  );
  return saved;
}

async function upsertPortMasterWorkbookRow(
  manager: EntityManager,
  state: MutableLocationState,
  row: ParsedPortMasterWorkbookRow,
  sourceWorkbook: string,
  sourceSheet: string,
  summary: LocationImportSummary,
) {
  const portRepo = manager.getRepository(PortMaster);
  const portAliasRepo = manager.getRepository(PortAlias);
  const modeCodeKey = buildPortModeCodeKey(row.portMode, row.code);
  const existingByCode = state.portsByModeAndCode.get(modeCodeKey);

  if (existingByCode) {
    const canonicalPort = await applyPortMasterRecordToPort(
      portRepo,
      state,
      existingByCode,
      row,
    );
    await ensurePortMasterAliases(
      portAliasRepo,
      state,
      canonicalPort,
      row,
      sourceWorkbook,
      sourceSheet,
      summary,
    );
    return canonicalPort;
  }

  const syntheticMatch = findSyntheticPortCandidate(state, row);
  if (syntheticMatch) {
    const canonicalPort = await applyPortMasterRecordToPort(
      portRepo,
      state,
      syntheticMatch,
      row,
    );
    await ensurePortMasterAliases(
      portAliasRepo,
      state,
      canonicalPort,
      row,
      sourceWorkbook,
      sourceSheet,
      summary,
    );
    return canonicalPort;
  }

  const saved = await portRepo.save(
    portRepo.create({
      code: row.code,
      name: row.name,
      normalizedName: normalizeTextKey(row.name),
      cityName: row.cityName,
      normalizedCityName: normalizeTextKey(row.cityName),
      stateName: null,
      countryName: row.countryName,
      normalizedCountryName: normalizeCountryKey(row.countryName),
      portMode: row.portMode,
      regionId: null,
      unlocode: row.unlocode,
      sourceConfidence: 'MASTER',
      isActive: true,
      notes: row.notes ?? null,
    }),
  );
  indexPortCode(state, saved);
  indexPort(state, saved, saved.name, saved.countryName);
  indexPort(state, saved, saved.cityName, saved.countryName);
  summary.portsCreated += 1;
  await ensurePortMasterAliases(
    portAliasRepo,
    state,
    saved,
    row,
    sourceWorkbook,
    sourceSheet,
    summary,
  );
  return saved;
}

async function upsertServiceLocationReference(
  manager: EntityManager,
  state: MutableLocationState,
  token: string,
  countryName: string,
  locationKind: ServiceLocationKind,
  regionId: string | null,
  sourceWorkbook: string,
  sourceSheet: string,
  summary: LocationImportSummary,
) {
  const serviceLocation = await resolveOrCreateServiceLocation(
    manager,
    state,
    summary,
    token,
    countryName,
    locationKind,
    regionId,
  );
  if (!serviceLocation) {
    return null;
  }

  const serviceLocationAliasRepo = manager.getRepository(ServiceLocationAlias);
  await ensureServiceLocationAlias(
    serviceLocationAliasRepo,
    state,
    serviceLocation,
    token,
    sourceWorkbook,
    sourceSheet,
    summary,
  );
  return serviceLocation;
}

async function ensurePortAlias(
  portAliasRepo: Repository<PortAlias>,
  state: MutableLocationState,
  port: PortMaster,
  aliasValue: string,
  sourceWorkbook: string,
  sourceSheet: string,
  summary: LocationImportSummary,
) {
  const normalizedAlias = normalizeTextKey(aliasValue);
  if (!normalizedAlias) {
    return;
  }
  const modeKey = buildCountryScopedModeKey(
    port.countryName,
    port.portMode,
    normalizedAlias,
  );
  const existingModeMatch = state.portsByCountryAliasAndMode.get(modeKey);
  if (existingModeMatch?.id === port.id) {
    return;
  }
  if (existingModeMatch) {
    return;
  }

  await portAliasRepo.save(
    portAliasRepo.create({
      portId: port.id,
      alias: aliasValue,
      normalizedAlias,
      countryName: port.countryName,
      portMode: port.portMode,
      isPrimary: normalizeTextKey(aliasValue) === normalizeTextKey(port.name),
      sourceWorkbook,
      sourceSheet,
    }),
  );
  indexPort(state, port, aliasValue, port.countryName);
  summary.portAliasesCreated += 1;
}

async function createCanonicalPortForCuratedMapping(
  manager: EntityManager,
  state: MutableLocationState,
  row: ParsedPortMasterWorkbookRow,
  summary: LocationImportSummary,
) {
  const portRepo = manager.getRepository(PortMaster);
  const portAliasRepo = manager.getRepository(PortAlias);

  const saved = await portRepo.save(
    portRepo.create({
      code: row.code,
      name: row.name,
      normalizedName: normalizeTextKey(row.name),
      cityName: row.cityName,
      normalizedCityName: normalizeTextKey(row.cityName),
      stateName: null,
      countryName: row.countryName,
      normalizedCountryName: normalizeCountryKey(row.countryName),
      portMode: row.portMode,
      regionId: null,
      unlocode: row.unlocode,
      sourceConfidence: 'MASTER',
      isActive: true,
      notes: row.notes ?? null,
    }),
  );

  indexPortCode(state, saved);
  indexPort(state, saved, saved.name, saved.countryName);
  indexPort(state, saved, saved.cityName, saved.countryName);
  summary.portsCreated += 1;

  await ensurePortMasterAliases(
    portAliasRepo,
    state,
    saved,
    row,
    MANUAL_PORT_CURATION_SOURCE_WORKBOOK,
    MANUAL_PORT_ALIAS_SOURCE_SHEET,
    summary,
  );

  return saved;
}

async function ensureServiceLocationAlias(
  serviceLocationAliasRepo: Repository<ServiceLocationAlias>,
  state: MutableLocationState,
  serviceLocation: ServiceLocationMaster,
  aliasValue: string,
  sourceWorkbook: string,
  sourceSheet: string,
  summary: LocationImportSummary,
) {
  const normalizedAlias = normalizeTextKey(aliasValue);
  if (!normalizedAlias) {
    return;
  }
  const key = buildCountryScopedKey(
    serviceLocation.countryName,
    normalizedAlias,
  );
  if (state.serviceLocationsByCountryAndAlias.has(key)) {
    return;
  }

  await serviceLocationAliasRepo.save(
    serviceLocationAliasRepo.create({
      serviceLocationId: serviceLocation.id,
      alias: aliasValue,
      normalizedAlias,
      countryName: serviceLocation.countryName,
      locationKind: serviceLocation.locationKind,
      isPrimary:
        normalizeTextKey(aliasValue) === normalizeTextKey(serviceLocation.name),
      sourceWorkbook,
      sourceSheet,
    }),
  );
  indexServiceLocation(
    state,
    serviceLocation,
    aliasValue,
    serviceLocation.countryName,
  );
  summary.serviceLocationAliasesCreated += 1;
}

async function resolveOrCreateServiceLocation(
  manager: EntityManager,
  state: MutableLocationState,
  summary: LocationImportSummary,
  token: string,
  countryName: string,
  locationKind: ServiceLocationKind,
  regionId: string | null = null,
  syncMode: 'persist' | 'preview' = 'persist',
) {
  const canonicalName = normalizeLocationLabel(token);
  const existing = resolveServiceLocation(state, canonicalName, countryName);
  if (existing) {
    return existing;
  }

  if (syncMode === 'preview') {
    return null;
  }

  const serviceLocationRepo = manager.getRepository(ServiceLocationMaster);
  const serviceLocationAliasRepo = manager.getRepository(ServiceLocationAlias);

  const saved = await serviceLocationRepo.save(
    serviceLocationRepo.create({
      name: canonicalName,
      normalizedName: normalizeTextKey(canonicalName),
      cityName: canonicalName,
      normalizedCityName: normalizeTextKey(canonicalName),
      stateName: null,
      countryName,
      normalizedCountryName: normalizeCountryKey(countryName),
      locationKind,
      regionId,
      isActive: true,
      notes: null,
    }),
  );
  indexServiceLocation(state, saved, saved.name, countryName);
  indexServiceLocation(state, saved, saved.cityName, countryName);
  summary.serviceLocationsCreated += 1;

  await ensureServiceLocationAlias(
    serviceLocationAliasRepo,
    state,
    saved,
    token,
    'derived',
    'derived',
    summary,
  );

  return saved;
}

function resolvePorts(
  state: MutableLocationState,
  candidate: string,
  countryName: string | null,
  preferredModes: readonly PortMode[] = [],
) {
  const matches = new Map<string, PortMaster>();
  const variants = buildPortLookupVariants(candidate);

  for (const variant of variants) {
    const normalizedVariant = normalizeTextKey(variant);
    if (!normalizedVariant) {
      continue;
    }

    for (const preferredMode of preferredModes) {
      if (countryName) {
        const countryModeMatch = state.portsByCountryAliasAndMode.get(
          buildCountryScopedModeKey(
            countryName,
            preferredMode,
            normalizedVariant,
          ),
        );
        if (countryModeMatch) {
          matches.set(countryModeMatch.id, countryModeMatch);
        }
      }

      const globalModeMatch = state.portsByGlobalAliasAndMode.get(
        buildGlobalModeKey(preferredMode, normalizedVariant),
      );
      if (globalModeMatch) {
        matches.set(globalModeMatch.id, globalModeMatch);
      }
    }

    if (matches.size > 0) {
      continue;
    }

    if (countryName) {
      const countryMatch = state.portsByCountryAndAlias.get(
        buildCountryScopedKey(countryName, normalizedVariant),
      );
      if (countryMatch) {
        matches.set(countryMatch.id, countryMatch);
      }
    }

    const globalMatch = state.portsByGlobalAlias.get(normalizedVariant);
    if (globalMatch) {
      matches.set(globalMatch.id, globalMatch);
    }
  }

  return Array.from(matches.values()).sort(comparePortsForLinking);
}

function findSyntheticPortCandidate(
  state: MutableLocationState,
  row: ParsedPortMasterWorkbookRow,
) {
  const candidates = [
    ...resolvePorts(state, row.cityName, row.countryName, [row.portMode]),
    ...resolvePorts(state, row.name, row.countryName, [row.portMode]),
  ].filter((candidate): candidate is PortMaster => Boolean(candidate));

  for (const candidate of candidates) {
    if (
      candidate.portMode === row.portMode &&
      isSyntheticPortCode(candidate.code, candidate.portMode)
    ) {
      return candidate;
    }
  }

  return null;
}

function resolveServiceLocation(
  state: MutableLocationState,
  candidate: string,
  countryName: string | null,
) {
  if (!countryName) {
    return null;
  }
  const normalizedCandidate = normalizeTextKey(
    normalizeLocationLabel(candidate),
  );
  if (!normalizedCandidate) {
    return null;
  }
  return (
    state.serviceLocationsByCountryAndAlias.get(
      buildCountryScopedKey(countryName, normalizedCandidate),
    ) ?? null
  );
}

async function ensureOfficePortLink(
  officePortRepo: Repository<VendorOfficePort>,
  state: MutableLocationState,
  summary: LocationImportSummary,
  officeId: string,
  portId: string,
) {
  const key = `${officeId}::${portId}`;
  if (state.officePortKeys.has(key)) {
    return;
  }

  await officePortRepo.save(
    officePortRepo.create({
      officeId,
      portId,
      isPrimary: !state.primaryPortOfficeIds.has(officeId),
      notes: null,
    }),
  );
  state.officePortKeys.add(key);
  state.primaryPortOfficeIds.add(officeId);
  summary.officePortLinksCreated += 1;
}

async function ensureOfficeServiceLocationLink(
  officeServiceLocationRepo: Repository<VendorOfficeServiceLocation>,
  state: MutableLocationState,
  summary: LocationImportSummary,
  officeId: string,
  serviceLocationId: string,
) {
  const key = `${officeId}::${serviceLocationId}`;
  if (state.officeServiceLocationKeys.has(key)) {
    return;
  }

  await officeServiceLocationRepo.save(
    officeServiceLocationRepo.create({
      officeId,
      serviceLocationId,
      isPrimary: false,
      notes: null,
    }),
  );
  state.officeServiceLocationKeys.add(key);
  summary.officeServiceLocationLinksCreated += 1;
}

async function applyPortMasterRecordToPort(
  portRepo: Repository<PortMaster>,
  state: MutableLocationState,
  port: PortMaster,
  row: ParsedPortMasterWorkbookRow,
) {
  const preferredFields = choosePreferredPortMasterFields(port, row);

  port.code = row.code;
  port.name = preferredFields.name;
  port.normalizedName = normalizeTextKey(preferredFields.name);
  port.cityName = preferredFields.cityName;
  port.normalizedCityName = normalizeTextKey(preferredFields.cityName);
  port.countryName = row.countryName;
  port.normalizedCountryName = normalizeCountryKey(row.countryName);
  port.portMode = row.portMode;
  port.unlocode = row.unlocode;
  port.sourceConfidence = 'MASTER';
  port.isActive = true;
  port.notes = row.notes === undefined ? port.notes : row.notes;

  const saved = await portRepo.save(port);
  indexPortCode(state, saved);
  indexPort(state, saved, saved.name, saved.countryName);
  indexPort(state, saved, saved.cityName, saved.countryName);
  return saved;
}

async function ensurePortMasterAliases(
  portAliasRepo: Repository<PortAlias>,
  state: MutableLocationState,
  port: PortMaster,
  row: ParsedPortMasterWorkbookRow,
  sourceWorkbook: string,
  sourceSheet: string,
  summary: LocationImportSummary,
) {
  const aliases = new Set([
    ...buildPortLookupVariants(row.name),
    ...buildPortLookupVariants(row.cityName),
    ...(row.aliases ?? []).flatMap((alias) =>
      Array.from(buildPortLookupVariants(alias)),
    ),
  ]);
  for (const alias of aliases) {
    if (normalizeTextKey(alias) === normalizeTextKey(port.name)) {
      continue;
    }

    await ensurePortAlias(
      portAliasRepo,
      state,
      port,
      alias,
      sourceWorkbook,
      sourceSheet,
      summary,
    );
  }
}

function indexPort(
  state: MutableLocationState,
  port: PortMaster,
  aliasValue: string | null | undefined,
  countryName = port.countryName,
) {
  for (const variant of buildPortLookupVariants(aliasValue)) {
    const normalizedAlias = normalizeTextKey(variant);
    if (!normalizedAlias || !countryName) {
      continue;
    }

    state.portsByCountryAndAlias.set(
      buildCountryScopedKey(countryName, normalizedAlias),
      port,
    );
    state.portsByCountryAliasAndMode.set(
      buildCountryScopedModeKey(countryName, port.portMode, normalizedAlias),
      port,
    );

    const existingGlobal = state.portsByGlobalAlias.get(normalizedAlias);
    if (existingGlobal === undefined) {
      state.portsByGlobalAlias.set(normalizedAlias, port);
    } else if (existingGlobal && existingGlobal.id !== port.id) {
      state.portsByGlobalAlias.set(normalizedAlias, null);
    }

    const globalModeKey = buildGlobalModeKey(port.portMode, normalizedAlias);
    const existingGlobalMode =
      state.portsByGlobalAliasAndMode.get(globalModeKey);
    if (existingGlobalMode === undefined) {
      state.portsByGlobalAliasAndMode.set(globalModeKey, port);
    } else if (existingGlobalMode && existingGlobalMode.id !== port.id) {
      state.portsByGlobalAliasAndMode.set(globalModeKey, null);
    }

    const searchKey = `${port.id}::${normalizedAlias}`;
    if (!state.indexedPortAliases.has(searchKey)) {
      state.indexedPortAliases.set(searchKey, {
        port,
        normalizedAlias,
        simplifiedAlias: simplifyPortLookupKey(variant),
        countryName,
        portMode: port.portMode,
        displayAlias: variant,
      });
    }
  }
}

function indexPortCode(state: MutableLocationState, port: PortMaster) {
  const normalizedCode = optionalText(port.code)?.toUpperCase();
  if (!normalizedCode) {
    return;
  }

  state.portsByModeAndCode.set(
    buildPortModeCodeKey(port.portMode, normalizedCode),
    port,
  );
}

function indexServiceLocation(
  state: MutableLocationState,
  serviceLocation: ServiceLocationMaster,
  aliasValue: string | null | undefined,
  countryName = serviceLocation.countryName,
) {
  const normalizedAlias = normalizeTextKey(aliasValue);
  if (!normalizedAlias || !countryName) {
    return;
  }
  state.serviceLocationsByCountryAndAlias.set(
    buildCountryScopedKey(countryName, normalizedAlias),
    serviceLocation,
  );
}

function buildCountryScopedKey(countryName: string, value: string) {
  return `${normalizeCountryKey(countryName)}::${value}`;
}

function buildCountryScopedModeKey(
  countryName: string,
  portMode: PortMode,
  value: string,
) {
  return `${normalizeCountryKey(countryName)}::${portMode}::${value}`;
}

function buildGlobalModeKey(portMode: PortMode, value: string) {
  return `${portMode}::${value}`;
}

function buildPortModeCodeKey(portMode: PortMode, code: string) {
  return `${portMode}::${code.trim().toUpperCase()}`;
}

function buildSyntheticPortCode(
  countryName: string,
  portName: string,
  portMode: PortMode,
) {
  const prefix = portMode === PortMode.AIRPORT ? 'AIR' : 'SEA';
  const hash = createHash('sha1')
    .update(
      `${normalizeCountryKey(countryName)}::${normalizeTextKey(portName)}::${portMode}`,
    )
    .digest('hex')
    .slice(0, 10)
    .toUpperCase();
  return `${prefix}-${hash}`;
}

function choosePreferredPortMasterFields(
  currentPort: PortMaster,
  row: ParsedPortMasterWorkbookRow,
) {
  const normalizedCode = normalizeTextKey(row.code);
  const currentNameIncludesCode = normalizeTextKey(currentPort.name).includes(
    normalizedCode,
  );
  if (!currentNameIncludesCode) {
    return {
      name: row.name,
      cityName: row.cityName,
    };
  }

  const currentScore = scorePortMasterLabel(
    currentPort.cityName,
    currentPort.countryName,
  );
  const incomingScore = scorePortMasterLabel(row.cityName, row.countryName);

  if (incomingScore > currentScore) {
    return {
      name: row.name,
      cityName: row.cityName,
    };
  }

  return {
    name: currentPort.name,
    cityName: currentPort.cityName ?? row.cityName,
  };
}

function scorePortMasterLabel(
  cityName: string | null | undefined,
  countryName: string,
) {
  const normalizedCity = normalizeTextKey(cityName);
  if (!normalizedCity) {
    return Number.NEGATIVE_INFINITY;
  }

  let score = normalizedCity.length;
  if (normalizedCity.length <= 3 && !normalizedCity.includes(' ')) {
    score -= 12;
  }
  if (normalizedCity === normalizeCountryKey(countryName)) {
    score -= 20;
  }
  return score;
}

function isSyntheticPortCode(
  code: string | null | undefined,
  portMode: PortMode,
) {
  const normalizedCode = optionalText(code)?.toUpperCase();
  if (!normalizedCode) {
    return false;
  }

  return normalizedCode.startsWith(
    portMode === PortMode.AIRPORT ? 'AIR-' : 'SEA-',
  );
}

function parsePortMasterWorkbookRow(
  row: Record<string, unknown>,
): ParsedPortMasterWorkbookRow | null {
  const countryName = normalizeCountryName(row['Country']);
  const code = optionalText(row['IATA Code'])?.toUpperCase();
  const cityName = optionalText(row['Port City']);
  if (!countryName || !code || !cityName) {
    return null;
  }

  const normalizedCityName = normalizeLocationLabel(cityName);
  const displayName =
    normalizePortMasterDisplayName(row['Name'], code, normalizedCityName) ??
    buildDefaultPortName(code, normalizedCityName);

  return {
    code,
    name: displayName,
    cityName: normalizedCityName,
    countryName,
    portMode: parsePortMasterMode(row['Mode']),
    unlocode: code,
  };
}

function parsePortMasterMode(value: unknown) {
  return normalizeSheetTitle(value) === 'AIR'
    ? PortMode.AIRPORT
    : PortMode.SEAPORT;
}

function buildDefaultPortName(code: string, cityName: string) {
  return `(${code}) ${cityName}`;
}

function normalizePortMasterDisplayName(
  value: unknown,
  code: string,
  cityName: string,
) {
  const cleaned = optionalText(value);
  if (!cleaned) {
    return null;
  }

  const match = cleaned.match(/^\(([^)]+)\)\s*(.+)$/);
  if (match) {
    return `(${code}) ${normalizeLocationLabel(match[2])}`;
  }

  return (
    normalizeLocationLabel(cleaned) || buildDefaultPortName(code, cityName)
  );
}

function buildPortLookupVariants(value: string | null | undefined) {
  const variants = new Set<string>();
  const cleaned = cleanLocationToken(value);
  if (!cleaned) {
    return variants;
  }

  const queue: string[] = [cleaned];
  const queuedVariants = new Set<string>([
    normalizeTextKey(cleaned) ?? cleaned.toUpperCase(),
  ]);
  const normalizedKey = normalizeTextKey(cleaned);
  if (normalizedKey) {
    for (const mappedValue of PORT_LOOKUP_VARIANT_FIXES[normalizedKey] ?? []) {
      const cleanedMappedValue = cleanLocationToken(mappedValue);
      if (!cleanedMappedValue) {
        continue;
      }

      const queuedKey =
        normalizeTextKey(cleanedMappedValue) ??
        cleanedMappedValue.toUpperCase();
      if (queuedVariants.has(queuedKey)) {
        continue;
      }

      queuedVariants.add(queuedKey);
      queue.push(cleanedMappedValue);
    }
  }

  while (queue.length > 0) {
    const rawVariant = queue.shift();
    if (!rawVariant) {
      continue;
    }

    const normalizedVariant = cleanLocationToken(rawVariant);
    if (!normalizedVariant) {
      continue;
    }

    variants.add(normalizedVariant);

    const derivedVariants = [
      normalizedVariant.replace(/^\([^)]+\)\s*/, ''),
      normalizedVariant.replace(/\([^)]*\)/g, ' '),
      normalizedVariant.replace(
        /\b(international|intl|airport|air cargo|seaport|harbour|harbor)\b/gi,
        ' ',
      ),
      normalizedVariant.replace(/^port\s+/i, ''),
      normalizedVariant.split(',')[0] ?? null,
      normalizedVariant.split(/\s+-\s+/)[0] ?? null,
    ];

    for (const slashVariant of normalizedVariant.split('/')) {
      derivedVariants.push(slashVariant);
    }

    for (const derivedVariant of derivedVariants) {
      const cleanedDerivedVariant = cleanLocationToken(derivedVariant);
      if (
        !cleanedDerivedVariant ||
        cleanedDerivedVariant.length < 4 ||
        cleanedDerivedVariant === normalizedVariant
      ) {
        continue;
      }

      const queuedKey =
        normalizeTextKey(cleanedDerivedVariant) ??
        cleanedDerivedVariant.toUpperCase();
      if (queuedVariants.has(queuedKey)) {
        continue;
      }

      queuedVariants.add(queuedKey);
      queue.push(cleanedDerivedVariant);
    }

    for (const match of normalizedVariant.matchAll(/\(([^)]+)\)/g)) {
      const parenthetical = cleanLocationToken(
        match[1]?.replace(/\bnear\b/gi, ' '),
      );
      if (!parenthetical || parenthetical.length < 4) {
        continue;
      }

      const queuedKey =
        normalizeTextKey(parenthetical) ?? parenthetical.toUpperCase();
      if (queuedVariants.has(queuedKey)) {
        continue;
      }

      queuedVariants.add(queuedKey);
      queue.push(parenthetical);
      /*  */
    }
  }

  return variants;
}

function simplifyPortLookupKey(value: string | null | undefined) {
  const normalized = normalizeTextKey(value);
  if (!normalized) {
    return null;
  }

  return normalized
    .replace(/\bPORT\b/g, ' ')
    .replace(/\bAIRPORT\b/g, ' ')
    .replace(/\bSEAPORT\b/g, ' ')
    .replace(/\bINTERNATIONAL\b/g, ' ')
    .replace(/\bINTL\b/g, ' ')
    .replace(/\bHARBOU?R\b/g, ' ')
    .replace(/\bAIR\s+CARGO\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolvePreferredPortModes(
  typeCodes: ReadonlySet<VendorTypeCode>,
  capabilityHints: LocationCapabilityHints | undefined,
  candidate: string,
) {
  const modes = new Set<PortMode>();

  if (/\bAIRPORT\b|\bAIR CARGO\b/i.test(candidate)) {
    modes.add(PortMode.AIRPORT);
  }
  if (/\bSEAPORT\b/i.test(candidate)) {
    modes.add(PortMode.SEAPORT);
  }

  if (capabilityHints?.isIataCertified || typeCodes.has(VendorTypeCode.IATA)) {
    modes.add(PortMode.AIRPORT);
  }

  if (
    capabilityHints?.doesSeaFreight ||
    typeCodes.has(VendorTypeCode.CARRIER) ||
    typeCodes.has(VendorTypeCode.SHIPPING_LINE) ||
    typeCodes.has(VendorTypeCode.CO_LOADER) ||
    typeCodes.has(VendorTypeCode.CFS_BUFFER_YARD) ||
    typeCodes.has(VendorTypeCode.CHA)
  ) {
    modes.add(PortMode.SEAPORT);
  }

  return Array.from(modes);
}

function shouldReviewPortCandidate(candidate: string) {
  const normalizedCandidate = normalizeTextKey(candidate);
  if (!normalizedCandidate) {
    return false;
  }

  return (
    !PORT_REVIEW_NOISE_KEYS.has(normalizedCandidate) &&
    !isAddressLikeLocationToken(candidate) &&
    !shouldTreatAsServiceLocation(candidate)
  );
}

function isAddressLikeLocationToken(candidate: string) {
  return (
    candidate.length > 40 ||
    /\d/.test(candidate) ||
    /\b(plot|village|district|taluka|sector|post|road|street|complex|pin)\b/i.test(
      candidate,
    )
  );
}

function suggestPorts(
  state: MutableLocationState,
  candidate: string,
  countryName: string | null,
  preferredModes: readonly PortMode[],
) {
  const candidateVariants = Array.from(buildPortLookupVariants(candidate));
  const normalizedCandidate = normalizeTextKey(candidate);
  const simplifiedCandidates = new Set(
    candidateVariants
      .map((variant) => simplifyPortLookupKey(variant))
      .filter((variant): variant is string => Boolean(variant)),
  );
  if (simplifiedCandidates.size === 0) {
    const simplifiedCandidate = simplifyPortLookupKey(candidate);
    if (simplifiedCandidate) {
      simplifiedCandidates.add(simplifiedCandidate);
    }
  }

  const suggestionScores = new Map<
    string,
    PortLinkReviewSuggestion & { score: number }
  >();
  const countryKey = countryName ? normalizeCountryKey(countryName) : null;

  for (const entry of state.indexedPortAliases.values()) {
    if (preferredModes.length > 0 && !preferredModes.includes(entry.portMode)) {
      continue;
    }

    let score = 0;
    let rationale = '';
    if (
      normalizedCandidate &&
      entry.normalizedAlias &&
      entry.normalizedAlias === normalizedCandidate
    ) {
      score = 100;
      rationale = 'exact alias match after cleanup';
    } else {
      for (const simplifiedCandidate of simplifiedCandidates) {
        if (!simplifiedCandidate || !entry.simplifiedAlias) {
          continue;
        }
        if (entry.simplifiedAlias === simplifiedCandidate) {
          score = Math.max(score, 92);
          rationale = 'simplified alias match';
          continue;
        }

        const shorterAliasLength = Math.min(
          entry.simplifiedAlias.length,
          simplifiedCandidate.length,
        );
        const longerAliasLength = Math.max(
          entry.simplifiedAlias.length,
          simplifiedCandidate.length,
        );
        const overlapRatio =
          longerAliasLength === 0 ? 0 : shorterAliasLength / longerAliasLength;
        if (
          shorterAliasLength >= 4 &&
          overlapRatio >= 0.55 &&
          (entry.simplifiedAlias.includes(simplifiedCandidate) ||
            simplifiedCandidate.includes(entry.simplifiedAlias))
        ) {
          score = Math.max(score, 82);
          rationale = 'partial alias overlap';
          continue;
        }

        const distance = computeLevenshteinDistance(
          entry.simplifiedAlias,
          simplifiedCandidate,
        );
        if (
          distance <= 2 &&
          Math.max(entry.simplifiedAlias.length, simplifiedCandidate.length) >=
            5
        ) {
          score = Math.max(score, 76 - distance * 6);
          rationale = 'spelling-close alias';
        }
      }
    }

    if (score === 0) {
      continue;
    }

    if (
      countryKey &&
      normalizeCountryKey(entry.port.countryName) === countryKey
    ) {
      score += 8;
      rationale = rationale || 'same-country suggestion';
    }

    const existing = suggestionScores.get(entry.port.id);
    if (existing && existing.score >= score) {
      continue;
    }

    suggestionScores.set(entry.port.id, {
      portId: entry.port.id,
      code: entry.port.code,
      name: entry.port.name,
      cityName: entry.port.cityName,
      countryName: entry.port.countryName,
      portMode: entry.port.portMode,
      confidence: score >= 90 ? 'high' : score >= 78 ? 'medium' : 'low',
      rationale: rationale || `matched through "${entry.displayAlias}" alias`,
      score,
    });
  }

  return Array.from(suggestionScores.values())
    .sort((left, right) => right.score - left.score)
    .filter((suggestion) => suggestion.score >= 78)
    .slice(0, 5)
    .map((suggestion) => ({
      portId: suggestion.portId,
      code: suggestion.code,
      name: suggestion.name,
      cityName: suggestion.cityName,
      countryName: suggestion.countryName,
      portMode: suggestion.portMode,
      confidence: suggestion.confidence,
      rationale: suggestion.rationale,
    }));
}

function recordPortLinkReview(
  portLinkReviewItems: PortLinkReviewItem[],
  recordedPortReviewKeys: Set<string>,
  input: LocationSyncInput,
  candidate: string,
  preferredModes: readonly PortMode[],
  reason: PortLinkReviewItem['reason'],
  suggestions: PortLinkReviewSuggestion[],
) {
  const normalizedCandidate = normalizeTextKey(candidate);
  const reviewKey = [
    input.vendorName ?? '',
    input.officeName ?? '',
    input.officeCountryName ?? '',
    normalizedCandidate ?? '',
    preferredModes.join(','),
    reason,
  ].join('::');
  if (recordedPortReviewKeys.has(reviewKey)) {
    return;
  }

  recordedPortReviewKeys.add(reviewKey);
  portLinkReviewItems.push({
    vendorName: input.vendorName ?? null,
    officeName: input.officeName ?? null,
    officeCountryName: input.officeCountryName,
    officeCityName: input.officeCityName,
    candidate,
    normalizedCandidate,
    preferredModes: Array.from(preferredModes),
    reason,
    suggestions,
  });
}

function comparePortsForLinking(left: PortMaster, right: PortMaster) {
  return (
    left.portMode.localeCompare(right.portMode) ||
    left.countryName.localeCompare(right.countryName) ||
    (left.cityName ?? '').localeCompare(right.cityName ?? '') ||
    left.name.localeCompare(right.name)
  );
}

function computeLevenshteinDistance(left: string, right: string) {
  if (left === right) {
    return 0;
  }
  if (!left) {
    return right.length;
  }
  if (!right) {
    return left.length;
  }

  const previousRow = Array.from(
    { length: right.length + 1 },
    (_, index) => index,
  );
  const currentRow = new Array<number>(right.length + 1).fill(0);

  for (let leftIndex = 0; leftIndex < left.length; leftIndex += 1) {
    currentRow[0] = leftIndex + 1;

    for (let rightIndex = 0; rightIndex < right.length; rightIndex += 1) {
      const substitutionCost = left[leftIndex] === right[rightIndex] ? 0 : 1;
      currentRow[rightIndex + 1] = Math.min(
        currentRow[rightIndex] + 1,
        previousRow[rightIndex + 1] + 1,
        previousRow[rightIndex] + substitutionCost,
      );
    }

    for (let index = 0; index < currentRow.length; index += 1) {
      previousRow[index] = currentRow[index];
    }
  }

  return previousRow[right.length];
}

function normalizeCountryName(value: unknown) {
  const cleaned = optionalText(value);
  if (!cleaned) {
    return null;
  }

  const normalized = normalizeSheetTitle(cleaned);
  const fixed = COUNTRY_NAME_FIXES[normalized] ?? cleaned;
  return toSmartTitleCase(fixed, undefined, {
    preserveGenericAcronyms: false,
  });
}

function normalizeCountryKey(value: unknown) {
  return normalizeTextKey(normalizeCountryName(value));
}

function normalizeLocationLabel(value: string) {
  const normalized = normalizeSheetTitle(value);
  const fixed = LOCATION_FIXES[normalized] ?? value;
  return toSmartTitleCase(fixed, undefined, {
    preserveGenericAcronyms: false,
  });
}

function cleanLocationToken(value: string | null | undefined) {
  const cleaned = optionalText(value);
  if (!cleaned) {
    return null;
  }

  const withoutNotes = cleaned
    .replace(/\(.*?temp.*?\)/gi, ' ')
    .replace(/\(.*?head office.*?\)/gi, ' ')
    .replace(/removed\s+temp\s+to\s+coc/gi, ' ')
    .replace(/\btemp basis\b/gi, ' ')
    .replace(/\bhead office\b/gi, ' ')
    .replace(/\.+$/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!withoutNotes) {
    return null;
  }

  return normalizeLocationLabel(withoutNotes);
}

function expandLocationCandidates(values: Iterable<string | null | undefined>) {
  const expanded = new Set<string>();

  for (const value of values) {
    const cleaned = cleanLocationToken(value);
    if (!cleaned) {
      continue;
    }

    expanded.add(cleaned);

    const commaHead = cleanLocationToken(cleaned.split(',')[0]);
    if (commaHead && commaHead !== cleaned) {
      expanded.add(commaHead);
    }

    const dashHead = cleanLocationToken(cleaned.split('-')[0]);
    if (dashHead && dashHead !== cleaned) {
      expanded.add(dashHead);
    }
  }

  return expanded;
}

function shouldTreatAsServiceLocation(token: string) {
  const normalized = normalizeTextKey(token);
  return (
    /\bICD\b/i.test(token) ||
    /\bCFS\b/i.test(token) ||
    /\bBUFFER\b/i.test(token) ||
    /\bYARD\b/i.test(token) ||
    /\bWAREHOUSE\b/i.test(token) ||
    /\bCUSTOMS\b/i.test(token) ||
    KNOWN_INLAND_LOCATION_KEYS.has(normalized)
  );
}

function inferPortMode(token: string) {
  return /\bAIRPORT\b|\bAIR CARGO\b/i.test(token)
    ? PortMode.AIRPORT
    : PortMode.SEAPORT;
}

function inferServiceLocationKind(token: string) {
  if (/\bICD\b/i.test(token)) {
    return ServiceLocationKind.ICD;
  }
  if (/\bCFS\b|\bBUFFER\b|\bYARD\b/i.test(token)) {
    return ServiceLocationKind.CFS;
  }
  if (/\bWAREHOUSE\b/i.test(token)) {
    return ServiceLocationKind.WAREHOUSE_ZONE;
  }
  if (/\bCUSTOMS\b/i.test(token)) {
    return ServiceLocationKind.CUSTOMS_NODE;
  }
  if (/\bAIR CARGO\b/i.test(token)) {
    return ServiceLocationKind.AIR_CARGO_AREA;
  }
  return ServiceLocationKind.INLAND_CITY;
}

function normalizeSheetTitle(value: unknown) {
  return (
    optionalText(value)
      ?.replace(/\s+Above\s+\d+\s*years/i, '')
      .toUpperCase() ?? ''
  );
}
