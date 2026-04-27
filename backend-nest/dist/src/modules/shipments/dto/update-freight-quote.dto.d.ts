export declare class UpdateFreightQuoteDto {
    vendorName?: string;
    currency?: string;
    totalRate?: number;
    freightRate?: number;
    localCharges?: number;
    documentation?: number;
    transitDays?: number;
    validUntil?: string;
    remarks?: string;
    reviewStatus?: string;
    extractedFields?: Record<string, unknown>;
    comparisonFields?: Record<string, unknown>;
}
