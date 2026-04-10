import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AUDIT_KEY, AuditMetadata } from '../decorators/audit.decorator';
import { AuditService } from '../../modules/audit/audit.service';

/**
 * Global interceptor that writes an audit log entry for every
 * controller method decorated with @Audit().
 *
 * Architecture note: Applied as APP_INTERCEPTOR in AppModule so it is
 * truly global — but it is a no-op for methods without @Audit(),
 * keeping overhead minimal.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const meta = this.reflector.getAllAndOverride<AuditMetadata>(AUDIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No @Audit() — pass through without logging
    if (!meta) return next.handle();

    const request = context.switchToHttp().getRequest<{
      user?: { id?: string; email?: string };
      method: string;
      body: unknown;
      params: Record<string, string>;
    }>();

    const user = request.user;

    return next.handle().pipe(
      tap((responseBody: Record<string, unknown> | null) => {
        const resourceId =
          (responseBody?.id as string | undefined) ||
          request.params?.id ||
          undefined;

        // Fire-and-forget — never block the response for a log write
        void this.auditService.log({
          userId: user?.id,
          userEmail: user?.email,
          action: meta.action,
          resourceType: meta.resourceType,
          resourceId,
          metadata: { method: request.method, body: request.body },
        });
      }),
    );
  }
}
