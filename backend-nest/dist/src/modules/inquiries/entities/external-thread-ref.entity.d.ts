export declare class ExternalThreadRef {
    id: string;
    inquiryId: string;
    participantType: string;
    participantEmail: string | null;
    conversationId: string | null;
    messageId: string | null;
    internetMessageId: string | null;
    webLink: string | null;
    lastActivityAt: Date | null;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
}
