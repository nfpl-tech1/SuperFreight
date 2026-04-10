export declare class OutlookConnection {
    id: string;
    userId: string;
    tenantId: string | null;
    microsoftUserId: string | null;
    email: string | null;
    accessToken: string | null;
    refreshToken: string | null;
    accessTokenExpiresAt: Date | null;
    isConnected: boolean;
    connectedAt: Date | null;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
}
