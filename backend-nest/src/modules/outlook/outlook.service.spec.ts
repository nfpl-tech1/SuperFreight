jest.mock('../users/users.service', () => ({
  UsersService: class UsersService {},
}));

import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { OutlookService } from './outlook.service';
import { OutlookConnection } from './entities/outlook-connection.entity';
import { OutlookSubscription } from './entities/outlook-subscription.entity';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

type MockRepository<T> = Partial<
  Record<'create' | 'save' | 'findOne', jest.Mock>
> &
  Partial<Repository<T>>;

describe('OutlookService', () => {
  let service: OutlookService;
  let configService: { get: jest.Mock };
  let usersService: { markOutlookConnected: jest.Mock };
  let connectionRepo: MockRepository<OutlookConnection>;
  let subscriptionRepo: MockRepository<OutlookSubscription>;
  let storedConnection: OutlookConnection | null;
  let storedSubscription: OutlookSubscription | null;
  let fetchMock: jest.MockedFunction<typeof fetch>;

  const user = {
    id: 'user-1',
    email: 'user@example.com',
  } as User;

  beforeEach(() => {
    storedConnection = null;
    storedSubscription = null;
    fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
    global.fetch = fetchMock;

    configService = {
      get: jest.fn((key: string) => {
        switch (key) {
          case 'microsoft.tenantId':
            return 'tenant-1';
          case 'microsoft.clientId':
            return 'client-1';
          case 'microsoft.clientSecret':
            return 'secret-1';
          case 'microsoft.redirectUri':
            return 'https://app.example.com/outlook/callback';
          default:
            return undefined;
        }
      }),
    };

    usersService = {
      markOutlookConnected: jest.fn(() => Promise.resolve(undefined)),
    };

    connectionRepo = {
      create: jest.fn((input: Partial<OutlookConnection>) => input),
      save: jest.fn((input: Partial<OutlookConnection>) => {
        storedConnection = {
          id: storedConnection?.id ?? 'connection-1',
          userId: input.userId ?? storedConnection?.userId ?? user.id,
          tenantId: input.tenantId ?? null,
          microsoftUserId: input.microsoftUserId ?? null,
          email: input.email ?? null,
          accessToken: input.accessToken ?? null,
          refreshToken: input.refreshToken ?? null,
          accessTokenExpiresAt: input.accessTokenExpiresAt ?? null,
          isConnected: input.isConnected ?? false,
          connectedAt: input.connectedAt ?? null,
          metadata: input.metadata ?? null,
          createdAt: storedConnection?.createdAt ?? new Date(),
          updatedAt: new Date(),
        } as OutlookConnection;
        return Promise.resolve(storedConnection);
      }),
      findOne: jest.fn(({ where }: { where: { userId: string } }) =>
        Promise.resolve(where.userId === user.id ? storedConnection : null),
      ),
    };

    subscriptionRepo = {
      create: jest.fn((input: Partial<OutlookSubscription>) => input),
      save: jest.fn((input: Partial<OutlookSubscription>) => {
        storedSubscription = {
          id: storedSubscription?.id ?? 'subscription-1',
          userId: input.userId ?? storedSubscription?.userId ?? user.id,
          subscriptionId: input.subscriptionId ?? null,
          resource: input.resource ?? null,
          expiresAt: input.expiresAt ?? null,
          isActive: input.isActive ?? false,
          metadata: input.metadata ?? null,
          createdAt: storedSubscription?.createdAt ?? new Date(),
          updatedAt: new Date(),
        } as OutlookSubscription;
        return Promise.resolve(storedSubscription);
      }),
      findOne: jest.fn(({ where }: { where: { userId: string } }) =>
        Promise.resolve(where.userId === user.id ? storedSubscription : null),
      ),
    };

    service = new OutlookService(
      configService as unknown as ConfigService,
      usersService as unknown as UsersService,
      connectionRepo as Repository<OutlookConnection>,
      subscriptionRepo as Repository<OutlookSubscription>,
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const getFetchRequestInit = (index: number): RequestInit => {
    const call = fetchMock.mock.calls[index];

    expect(call).toBeDefined();
    expect(call?.[1]).toBeDefined();

    return call?.[1] ?? {};
  };

  it('returns reconnectRequired when a legacy connection has no usable tokens', async () => {
    storedConnection = {
      id: 'connection-1',
      userId: user.id,
      tenantId: 'tenant-1',
      microsoftUserId: 'ms-user-1',
      email: 'mailbox@example.com',
      accessToken: null,
      refreshToken: null,
      accessTokenExpiresAt: null,
      isConnected: true,
      connectedAt: new Date('2026-04-10T00:00:00.000Z'),
      metadata: null,
      createdAt: new Date('2026-04-10T00:00:00.000Z'),
      updatedAt: new Date('2026-04-10T00:00:00.000Z'),
    } as OutlookConnection;

    const result = await service.getStatus(user);

    expect(result).toEqual(
      expect.objectContaining({
        isConnected: false,
        mailbox: 'mailbox@example.com',
        reconnectRequired: true,
      }),
    );
  });

  it('completes the Outlook connection, stores tokens, and creates a subscription', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: 'access-1',
            refresh_token: 'refresh-1',
            expires_in: 3600,
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 'ms-user-1',
            mail: 'mailbox@example.com',
            userPrincipalName: 'upn@example.com',
          }),
      });

    const result = await service.completeConnection(user, 'auth-code-1');

    expect(connectionRepo.create).toHaveBeenCalledTimes(1);
    expect(connectionRepo.save).toHaveBeenCalledTimes(1);
    expect(storedConnection).toEqual(
      expect.objectContaining({
        userId: user.id,
        tenantId: 'tenant-1',
        microsoftUserId: 'ms-user-1',
        email: 'mailbox@example.com',
        accessToken: 'access-1',
        refreshToken: 'refresh-1',
        isConnected: true,
      }),
    );
    expect(subscriptionRepo.create).toHaveBeenCalledTimes(1);
    expect(storedSubscription).toEqual(
      expect.objectContaining({
        userId: user.id,
        subscriptionId: `${user.id}-mail`,
        resource: '/me/messages',
        isActive: true,
      }),
    );
    expect(usersService.markOutlookConnected).toHaveBeenCalledWith(
      user.id,
      expect.any(Date),
    );
    expect(result).toEqual(
      expect.objectContaining({
        isConnected: true,
        mailbox: 'mailbox@example.com',
        reconnectRequired: false,
      }),
    );
  });

  it('refreshes the mailbox token and retries sendMail once after a graph failure', async () => {
    storedConnection = {
      id: 'connection-1',
      userId: user.id,
      tenantId: 'tenant-1',
      microsoftUserId: 'ms-user-1',
      email: 'mailbox@example.com',
      accessToken: 'access-old',
      refreshToken: 'refresh-old',
      accessTokenExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
      isConnected: true,
      connectedAt: new Date('2026-04-10T00:00:00.000Z'),
      metadata: null,
      createdAt: new Date('2026-04-10T00:00:00.000Z'),
      updatedAt: new Date('2026-04-10T00:00:00.000Z'),
    } as OutlookConnection;

    fetchMock
      .mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            error: {
              message: 'expired token',
            },
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: 'access-new',
            refresh_token: 'refresh-new',
            expires_in: 7200,
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 'ms-user-1',
            mail: 'mailbox@example.com',
            userPrincipalName: 'upn@example.com',
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

    await service.sendMail(user, {
      subject: 'RFQ',
      htmlBody: '<p>Hello</p>',
      to: [{ address: 'vendor@example.com', name: 'Vendor' }],
      cc: [{ address: 'ops@example.com' }],
      attachments: [
        {
          fileName: 'quote.pdf',
          contentType: 'application/pdf',
          contentBytes: 'YmFzZTY0',
        },
      ],
    });

    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(connectionRepo.save).toHaveBeenCalledTimes(1);
    expect(storedConnection).toEqual(
      expect.objectContaining({
        accessToken: 'access-new',
        refreshToken: 'refresh-new',
        email: 'mailbox@example.com',
        isConnected: true,
      }),
    );
    const retryRequest = getFetchRequestInit(3);

    expect(retryRequest.method).toBe('POST');
    expect(new Headers(retryRequest.headers).get('Authorization')).toBe(
      'Bearer access-new',
    );
  });

  it('throws a reconnect error when a legacy connected mailbox has no tokens', async () => {
    storedConnection = {
      id: 'connection-1',
      userId: user.id,
      tenantId: 'tenant-1',
      microsoftUserId: 'ms-user-1',
      email: 'mailbox@example.com',
      accessToken: null,
      refreshToken: null,
      accessTokenExpiresAt: null,
      isConnected: true,
      connectedAt: new Date('2026-04-10T00:00:00.000Z'),
      metadata: null,
      createdAt: new Date('2026-04-10T00:00:00.000Z'),
      updatedAt: new Date('2026-04-10T00:00:00.000Z'),
    } as OutlookConnection;

    await expect(
      service.sendMail(user, {
        subject: 'RFQ',
        htmlBody: '<p>Hello</p>',
        to: [{ address: 'vendor@example.com' }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reconnects by refreshing tokens and reactivating an existing subscription only', async () => {
    storedConnection = {
      id: 'connection-1',
      userId: user.id,
      tenantId: 'tenant-1',
      microsoftUserId: 'ms-user-1',
      email: 'mailbox@example.com',
      accessToken: 'access-old',
      refreshToken: 'refresh-old',
      accessTokenExpiresAt: new Date(Date.now() - 60 * 1000),
      isConnected: true,
      connectedAt: new Date('2026-04-10T00:00:00.000Z'),
      metadata: null,
      createdAt: new Date('2026-04-10T00:00:00.000Z'),
      updatedAt: new Date('2026-04-10T00:00:00.000Z'),
    } as OutlookConnection;
    storedSubscription = {
      id: 'subscription-1',
      userId: user.id,
      subscriptionId: `${user.id}-mail`,
      resource: '/me/messages',
      expiresAt: new Date('2026-04-10T00:00:00.000Z'),
      isActive: false,
      metadata: null,
      createdAt: new Date('2026-04-10T00:00:00.000Z'),
      updatedAt: new Date('2026-04-10T00:00:00.000Z'),
    } as OutlookSubscription;

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: 'access-new',
            refresh_token: 'refresh-new',
            expires_in: 3600,
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 'ms-user-1',
            mail: 'mailbox@example.com',
          }),
      });

    const result = await service.reconnect(user);

    expect(connectionRepo.save).toHaveBeenCalledTimes(1);
    expect(subscriptionRepo.save).toHaveBeenCalledTimes(1);
    expect(storedSubscription).toEqual(
      expect.objectContaining({
        isActive: true,
        resource: '/me/messages',
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        isConnected: true,
        reconnectRequired: false,
      }),
    );
  });
});
