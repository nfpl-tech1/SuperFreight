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
var OutlookAuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutlookAuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const users_service_1 = require("../users/users.service");
const outlook_connection_entity_1 = require("./entities/outlook-connection.entity");
const outlook_subscription_entity_1 = require("./entities/outlook-subscription.entity");
let OutlookAuthService = class OutlookAuthService {
    static { OutlookAuthService_1 = this; }
    config;
    usersService;
    connectionRepo;
    subscriptionRepo;
    static GRAPH_BASE_URL = 'https://graph.microsoft.com/v1.0';
    static ACCESS_TOKEN_REFRESH_BUFFER_MS = 60_000;
    static SUBSCRIPTION_DURATION_MS = 1000 * 60 * 60 * 24 * 2;
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
        const response = await fetch(`${OutlookAuthService_1.GRAPH_BASE_URL}/me?$select=id,mail,userPrincipalName`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const payload = (await response
            .json()
            .catch(() => null));
        if (!response.ok || !payload?.id) {
            throw new common_1.BadRequestException('Unable to read Outlook mailbox details. Please reconnect Outlook.');
        }
        return payload;
    }
    async findConnectionByUserId(userId) {
        return this.connectionRepo.findOne({
            where: { userId },
        });
    }
    async findSubscriptionByUserId(userId) {
        return this.subscriptionRepo.findOne({
            where: { userId },
        });
    }
    hasMailboxTokens(connection) {
        return Boolean(connection?.accessToken || connection?.refreshToken);
    }
    ensureConnectionHasSupportedTokens(connection) {
        if (connection.isConnected &&
            !connection.accessToken &&
            !connection.refreshToken) {
            throw new common_1.BadRequestException('Your Outlook mailbox was linked under an older setup. Please reconnect Outlook once from onboarding or profile to enable sending.');
        }
    }
    requireConnectedMailbox(connection) {
        if (!connection?.isConnected || !connection.accessToken) {
            throw new common_1.BadRequestException('Outlook mailbox is not connected. Please connect Outlook first.');
        }
        return connection;
    }
    shouldRefreshAccessToken(connection) {
        const expiresAt = connection.accessTokenExpiresAt?.getTime() ?? 0;
        const refreshThreshold = Date.now() + OutlookAuthService_1.ACCESS_TOKEN_REFRESH_BUFFER_MS;
        return !expiresAt || expiresAt <= refreshThreshold;
    }
    buildAccessTokenExpiry(expiresInSeconds) {
        return expiresInSeconds
            ? new Date(Date.now() + expiresInSeconds * 1000)
            : null;
    }
    applyTokenPayload(connection, payload) {
        connection.accessToken = payload.access_token ?? null;
        connection.refreshToken = payload.refresh_token ?? connection.refreshToken;
        connection.accessTokenExpiresAt = this.buildAccessTokenExpiry(payload.expires_in);
        connection.isConnected = true;
    }
    applyMailboxProfile(connection, mailboxProfile, fallbackEmail) {
        connection.microsoftUserId =
            mailboxProfile.id ?? connection.microsoftUserId;
        connection.email =
            mailboxProfile.mail ??
                mailboxProfile.userPrincipalName ??
                fallbackEmail ??
                connection.email;
    }
    mergeConnectionMetadata(connection, metadata) {
        connection.metadata = {
            ...(connection.metadata ?? {}),
            ...metadata,
        };
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
        this.applyTokenPayload(connection, payload);
        const profile = await this.fetchMailboxProfile(connection.accessToken);
        this.applyMailboxProfile(connection, profile);
        connection.tenantId = connection.tenantId ?? tenantId;
        connection.connectedAt = connection.connectedAt ?? new Date();
        this.mergeConnectionMetadata(connection, {
            lastRefreshAt: new Date().toISOString(),
        });
        return this.connectionRepo.save(connection);
    }
    async getValidConnectionForUser(userId) {
        const connection = await this.findConnectionByUserId(userId);
        if (connection) {
            this.ensureConnectionHasSupportedTokens(connection);
        }
        const connectedMailbox = this.requireConnectedMailbox(connection);
        if (this.shouldRefreshAccessToken(connectedMailbox)) {
            return this.refreshConnectionAccessToken(connectedMailbox);
        }
        return connectedMailbox;
    }
    buildStatus(user, connection, subscription) {
        const hasMailboxTokens = this.hasMailboxTokens(connection);
        return {
            isConnected: !!connection?.isConnected && hasMailboxTokens,
            connectedAt: connection?.connectedAt ?? null,
            mailbox: connection?.email ?? user.email,
            subscription: subscription ?? null,
            reconnectRequired: !!connection && (!connection.isConnected || !hasMailboxTokens),
        };
    }
    async findOrCreateConnection(userId) {
        const existingConnection = await this.findConnectionByUserId(userId);
        if (existingConnection) {
            return existingConnection;
        }
        return this.connectionRepo.create({ userId });
    }
    applyConnectedMailboxState(connection, user, tenantId, scope, tokenPayload, mailboxProfile, now) {
        connection.isConnected = true;
        connection.connectedAt = now;
        connection.tenantId = tenantId;
        this.applyMailboxProfile(connection, mailboxProfile, user.email);
        this.applyTokenPayload(connection, tokenPayload);
        this.mergeConnectionMetadata(connection, {
            lastCodeExchange: now.toISOString(),
            scope,
        });
    }
    async findOrCreateSubscription(userId) {
        const existingSubscription = await this.findSubscriptionByUserId(userId);
        if (existingSubscription) {
            return existingSubscription;
        }
        return this.subscriptionRepo.create({ userId });
    }
    applyActiveSubscriptionState(subscription, userId, now) {
        subscription.subscriptionId =
            subscription.subscriptionId ?? `${userId}-mail`;
        subscription.resource = '/me/messages';
        subscription.isActive = true;
        subscription.expiresAt = new Date(now.getTime() + OutlookAuthService_1.SUBSCRIPTION_DURATION_MS);
    }
    async upsertActiveSubscription(userId, now) {
        const subscription = await this.findOrCreateSubscription(userId);
        this.applyActiveSubscriptionState(subscription, userId, now);
        return this.subscriptionRepo.save(subscription);
    }
    async reactivateExistingSubscription(userId, now) {
        const subscription = await this.findSubscriptionByUserId(userId);
        if (!subscription) {
            return null;
        }
        this.applyActiveSubscriptionState(subscription, userId, now);
        return this.subscriptionRepo.save(subscription);
    }
    async getStatus(user) {
        const connection = await this.findConnectionByUserId(user.id);
        const subscription = await this.findSubscriptionByUserId(user.id);
        return this.buildStatus(user, connection, subscription);
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
        const connection = await this.findOrCreateConnection(user.id);
        this.applyConnectedMailboxState(connection, user, tenantId, scope, tokenPayload, mailboxProfile, now);
        await this.connectionRepo.save(connection);
        await this.upsertActiveSubscription(user.id, now);
        await this.usersService.markOutlookConnected(user.id, now);
        return this.getStatus({
            ...user,
            outlookConnectedAt: now,
        });
    }
    async reconnect(user) {
        const connection = await this.findConnectionByUserId(user.id);
        if (connection?.refreshToken) {
            await this.refreshConnectionAccessToken(connection);
        }
        await this.reactivateExistingSubscription(user.id, new Date());
        return this.getStatus(user);
    }
};
exports.OutlookAuthService = OutlookAuthService;
exports.OutlookAuthService = OutlookAuthService = OutlookAuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(outlook_connection_entity_1.OutlookConnection)),
    __param(3, (0, typeorm_1.InjectRepository)(outlook_subscription_entity_1.OutlookSubscription)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        users_service_1.UsersService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], OutlookAuthService);
//# sourceMappingURL=outlook-auth.service.js.map