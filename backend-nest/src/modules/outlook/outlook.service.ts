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

type OutlookTokenPayload = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  error_description?: string;
};

@Injectable()
export class OutlookService {
  private static readonly GRAPH_BASE_URL = 'https://graph.microsoft.com/v1.0';

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

  private getMicrosoftConfig() {
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
      `${OutlookService.GRAPH_BASE_URL}/me?$select=id,mail,userPrincipalName`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const payload = (await response.json().catch(() => null)) as {
      id?: string;
      mail?: string | null;
      userPrincipalName?: string | null;
    } | null;

    if (!response.ok || !payload?.id) {
      throw new BadRequestException(
        'Unable to read Outlook mailbox details. Please reconnect Outlook.',
      );
    }

    return payload;
  }

  private async refreshConnectionAccessToken(connection: OutlookConnection) {
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

    connection.accessToken = payload.access_token ?? null;
    connection.refreshToken = payload.refresh_token ?? connection.refreshToken;
    connection.accessTokenExpiresAt = payload.expires_in
      ? new Date(Date.now() + payload.expires_in * 1000)
      : null;
    connection.isConnected = true;

    const profile = await this.fetchMailboxProfile(connection.accessToken!);
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

  private async getValidConnectionForUser(userId: string) {
    const connection = await this.connectionRepo.findOne({
      where: { userId },
    });

    if (
      connection?.isConnected &&
      !connection.accessToken &&
      !connection.refreshToken
    ) {
      throw new BadRequestException(
        'Your Outlook mailbox was linked under an older setup. Please reconnect Outlook once from onboarding or profile to enable sending.',
      );
    }

    if (!connection?.isConnected || !connection.accessToken) {
      throw new BadRequestException(
        'Outlook mailbox is not connected. Please connect Outlook first.',
      );
    }

    const expiresAt = connection.accessTokenExpiresAt?.getTime() ?? 0;
    const refreshThreshold = Date.now() + 60_000;

    if (!expiresAt || expiresAt <= refreshThreshold) {
      return this.refreshConnectionAccessToken(connection);
    }

    return connection;
  }

  private async sendGraphMailRequest(
    accessToken: string,
    body: Record<string, unknown>,
  ) {
    const response = await fetch(
      `${OutlookService.GRAPH_BASE_URL}/me/sendMail`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );

    if (response.ok) {
      return;
    }

    const payload = (await response.json().catch(() => null)) as {
      error?: {
        code?: string;
        message?: string;
      };
    } | null;

    throw new BadRequestException(
      payload?.error?.message || 'Unable to send mail through Outlook.',
    );
  }

  async getStatus(user: User) {
    const connection = await this.connectionRepo.findOne({
      where: { userId: user.id },
    });
    const subscription = await this.subscriptionRepo.findOne({
      where: { userId: user.id },
    });
    const hasMailboxTokens = Boolean(
      connection?.accessToken || connection?.refreshToken,
    );
    return {
      isConnected: !!connection?.isConnected && hasMailboxTokens,
      connectedAt: connection?.connectedAt ?? null,
      mailbox: connection?.email ?? user.email,
      subscription: subscription ?? null,
      reconnectRequired:
        !!connection && (!connection.isConnected || !hasMailboxTokens),
    };
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
    } as User);
  }

  async reconnect(user: User) {
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

  async sendMail(
    user: User,
    payload: {
      subject: string;
      htmlBody: string;
      to: Array<{ address: string; name?: string | null }>;
      cc?: Array<{ address: string; name?: string | null }>;
      attachments?: Array<{
        fileName: string;
        contentType: string;
        contentBytes: string;
      }>;
    },
  ) {
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
      await this.sendGraphMailRequest(connection.accessToken!, requestBody);
    } catch {
      const refreshedConnection =
        await this.refreshConnectionAccessToken(connection);
      await this.sendGraphMailRequest(
        refreshedConnection.accessToken!,
        requestBody,
      );
    }
  }
}
