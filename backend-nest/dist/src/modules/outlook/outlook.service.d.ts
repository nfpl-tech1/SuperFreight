import { User } from '../users/entities/user.entity';
import { OutlookAuthService } from './outlook-auth.service';
import { OutlookMailService } from './outlook-mail.service';
import { SentMessageReference, SendMailPayload } from './outlook.types';
export declare class OutlookService {
    private readonly outlookAuthService;
    private readonly outlookMailService;
    constructor(outlookAuthService: OutlookAuthService, outlookMailService: OutlookMailService);
    getStatus(user: User): Promise<{
        isConnected: boolean;
        connectedAt: Date | null;
        mailbox: string;
        subscription: import("./entities/outlook-subscription.entity").OutlookSubscription | null;
        reconnectRequired: boolean;
    }>;
    getConnectUrl(user: User): {
        url: string;
    };
    completeConnection(user: User, code: string): Promise<{
        isConnected: boolean;
        connectedAt: Date | null;
        mailbox: string;
        subscription: import("./entities/outlook-subscription.entity").OutlookSubscription | null;
        reconnectRequired: boolean;
    }>;
    reconnect(user: User): Promise<{
        isConnected: boolean;
        connectedAt: Date | null;
        mailbox: string;
        subscription: import("./entities/outlook-subscription.entity").OutlookSubscription | null;
        reconnectRequired: boolean;
    }>;
    sendMail(user: User, payload: SendMailPayload): Promise<void>;
    sendMailTracked(user: User, payload: SendMailPayload): Promise<SentMessageReference>;
    listInboxMessagesForUser(userId: string, options?: {
        receivedAfter?: Date;
        top?: number;
    }): Promise<import("./outlook.types").GraphMessageSummary[]>;
    listMessageAttachmentsForUser(userId: string, messageId: string): Promise<import("./outlook.types").GraphMessageAttachment[]>;
    getMessageDetailsForUser(userId: string, messageId: string): Promise<import("./outlook.types").GraphMessageDetail>;
}
