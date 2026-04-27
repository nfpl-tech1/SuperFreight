import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { OutlookConnection } from './entities/outlook-connection.entity';
import { OutlookSubscription } from './entities/outlook-subscription.entity';
import {
  MicrosoftConfig,
  OutlookMailboxProfile,
  OutlookTokenPayload,
} from './outlook.types';

@Injectable()
export class OutlookAuthService {
  private static readonly GRAPH_BASE_URL = 'https://graph.microsoft.com/v1.0';
  private static readonly ACCESS_TOKEN_REFRESH_BUFFER_MS = 60_000;
  private static readonly SUBSCRIPTION_DURATION_MS = 1000 * 60 * 60 * 24 * 2;

  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
    @InjectRepository(OutlookConnection)
    private readonly connectionRepo: Repository<OutlookConnection>,
    @InjectRepository(OutlookSubscription)
    private readonly subscriptionRepo: Repository<OutlookSubscription>,
  ) {}

  private getScopes() {
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

  private getMicrosoftConfig(): MicrosoftConfig {
    const tenantId = this.config.get<string>('microsoft.tenantId');
    const clientId = this.config.get<string>('microsoft.clientId');
    const clientSecret = this.config.get<string>('microsoft.clientSecret');
    const redirectUri = this.config.get<string>('microsoft.redirectUri');

    if (!tenantId || !clientId || !clientSecret || !redirectUri) {
      throw new ServiceUnavailableException(
        'Microsoft Outlook integration is not configured.',
      );
    }

    return {
      tenantId,
      clientId,
      clientSecret,
      redirectUri,
      scope: this.getScopes().join(' '),
    };
  }

  private async exchangeToken(
    params: Record<string, string>,
    tenantId: string,
  ) {
    const response = await fetch(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(params).toString(),
      },
    );

    const payload = (await response
      .json()
      .catch(() => null)) as OutlookTokenPayload | null;

    if (!response.ok || !payload?.access_token) {
      throw new BadRequestException(
        payload?.error_description ||
          'Microsoft authentication failed. Please reconnect Outlook.',
      );
    }

    return payload;
  }

  private async fetchMailboxProfile(accessToken: string) {
    const response = await fetch(
      `${OutlookAuthService.GRAPH_BASE_URL}/me?$select=id,mail,userPrincipalName`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const payload = (await response
      .json()
      .catch(() => null)) as OutlookMailboxProfile | null;

    if (!response.ok || !payload?.id) {
      throw new BadRequestException(
        'Unable to read Outlook mailbox details. Please reconnect Outlook.',
      );
    }

    return payload;
  }

  private async findConnectionByUserId(userId: string) {
    return this.connectionRepo.findOne({
      where: { userId },
    });
  }

  private async findSubscriptionByUserId(userId: string) {
    return this.subscriptionRepo.findOne({
      where: { userId },
    });
  }

  private hasMailboxTokens(connection: OutlookConnection | null | undefined) {
    return Boolean(connection?.accessToken || connection?.refreshToken);
  }

  private ensureConnectionHasSupportedTokens(connection: OutlookConnection) {
    if (
      connection.isConnected &&
      !connection.accessToken &&
      !connection.refreshToken
    ) {
      throw new BadRequestException(
        'Your Outlook mailbox was linked under an older setup. Please reconnect Outlook once from onboarding or profile to enable sending.',
      );
    }
  }

  private requireConnectedMailbox(connection: OutlookConnection | null) {
    if (!connection?.isConnected || !connection.accessToken) {
      throw new BadRequestException(
        'Outlook mailbox is not connected. Please connect Outlook first.',
      );
    }

    return connection;
  }

  private shouldRefreshAccessToken(connection: OutlookConnection) {
    const expiresAt = connection.accessTokenExpiresAt?.getTime() ?? 0;
    const refreshThreshold =
      Date.now() + OutlookAuthService.ACCESS_TOKEN_REFRESH_BUFFER_MS;

    return !expiresAt || expiresAt <= refreshThreshold;
  }

  private buildAccessTokenExpiry(expiresInSeconds?: number) {
    return expiresInSeconds
      ? new Date(Date.now() + expiresInSeconds * 1000)
      : null;
  }

  private applyTokenPayload(
    connection: OutlookConnection,
    payload: OutlookTokenPayload,
  ) {
    connection.accessToken = payload.access_token ?? null;
    connection.refreshToken = payload.refresh_token ?? connection.refreshToken;
    connection.accessTokenExpiresAt = this.buildAccessTokenExpiry(
      payload.expires_in,
    );
    connection.isConnected = true;
  }

  private applyMailboxProfile(
    connection: OutlookConnection,
    mailboxProfile: OutlookMailboxProfile,
    fallbackEmail?: string | null,
  ) {
    connection.microsoftUserId =
      mailboxProfile.id ?? connection.microsoftUserId;
    connection.email =
      mailboxProfile.mail ??
      mailboxProfile.userPrincipalName ??
      fallbackEmail ??
      connection.email;
  }

  private mergeConnectionMetadata(
    connection: OutlookConnection,
    metadata: Record<string, unknown>,
  ) {
    connection.metadata = {
      ...(connection.metadata ?? {}),
      ...metadata,
    };
  }

  async refreshConnectionAccessToken(connection: OutlookConnection) {
    const { tenantId, clientId, clientSecret, redirectUri, scope } =
      this.getMicrosoftConfig();

    if (!connection.refreshToken) {
      throw new BadRequestException(
        'Outlook connection is missing a refresh token. Please reconnect Outlook.',
      );
    }

    const payload = await this.exchangeToken(
      {
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: connection.refreshToken,
        redirect_uri: redirectUri,
        grant_type: 'refresh_token',
        scope,
      },
      tenantId,
    );

    this.applyTokenPayload(connection, payload);
    const profile = await this.fetchMailboxProfile(connection.accessToken!);
    this.applyMailboxProfile(connection, profile);
    connection.tenantId = connection.tenantId ?? tenantId;
    connection.connectedAt = connection.connectedAt ?? new Date();
    this.mergeConnectionMetadata(connection, {
      lastRefreshAt: new Date().toISOString(),
    });

    return this.connectionRepo.save(connection);
  }

  async getValidConnectionForUser(userId: string) {
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

  private buildStatus(
    user: User,
    connection: OutlookConnection | null,
    subscription: OutlookSubscription | null,
  ) {
    const hasMailboxTokens = this.hasMailboxTokens(connection);

    return {
      isConnected: !!connection?.isConnected && hasMailboxTokens,
      connectedAt: connection?.connectedAt ?? null,
      mailbox: connection?.email ?? user.email,
      subscription: subscription ?? null,
      reconnectRequired:
        !!connection && (!connection.isConnected || !hasMailboxTokens),
    };
  }

  private async findOrCreateConnection(userId: string) {
    const existingConnection = await this.findConnectionByUserId(userId);
    if (existingConnection) {
      return existingConnection;
    }

    return this.connectionRepo.create({ userId });
  }

  private applyConnectedMailboxState(
    connection: OutlookConnection,
    user: User,
    tenantId: string,
    scope: string,
    tokenPayload: OutlookTokenPayload,
    mailboxProfile: OutlookMailboxProfile,
    now: Date,
  ) {
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

  private async findOrCreateSubscription(userId: string) {
    const existingSubscription = await this.findSubscriptionByUserId(userId);
    if (existingSubscription) {
      return existingSubscription;
    }

    return this.subscriptionRepo.create({ userId });
  }

  private applyActiveSubscriptionState(
    subscription: OutlookSubscription,
    userId: string,
    now: Date,
  ) {
    subscription.subscriptionId =
      subscription.subscriptionId ?? `${userId}-mail`;
    subscription.resource = '/me/messages';
    subscription.isActive = true;
    subscription.expiresAt = new Date(
      now.getTime() + OutlookAuthService.SUBSCRIPTION_DURATION_MS,
    );
  }

  private async upsertActiveSubscription(userId: string, now: Date) {
    const subscription = await this.findOrCreateSubscription(userId);
    this.applyActiveSubscriptionState(subscription, userId, now);
    return this.subscriptionRepo.save(subscription);
  }

  private async reactivateExistingSubscription(userId: string, now: Date) {
    const subscription = await this.findSubscriptionByUserId(userId);
    if (!subscription) {
      return null;
    }

    this.applyActiveSubscriptionState(subscription, userId, now);
    return this.subscriptionRepo.save(subscription);
  }

  async getStatus(user: User) {
    const connection = await this.findConnectionByUserId(user.id);
    const subscription = await this.findSubscriptionByUserId(user.id);

    return this.buildStatus(user, connection, subscription);
  }

  getConnectUrl(user: User) {
    const { tenantId, clientId, redirectUri, scope } =
      this.getMicrosoftConfig();
    const url = new URL(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`,
    );
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('response_mode', 'query');
    url.searchParams.set('scope', scope);
    url.searchParams.set('state', user.id);
    return { url: url.toString() };
  }

  async completeConnection(user: User, code: string) {
    const { tenantId, clientId, clientSecret, redirectUri, scope } =
      this.getMicrosoftConfig();
    const tokenPayload = await this.exchangeToken(
      {
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        scope,
      },
      tenantId,
    );
    const mailboxProfile = await this.fetchMailboxProfile(
      tokenPayload.access_token!,
    );

    const now = new Date();
    const connection = await this.findOrCreateConnection(user.id);
    this.applyConnectedMailboxState(
      connection,
      user,
      tenantId,
      scope,
      tokenPayload,
      mailboxProfile,
      now,
    );
    await this.connectionRepo.save(connection);
    await this.upsertActiveSubscription(user.id, now);
    await this.usersService.markOutlookConnected(user.id, now);

    return this.getStatus({
      ...user,
      outlookConnectedAt: now,
    } as User);
  }

  async reconnect(user: User) {
    const connection = await this.findConnectionByUserId(user.id);

    if (connection?.refreshToken) {
      await this.refreshConnectionAccessToken(connection);
    }

    await this.reactivateExistingSubscription(user.id, new Date());
    return this.getStatus(user);
  }
}
