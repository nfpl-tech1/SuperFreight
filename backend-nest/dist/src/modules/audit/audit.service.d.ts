import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
export interface AuditLogParams {
    userId?: string;
    userEmail?: string;
    action: string;
    resourceType?: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
}
export declare class AuditService {
    private readonly auditRepo;
    private readonly logger;
    constructor(auditRepo: Repository<AuditLog>);
    log(params: AuditLogParams): Promise<void>;
}
