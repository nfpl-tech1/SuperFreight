"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OutlookMailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutlookMailService = void 0;
const common_1 = require("@nestjs/common");
const outlook_auth_service_1 = require("./outlook-auth.service");
let OutlookMailService = class OutlookMailService {
    static { OutlookMailService_1 = this; }
    outlookAuthService;
    static GRAPH_BASE_URL = 'https://graph.microsoft.com/v1.0';
    static IMMUTABLE_ID_HEADER = 'IdType="ImmutableId"';
    static TEXT_BODY_HEADER = 'outlook.body-content-type="text"';
    constructor(outlookAuthService) {
        this.outlookAuthService = outlookAuthService;
    }
    async sendGraphMailRequest(accessToken, body) {
        const response = await fetch(`${OutlookMailService_1.GRAPH_BASE_URL}/me/sendMail`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        if (response.ok) {
            return;
        }
        const payload = (await response.json().catch(() => null));
        throw new common_1.BadRequestException(payload?.error?.message || 'Unable to send mail through Outlook.');
    }
    buildPreferHeader(...values) {
        return values.join(', ');
    }
    async getGraphJson(accessToken, path, options = {}) {
        const response = await fetch(`${OutlookMailService_1.GRAPH_BASE_URL}${path}`, {
            method: options.method ?? 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                ...(options.body ? { 'Content-Type': 'application/json' } : {}),
                ...(options.prefer?.length
                    ? { Prefer: this.buildPreferHeader(...options.prefer) }
                    : {}),
            },
            ...(options.body ? { body: JSON.stringify(options.body) } : {}),
        });
        const payload = (await response.json().catch(() => null));
        if (!response.ok || !payload) {
            throw new common_1.BadRequestException(payload?.error?.message ||
                'Unable to read mail from Outlook. Please reconnect Outlook.');
        }
        return payload;
    }
    async postGraphRequest(accessToken, path, body, options = {}) {
        const response = await fetch(`${OutlookMailService_1.GRAPH_BASE_URL}${path}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                ...(body ? { 'Content-Type': 'application/json' } : {}),
                ...(options.prefer?.length
                    ? { Prefer: this.buildPreferHeader(...options.prefer) }
                    : {}),
            },
            ...(body ? { body: JSON.stringify(body) } : {}),
        });
        if (response.ok) {
            if (response.status === 204) {
                return null;
            }
            return response.json().catch(() => null);
        }
        const payload = (await response.json().catch(() => null));
        throw new common_1.BadRequestException(payload?.error?.message ||
            'Unable to complete the Outlook mail request.');
    }
    mapGraphRecipients(recipients) {
        return recipients.map((recipient) => ({
            emailAddress: {
                address: recipient.address,
                name: recipient.name ?? undefined,
            },
        }));
    }
    mapGraphAttachments(attachments = []) {
        return attachments.map((attachment) => ({
            '@odata.type': '#microsoft.graph.fileAttachment',
            name: attachment.fileName,
            contentType: attachment.contentType,
            contentBytes: attachment.contentBytes,
        }));
    }
    buildSendMailRequestBody(payload) {
        return {
            message: {
                subject: payload.subject,
                body: {
                    contentType: 'HTML',
                    content: payload.htmlBody,
                },
                toRecipients: this.mapGraphRecipients(payload.to),
                ccRecipients: this.mapGraphRecipients(payload.cc ?? []),
                attachments: this.mapGraphAttachments(payload.attachments),
            },
            saveToSentItems: true,
        };
    }
    async createDraftMessage(connection, requestBody) {
        const response = await this.getGraphJson(connection.accessToken, '/me/messages', {
            method: 'POST',
            body: requestBody.message,
            prefer: [OutlookMailService_1.IMMUTABLE_ID_HEADER],
        });
        return response;
    }
    async sendDraftMessage(connection, messageId) {
        await this.postGraphRequest(connection.accessToken, `/me/messages/${messageId}/send`, undefined, {
            prefer: [OutlookMailService_1.IMMUTABLE_ID_HEADER],
        });
    }
    async getMessageById(connection, messageId, bodyContentType = 'text') {
        const prefer = [OutlookMailService_1.IMMUTABLE_ID_HEADER];
        if (bodyContentType === 'text') {
            prefer.push(OutlookMailService_1.TEXT_BODY_HEADER);
        }
        return this.getGraphJson(connection.accessToken, `/me/messages/${messageId}?$select=id,internetMessageId,conversationId,createdDateTime,sentDateTime,receivedDateTime,subject,webLink,hasAttachments,bodyPreview,body,from,isDraft`, {
            prefer,
        });
    }
    async waitForSentMessage(connection, draftMessage) {
        const attempts = 4;
        for (let attempt = 0; attempt < attempts; attempt += 1) {
            try {
                const sentMessage = await this.getMessageById(connection, draftMessage.id);
                if (!sentMessage.isDraft) {
                    return sentMessage;
                }
            }
            catch {
            }
            await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
        }
        return draftMessage;
    }
    toSentMessageReference(message) {
        return {
            id: message.id,
            internetMessageId: message.internetMessageId ?? null,
            conversationId: message.conversationId ?? null,
            webLink: message.webLink ?? null,
            subject: message.subject ?? null,
            createdDateTime: message.createdDateTime ?? null,
            sentDateTime: message.sentDateTime ?? null,
        };
    }
    async sendMailWithRetry(connection, requestBody) {
        try {
            await this.sendGraphMailRequest(connection.accessToken, requestBody);
        }
        catch {
            const refreshedConnection = await this.outlookAuthService.refreshConnectionAccessToken(connection);
            await this.sendGraphMailRequest(refreshedConnection.accessToken, requestBody);
        }
    }
    buildInboxMessagesPath(receivedAfter, top = 50) {
        const params = new URLSearchParams({
            $top: String(top),
            $orderby: 'receivedDateTime asc',
            $select: 'id,internetMessageId,conversationId,receivedDateTime,subject,webLink,hasAttachments,bodyPreview,from',
        });
        if (receivedAfter) {
            params.set('$filter', `receivedDateTime ge ${receivedAfter.toISOString()}`);
        }
        return `/me/messages?${params.toString()}`;
    }
    async listInboxMessagesForUser(userId, options = {}) {
        const connection = await this.outlookAuthService.getValidConnectionForUser(userId);
        const response = await this.getGraphJson(connection.accessToken, this.buildInboxMessagesPath(options.receivedAfter, options.top));
        return response.value ?? [];
    }
    async getMessageDetailsForUser(userId, messageId) {
        const connection = await this.outlookAuthService.getValidConnectionForUser(userId);
        return this.getMessageById(connection, messageId);
    }
    async listMessageAttachmentsForUser(userId, messageId) {
        const connection = await this.outlookAuthService.getValidConnectionForUser(userId);
        const response = await this.getGraphJson(connection.accessToken, `/me/messages/${messageId}/attachments?$select=id,name,contentType,size,isInline,lastModifiedDateTime,contentBytes`, {
            prefer: [OutlookMailService_1.IMMUTABLE_ID_HEADER],
        });
        return response.value ?? [];
    }
    async sendMail(user, payload) {
        const connection = await this.outlookAuthService.getValidConnectionForUser(user.id);
        const requestBody = this.buildSendMailRequestBody(payload);
        await this.sendMailWithRetry(connection, requestBody);
    }
    async sendMailTracked(user, payload) {
        const connection = await this.outlookAuthService.getValidConnectionForUser(user.id);
        const requestBody = this.buildSendMailRequestBody(payload);
        const draftMessage = await this.createDraftMessage(connection, requestBody);
        try {
            await this.sendDraftMessage(connection, draftMessage.id);
        }
        catch {
            const refreshedConnection = await this.outlookAuthService.refreshConnectionAccessToken(connection);
            await this.sendDraftMessage(refreshedConnection, draftMessage.id);
        }
        const sentMessage = await this.waitForSentMessage(connection, draftMessage);
        return this.toSentMessageReference(sentMessage);
    }
};
exports.OutlookMailService = OutlookMailService;
exports.OutlookMailService = OutlookMailService = OutlookMailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [outlook_auth_service_1.OutlookAuthService])
], OutlookMailService);
//# sourceMappingURL=outlook-mail.service.js.map