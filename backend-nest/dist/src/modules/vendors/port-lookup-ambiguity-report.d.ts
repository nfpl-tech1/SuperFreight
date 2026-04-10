import { DataSource } from 'typeorm';
import { PortMode } from './entities/port-master.entity';
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
    resolutionMethod: 'exact_code_distinguishes_country' | 'exact_code_distinguishes_airport';
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
export type PortLookupAmbiguityReports = {
    raw: PortLookupIssueReport<PortLookupIssue>;
    resolved: PortLookupIssueReport<PortLookupResolvedIssue>;
    unresolved: PortLookupIssueReport<PortLookupUnresolvedIssue>;
};
export declare function generatePortLookupAmbiguityReports(dataSource: DataSource, portMode: PortMode): Promise<PortLookupAmbiguityReports>;
export {};
