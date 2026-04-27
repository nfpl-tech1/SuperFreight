export declare enum QuoteInboundMessageStatus {
    IGNORED = "ignored",
    UNMATCHED = "unmatched",
    EXTRACTION_PENDING = "extraction_pending",
    NEEDS_REVIEW = "needs_review",
    FINALIZED = "finalized",
    FAILED = "failed"
}
export declare class QuoteInboundMessage {
    id: string;
    mailboxOwnerUserId: string;
    outlookMessageId: string;
    internetMessageId: string | null;
    conversationId: string | null;
    receivedAt: Date;
    fromEmail: string | null;
    fromName: string | null;
    subject: string | null;
    bodyPreview: string | null;
    webLink: string | null;
    hasAttachments: boolean;
    matchedInquiryId: string | null;
    matchedRfqId: string | null;
    matchedVendorId: string | null;
    status: QuoteInboundMessageStatus;
    ignoreReason: string | null;
    failureReason: string | null;
    rawMetadata: Record<string, unknown> | null;
    attachmentMetadata: Record<string, unknown>[] | null;
    processedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
