export type QuoteIgnoreRuleConditions = {
    senderEmailEquals?: string[];
    senderDomainEquals?: string[];
    subjectContains?: string[];
    bodyContains?: string[];
    hasAttachments?: boolean;
    applyWhenUnmatchedOnly?: boolean;
};
export declare class QuoteIgnoreRule {
    id: string;
    mailboxOwnerUserId: string | null;
    name: string;
    priority: number;
    isActive: boolean;
    conditions: QuoteIgnoreRuleConditions;
    createdByUserId: string | null;
    createdAt: Date;
    updatedAt: Date;
}
