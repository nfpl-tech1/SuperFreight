export declare class Rfq {
    id: string;
    inquiryId: string;
    inquiryNumber: string;
    departmentId: string;
    createdByUserId: string | null;
    formValues: Record<string, unknown>;
    vendorIds: string[];
    sent: boolean;
    subjectLine: string | null;
    promptTemplateMeta: Record<string, unknown> | null;
    sentAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
