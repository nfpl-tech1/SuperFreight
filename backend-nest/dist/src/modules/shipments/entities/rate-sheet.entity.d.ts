export declare class RateSheet {
    id: string;
    shippingLine: string;
    tradeLane: string | null;
    currency: string | null;
    amount: number | null;
    effectiveMonth: string | null;
    notes: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
}
