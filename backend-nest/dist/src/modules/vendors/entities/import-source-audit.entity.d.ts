export declare enum ImportSourceAuditEntityKind {
    VENDOR = "VENDOR",
    OFFICE = "OFFICE",
    PORT = "PORT",
    SERVICE_LOCATION = "SERVICE_LOCATION",
    PORT_LINK = "PORT_LINK",
    SERVICE_LOCATION_LINK = "SERVICE_LOCATION_LINK",
    CONTACT = "CONTACT"
}
export declare enum ImportSourceAuditAction {
    CREATED = "CREATED",
    UPDATED = "UPDATED",
    SKIPPED = "SKIPPED",
    REVIEW_REQUIRED = "REVIEW_REQUIRED"
}
export declare class ImportSourceAudit {
    id: string;
    sourceWorkbook: string;
    sourceSheet: string;
    sourceRowNumber: number;
    entityKind: ImportSourceAuditEntityKind;
    action: ImportSourceAuditAction;
    confidence: string | null;
    normalizedKey: string | null;
    vendorId: string | null;
    officeId: string | null;
    portId: string | null;
    serviceLocationId: string | null;
    reason: string | null;
    rawPayloadJson: Record<string, unknown> | null;
    createdAt: Date;
}
