import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Validates the JWT Bearer token on the incoming request.
 * Attach to any controller/route that requires authentication.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
