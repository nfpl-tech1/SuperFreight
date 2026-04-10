import { SetMetadata } from '@nestjs/common';

export const AUDIT_KEY = 'audit';

export interface AuditMetadata {
  action: string;
  resourceType?: string;
}

/**
 * Marks a controller method for audit logging.
 * The AuditInterceptor reads this metadata and writes a log entry
 * after each successful response.
 *
 * @example @Audit('USER_CREATED', 'user')
 */
export const Audit = (action: string, resourceType?: string) =>
  SetMetadata(AUDIT_KEY, { action, resourceType } satisfies AuditMetadata);
