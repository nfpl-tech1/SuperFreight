import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Normalises all HttpExceptions into a consistent JSON response shape:
 * { statusCode, detail, path, timestamp }
 *
 * This mirrors the FastAPI-style `detail` field the frontend already expects.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const rawMessage =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as Record<string, unknown>).message;

    const detail = Array.isArray(rawMessage)
      ? rawMessage.join('; ')
      : (rawMessage as string);

    this.logger.error(
      `${request.method} ${request.url} → ${status}: ${detail}`,
    );

    response.status(status).json({
      statusCode: status,
      detail,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
