import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { OutlookConnection } from './entities/outlook-connection.entity';
import { OutlookSubscription } from './entities/outlook-subscription.entity';
export declare class OutlookAuthService {
    private readonly config;
    private readonly usersService;
    private readonly connectionRepo;
    private readonly subscriptionRepo;
    private static readonly GRAPH_BASE_URL;
    private static readonly ACCESS_TOKEN_REFRESH_BUFFER_MS;
    private static readonly SUBSCRIPTION_DURATION_MS;
    constructor(config: ConfigService, usersService: UsersService, connectionRepo: Repository<OutlookConnection>, subscriptionRepo: Repository<OutlookSubscription>);
    private getScopes;
    private getMicrosoftConfig;
    private exchangeToken;
    private fetchMailboxProfile;
    private findConnectionByUserId;
    private findSubscriptionByUserId;
    private hasMailboxTokens;
    private ensureConnectionHasSupportedTokens;
    private requireConnectedMailbox;
    private shouldRefreshAccessToken;
    private buildAccessTokenExpiry;
    private applyTokenPayload;
    private applyMailboxProfile;
    private mergeConnectionMetadata;
    refreshConnectionAccessToken(connection: OutlookConnection): Promise<OutlookConnection>;
    getValidConnectionForUser(userId: string): Promise<OutlookConnection>;
    private buildStatus;
    private findOrCreateConnection;
    private applyConnectedMailboxState;
    private findOrCreateSubscription;
    private applyActiveSubscriptionState;
    private upsertActiveSubscription;
    private reactivateExistingSubscription;
    getStatus(user: User): Promise<{
        isConnected: boolean;
        connectedAt: Date | null;
        mailbox: string;
        subscription: OutlookSubscription | null;
        reconnectRequired: boolean;
    }>;
    getConnectUrl(user: User): {
        url: string;
    };
    completeConnection(user: User, code: string): Promise<{
        isConnected: boolean;
        connectedAt: Date | null;
        mailbox: string;
        subscription: OutlookSubscription | null;
        reconnectRequired: boolean;
    }>;
    reconnect(user: User): Promise<{
        isConnected: boolean;
        connectedAt: Date | null;
        mailbox: string;
        subscription: OutlookSubscription | null;
        reconnectRequired: boolean;
    }>;
}
