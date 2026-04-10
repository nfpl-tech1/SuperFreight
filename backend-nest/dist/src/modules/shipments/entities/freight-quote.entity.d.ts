export declare class FreightQuote {
    id: string;
    inquiryId: string;
    rfqId: string | null;
    vendorId: string | null;
    vendorName: string;
    currency: string | null;
    totalRate: number | null;
    freightRate: number | null;
    localCharges: number | null;
    documentation: number | null;
    transitDays: number | null;
    validUntil: string | null;
    sourceThreadRefId: string | null;
    extractedFields: Record<string, unknown> | null;
    quotePromptSnapshot: Record<string, unknown> | null;
    remarks: string | null;
    isSelected: boolean;
    createdAt: Date;
    updatedAt: Date;
}
