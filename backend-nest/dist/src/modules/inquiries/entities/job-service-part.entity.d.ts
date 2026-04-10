export declare enum JobServicePartType {
    FREIGHT = "FREIGHT",
    CHA = "CHA",
    TRANSPORTATION = "TRANSPORTATION"
}
export declare class JobServicePart {
    id: string;
    jobId: string;
    partType: JobServicePartType;
    ownerUserId: string | null;
    status: string | null;
    applicationSlug: string | null;
    meta: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
}
