export declare class QuoteMailboxScanState {
    id: string;
    mailboxOwnerUserId: string;
    lastReceivedAt: Date | null;
    lastMessageId: string | null;
    lastScanStartedAt: Date | null;
    lastScanCompletedAt: Date | null;
    lastScanStatus: string | null;
    lastError: string | null;
    createdAt: Date;
    updatedAt: Date;
}
