import { DataSource } from 'typeorm';
type DependencyHealth = {
    status: 'up' | 'down';
    details?: string;
};
export declare class HealthService {
    private readonly appDataSource;
    private readonly businessDataSource;
    constructor(appDataSource: DataSource, businessDataSource: DataSource);
    getStatus(): Promise<{
        status: string;
        timestamp: string;
        dependencies: {
            appDatabase: DependencyHealth;
            businessDatabase: DependencyHealth;
        };
    }>;
    private checkDataSource;
}
export {};
