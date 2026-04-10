export declare class CreateFreightQuoteDto {
    inquiryId: string;
    rfqId?: string;
    vendorId?: string;
    vendorName: string;
    currency?: string;
    totalRate?: number;
    freightRate?: number;
    localCharges?: number;
    documentation?: number;
    transitDays?: number;
    validUntil?: string;
    remarks?: string;
    extractedFields?: Record<string, unknown>;
}
