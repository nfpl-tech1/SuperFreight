export declare class CustomerDraft {
    id: string;
    inquiryId: string;
    quoteId: string;
    generatedByUserId: string | null;
    marginPercent: number | null;
    draftBody: string;
    subjectLine: string | null;
    isSelected: boolean;
    createdAt: Date;
    updatedAt: Date;
}
