import { User } from '../users/entities/user.entity';
import { OutlookAuthService } from './outlook-auth.service';
import { GraphMessageAttachment, GraphMessageDetail, GraphMessageSummary, SentMessageReference, SendMailPayload } from './outlook.types';
export declare class OutlookMailService {
    private readonly outlookAuthService;
    private static readonly GRAPH_BASE_URL;
    private static readonly IMMUTABLE_ID_HEADER;
    private static readonly TEXT_BODY_HEADER;
    constructor(outlookAuthService: OutlookAuthService);
    private sendGraphMailRequest;
    private buildPreferHeader;
    private getGraphJson;
    private postGraphRequest;
    private mapGraphRecipients;
    private mapGraphAttachments;
    private buildSendMailRequestBody;
    private createDraftMessage;
    private sendDraftMessage;
    private getMessageById;
    private waitForSentMessage;
    private toSentMessageReference;
    private sendMailWithRetry;
    private buildInboxMessagesPath;
    listInboxMessagesForUser(userId: string, options?: {
        receivedAfter?: Date;
        top?: number;
    }): Promise<GraphMessageSummary[]>;
    getMessageDetailsForUser(userId: string, messageId: string): Promise<GraphMessageDetail>;
    listMessageAttachmentsForUser(userId: string, messageId: string): Promise<GraphMessageAttachment[]>;
    sendMail(user: User, payload: SendMailPayload): Promise<void>;
    sendMailTracked(user: User, payload: SendMailPayload): Promise<SentMessageReference>;
}
