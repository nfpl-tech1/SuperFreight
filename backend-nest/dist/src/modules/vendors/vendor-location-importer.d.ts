import { EntityManager } from 'typeorm';
import { PortMode } from './entities/port-master.entity';
import { VendorTypeCode } from './entities/vendor-type-master.entity';
export declare const DEFAULT_ALLOWED_WCA_COUNTRIES: readonly ["China", "Thailand", "Indonesia", "United States", "Egypt", "United Kingdom", "Germany", "Malaysia", "France", "Australia", "Singapore", "Japan", "Italy", "Netherlands", "Korea"];
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
export type VendorLocationImportContext = {
    summary: LocationImportSummary;
    portLinkReviewItems: PortLinkReviewItem[];
    syncOfficeLocations: (input: LocationSyncInput) => Promise<void>;
    previewOfficeLocations: (input: LocationSyncInput) => Promise<void>;
};
export declare function createVendorLocationImportContext(manager: EntityManager, regionsWorkbookPath?: string | null, portMasterWorkbookPath?: string | null): Promise<VendorLocationImportContext>;
export declare function applyRegularWcaOverlay(manager: EntityManager, workbookPath: string, allowedCountries?: readonly string[]): Promise<RegularWcaOverlaySummary>;
export declare function auditSyntheticPortReconciliation(manager: EntityManager): Promise<SyntheticPortAuditSummary>;
export declare function reconcileSyntheticPortsWithExistingCanonicalRecords(manager: EntityManager): Promise<SyntheticPortReconciliationSummary>;
export declare function reconcileCuratedSyntheticPortMappings(manager: EntityManager, mappings: CuratedSyntheticPortMapping[]): Promise<CuratedSyntheticPortReconciliationSummary>;
export declare function splitLocationCandidates(value: string | null | undefined): string[];
export declare function resolveWcaSheetCountry(sheetName: string): string;
export declare function isAllowedWcaSheet(sheetName: string, allowedCountries?: readonly string[]): boolean;
export {};
