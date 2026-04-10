import { User } from '../users/entities/user.entity';
import { CompleteOutlookConnectDto } from './dto/complete-outlook-connect.dto';
import { OutlookService } from './outlook.service';
export declare class OutlookController {
    private readonly outlookService;
    constructor(outlookService: OutlookService);
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
    complete(dto: CompleteOutlookConnectDto, user: User): Promise<{
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
}
