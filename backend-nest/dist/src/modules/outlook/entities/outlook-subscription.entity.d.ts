export declare class OutlookSubscription {
    id: string;
    userId: string;
    subscriptionId: string | null;
    resource: string | null;
    expiresAt: Date | null;
    isActive: boolean;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
}
