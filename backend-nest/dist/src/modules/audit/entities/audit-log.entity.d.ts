export declare class AuditLog {
    id: number;
    userId: string;
    userEmail: string;
    action: string;
    resourceType: string;
    resourceId: string;
    metadata: Record<string, unknown>;
    createdAt: Date;
}
