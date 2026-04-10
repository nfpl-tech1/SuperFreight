import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

/**
 * Writes immutable audit log entries to the database.
 * All writes are fire-and-forget — a logging failure must never
 * surface as an API error to the client.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async log(params: AuditLogParams): Promise<void> {
    try {
      const entry = this.auditRepo.create(params);
      await this.auditRepo.save(entry);
    } catch (err) {
      // Degraded-mode logging: never throw from an audit failure
      this.logger.error('Failed to persist audit log entry', err);
    }
  }
}
