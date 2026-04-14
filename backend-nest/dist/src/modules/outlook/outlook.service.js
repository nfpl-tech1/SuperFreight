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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var OutlookService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutlookService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const users_service_1 = require("../users/users.service");
const outlook_connection_entity_1 = require("./entities/outlook-connection.entity");
const outlook_subscription_entity_1 = require("./entities/outlook-subscription.entity");
let OutlookService = class OutlookService {
    static { OutlookService_1 = this; }
    config;
    usersService;
    connectionRepo;
    subscriptionRepo;
    static GRAPH_BASE_URL = 'https://graph.microsoft.com/v1.0';
    constructor(config, usersService, connectionRepo, subscriptionRepo) {
        this.config = config;
        this.usersService = usersService;
        this.connectionRepo = connectionRepo;
        this.subscriptionRepo = subscriptionRepo;
    }
    getScopes() {
        return [
            'offline_access',
            'openid',
            'profile',
            'email',
            'User.Read',
            'Mail.Read',
            'Mail.Send',
        ];
    }
    getMicrosoftConfig() {
        const tenantId = this.config.get('microsoft.tenantId');
        const clientId = this.config.get('microsoft.clientId');
        const clientSecret = this.config.get('microsoft.clientSecret');
        const redirectUri = this.config.get('microsoft.redirectUri');
        if (!tenantId || !clientId || !clientSecret || !redirectUri) {
            throw new common_1.ServiceUnavailableException('Microsoft Outlook integration is not configured.');
        }
        return {
            tenantId,
            clientId,
            clientSecret,
            redirectUri,
            scope: this.getScopes().join(' '),
        };
    }
    async exchangeToken(params, tenantId) {
        const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(params).toString(),
        });
        const payload = (await response
            .json()
            .catch(() => null));
        if (!response.ok || !payload?.access_token) {
            throw new common_1.BadRequestException(payload?.error_description ||
                'Microsoft authentication failed. Please reconnect Outlook.');
        }
        return payload;
    }
    async fetchMailboxProfile(accessToken) {
        const response = await fetch(`${OutlookService_1.GRAPH_BASE_URL}/me?$select=id,mail,userPrincipalName`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const payload = (await response.json().catch(() => null));
        if (!response.ok || !payload?.id) {
            throw new common_1.BadRequestException('Unable to read Outlook mailbox details. Please reconnect Outlook.');
        }
        return payload;
    }
    async refreshConnectionAccessToken(connection) {
        const { tenantId, clientId, clientSecret, redirectUri, scope } = this.getMicrosoftConfig();
        if (!connection.refreshToken) {
            throw new common_1.BadRequestException('Outlook connection is missing a refresh token. Please reconnect Outlook.');
        }
        const payload = await this.exchangeToken({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: connection.refreshToken,
            redirect_uri: redirectUri,
            grant_type: 'refresh_token',
            scope,
        }, tenantId);
        connection.accessToken = payload.access_token ?? null;
        connection.refreshToken = payload.refresh_token ?? connection.refreshToken;
        connection.accessTokenExpiresAt = payload.expires_in
            ? new Date(Date.now() + payload.expires_in * 1000)
            : null;
        connection.isConnected = true;
        const profile = await this.fetchMailboxProfile(connection.accessToken);
        connection.microsoftUserId = profile.id ?? connection.microsoftUserId;
        connection.email =
            profile.mail ?? profile.userPrincipalName ?? connection.email;
        connection.tenantId = connection.tenantId ?? tenantId;
        connection.connectedAt = connection.connectedAt ?? new Date();
        connection.metadata = {
            ...(connection.metadata ?? {}),
            lastRefreshAt: new Date().toISOString(),
        };
        return this.connectionRepo.save(connection);
    }
    async getValidConnectionForUser(userId) {
        const connection = await this.connectionRepo.findOne({
            where: { userId },
        });
        if (connection?.isConnected &&
            !connection.accessToken &&
            !connection.refreshToken) {
            throw new common_1.BadRequestException('Your Outlook mailbox was linked under an older setup. Please reconnect Outlook once from onboarding or profile to enable sending.');
        }
        if (!connection?.isConnected || !connection.accessToken) {
            throw new common_1.BadRequestException('Outlook mailbox is not connected. Please connect Outlook first.');
        }
        const expiresAt = connection.accessTokenExpiresAt?.getTime() ?? 0;
        const refreshThreshold = Date.now() + 60_000;
        if (!expiresAt || expiresAt <= refreshThreshold) {
            return this.refreshConnectionAccessToken(connection);
        }
        return connection;
    }
    async sendGraphMailRequest(accessToken, body) {
        const response = await fetch(`${OutlookService_1.GRAPH_BASE_URL}/me/sendMail`, {
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
    async getStatus(user) {
        const connection = await this.connectionRepo.findOne({
            where: { userId: user.id },
        });
        const subscription = await this.subscriptionRepo.findOne({
            where: { userId: user.id },
        });
        const hasMailboxTokens = Boolean(connection?.accessToken || connection?.refreshToken);
        return {
            isConnected: !!connection?.isConnected && hasMailboxTokens,
            connectedAt: connection?.connectedAt ?? null,
            mailbox: connection?.email ?? user.email,
            subscription: subscription ?? null,
            reconnectRequired: !!connection && (!connection.isConnected || !hasMailboxTokens),
        };
    }
    getConnectUrl(user) {
        const { tenantId, clientId, redirectUri, scope } = this.getMicrosoftConfig();
        const url = new URL(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`);
        url.searchParams.set('client_id', clientId);
        url.searchParams.set('response_type', 'code');
        url.searchParams.set('redirect_uri', redirectUri);
        url.searchParams.set('response_mode', 'query');
        url.searchParams.set('scope', scope);
        url.searchParams.set('state', user.id);
        return { url: url.toString() };
    }
    async completeConnection(user, code) {
        const { tenantId, clientId, clientSecret, redirectUri, scope } = this.getMicrosoftConfig();
        const tokenPayload = await this.exchangeToken({
            client_id: clientId,
            client_secret: clientSecret,
            code,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
            scope,
        }, tenantId);
        const mailboxProfile = await this.fetchMailboxProfile(tokenPayload.access_token);
        const now = new Date();
        let connection = await this.connectionRepo.findOne({
            where: { userId: user.id },
        });
        if (!connection) {
            connection = this.connectionRepo.create({ userId: user.id });
        }
        connection.isConnected = true;
        connection.connectedAt = now;
        connection.tenantId = tenantId;
        connection.microsoftUserId = mailboxProfile.id ?? null;
        connection.email =
            mailboxProfile.mail ?? mailboxProfile.userPrincipalName ?? user.email;
        connection.accessToken = tokenPayload.access_token ?? null;
        connection.refreshToken = tokenPayload.refresh_token ?? null;
        connection.accessTokenExpiresAt = tokenPayload.expires_in
            ? new Date(Date.now() + tokenPayload.expires_in * 1000)
            : null;
        connection.metadata = {
            ...(connection.metadata ?? {}),
            lastCodeExchange: now.toISOString(),
            scope,
        };
        await this.connectionRepo.save(connection);
        let subscription = await this.subscriptionRepo.findOne({
            where: { userId: user.id },
        });
        if (!subscription) {
            subscription = this.subscriptionRepo.create({ userId: user.id });
        }
        subscription.subscriptionId =
            subscription.subscriptionId ?? `${user.id}-mail`;
        subscription.resource = '/me/messages';
        subscription.isActive = true;
        subscription.expiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 2);
        await this.subscriptionRepo.save(subscription);
        await this.usersService.markOutlookConnected(user.id, now);
        return this.getStatus({
            ...user,
            outlookConnectedAt: now,
        });
    }
    async reconnect(user) {
        const connection = await this.connectionRepo.findOne({
            where: { userId: user.id },
        });
        if (connection?.refreshToken) {
            await this.refreshConnectionAccessToken(connection);
        }
        const subscription = await this.subscriptionRepo.findOne({
            where: { userId: user.id },
        });
        if (subscription) {
            subscription.isActive = true;
            subscription.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 2);
            await this.subscriptionRepo.save(subscription);
        }
        return this.getStatus(user);
    }
    async sendMail(user, payload) {
        const connection = await this.getValidConnectionForUser(user.id);
        const requestBody = {
            message: {
                subject: payload.subject,
                body: {
                    contentType: 'HTML',
                    content: payload.htmlBody,
                },
                toRecipients: payload.to.map((recipient) => ({
                    emailAddress: {
                        address: recipient.address,
                        name: recipient.name ?? undefined,
                    },
                })),
                ccRecipients: (payload.cc ?? []).map((recipient) => ({
                    emailAddress: {
                        address: recipient.address,
                        name: recipient.name ?? undefined,
                    },
                })),
                attachments: (payload.attachments ?? []).map((attachment) => ({
                    '@odata.type': '#microsoft.graph.fileAttachment',
                    name: attachment.fileName,
                    contentType: attachment.contentType,
                    contentBytes: attachment.contentBytes,
                })),
            },
            saveToSentItems: true,
        };
        try {
            await this.sendGraphMailRequest(connection.accessToken, requestBody);
        }
        catch {
            const refreshedConnection = await this.refreshConnectionAccessToken(connection);
            await this.sendGraphMailRequest(refreshedConnection.accessToken, requestBody);
        }
    }
};
exports.OutlookService = OutlookService;
exports.OutlookService = OutlookService = OutlookService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(outlook_connection_entity_1.OutlookConnection)),
    __param(3, (0, typeorm_1.InjectRepository)(outlook_subscription_entity_1.OutlookSubscription)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        users_service_1.UsersService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], OutlookService);
//# sourceMappingURL=outlook.service.js.map