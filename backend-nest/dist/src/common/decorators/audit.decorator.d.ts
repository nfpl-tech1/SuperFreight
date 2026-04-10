export declare const AUDIT_KEY = "audit";
export interface AuditMetadata {
    action: string;
    resourceType?: string;
}
export declare const Audit: (action: string, resourceType?: string) => import("@nestjs/common").CustomDecorator<string>;
