import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { OutlookConnection } from './entities/outlook-connection.entity';
import { OutlookSubscription } from './entities/outlook-subscription.entity';
export declare class OutlookService {
    private readonly config;
    private readonly usersService;
    private readonly connectionRepo;
    private readonly subscriptionRepo;
    private static readonly GRAPH_BASE_URL;
    constructor(config: ConfigService, usersService: UsersService, connectionRepo: Repository<OutlookConnection>, subscriptionRepo: Repository<OutlookSubscription>);
    private getScopes;
    private getMicrosoftConfig;
    private exchangeToken;
    private fetchMailboxProfile;
    private refreshConnectionAccessToken;
    private getValidConnectionForUser;
    private sendGraphMailRequest;
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
    sendMail(user: User, payload: {
        subject: string;
        htmlBody: string;
        to: Array<{
            address: string;
            name?: string | null;
        }>;
        cc?: Array<{
            address: string;
            name?: string | null;
        }>;
        attachments?: Array<{
            fileName: string;
            contentType: string;
            contentBytes: string;
        }>;
    }): Promise<void>;
}
