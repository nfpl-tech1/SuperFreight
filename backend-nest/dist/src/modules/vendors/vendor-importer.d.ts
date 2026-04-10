import { DataSource } from 'typeorm';
import { type LocationImportSummary, type PortLinkReviewItem, type RegularWcaOverlaySummary } from './vendor-location-importer';
export type { PortLinkReviewItem } from './vendor-location-importer';
type ImportMode = 'dry-run' | 'apply';
type WorkbookKind = 'domestic' | 'wca' | 'regular_wca' | 'template' | 'carrier';
type RowRecord = Record<string, unknown>;
type WorkbookStats = {
    workbook: string;
    sheetsProcessed: number;
    rowsRead: number;
    rowsSkipped: number;
};
export type VendorImportOptions = {
    mode: ImportMode;
    domesticWorkbookPath: string;
    wcaWorkbookPath?: string | null;
    importTemplateWorkbookPath?: string | null;
    regionsWorkbookPath?: string | null;
    portMasterWorkbookPath?: string | null;
    carrierWorkbookPath?: string | null;
    regularWcaWorkbookPath?: string | null;
    wcaCountries?: string[];
    linkLocations?: boolean;
    replaceExisting?: boolean;
    onSkippedRow?: (row: VendorSkippedRow) => void;
    onPortLinkReviewItem?: (item: PortLinkReviewItem) => void;
};
export type VendorSkippedRow = {
    workbook: string;
    kind: WorkbookKind;
    sheetName: string;
    rowNumber: number;
    reason: 'missing_company' | 'unsupported_sheet' | 'unresolved';
    rowData: RowRecord;
};
export type VendorImportSummary = {
    mode: ImportMode;
    sourceFiles: {
        domesticWorkbookPath: string;
        wcaWorkbookPath: string | null;
        importTemplateWorkbookPath: string | null;
        regionsWorkbookPath: string | null;
        portMasterWorkbookPath: string | null;
        carrierWorkbookPath: string | null;
        regularWcaWorkbookPath: string | null;
    };
    rowsRead: number;
    rowsSkipped: number;
    warnings: string[];
    vendors: number;
    offices: number;
    contacts: number;
    ccRecipients: number;
    officeTypeLinks: number;
    portLinkReviewCount: number;
    workbookSummaries: WorkbookStats[];
    locationSummary?: LocationImportSummary;
    regularWcaOverlaySummary?: RegularWcaOverlaySummary;
    databaseSummary?: {
        vendors: number;
        offices: number;
        contacts: number;
        ccRecipients: number;
        officeTypeLinks: number;
        locationSummary?: LocationImportSummary;
        regularWcaOverlaySummary?: RegularWcaOverlaySummary;
    };
};
export declare function runVendorImport(dataSource: DataSource, options: VendorImportOptions): Promise<VendorImportSummary>;
