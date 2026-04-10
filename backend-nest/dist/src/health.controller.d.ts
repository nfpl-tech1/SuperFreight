import { HealthService } from './health.service';
export declare class HealthController {
    private readonly healthService;
    constructor(healthService: HealthService);
    getHealth(): Promise<{
        status: string;
        timestamp: string;
        dependencies: {
            appDatabase: {
                status: "up" | "down";
                details?: string;
            };
            businessDatabase: {
                status: "up" | "down";
                details?: string;
            };
        };
    }>;
}
