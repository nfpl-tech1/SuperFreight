import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createVerify } from 'crypto';

export interface OsUserPayload extends Record<string, unknown> {
  os_user_id: string;
  email: string;
  name: string;
  user_type?: string;
  department_slug?: string | null;
  department_name?: string | null;
  org_id?: string | null;
  org_name?: string | null;
  is_app_admin?: boolean;
  is_team_lead?: boolean;
}

export interface OsVerifyPasswordResponse {
  valid?: boolean;
  reason?: string | null;
  user?: OsUserPayload;
}

export interface OsSsoTokenPayload {
  token_id: string;
  user_id: string;
  email: string;
  name: string;
  exp: number;
  user_type?: string;
  department_slug?: string | null;
  department_name?: string | null;
  org_id?: string | null;
  org_name?: string | null;
  is_app_admin?: boolean;
  is_team_lead?: boolean;
}

export function getOsBackendUrl(config: ConfigService) {
  return config.get<string>('os.backendUrl') ?? '';
}

export function getOsAppSlug(config: ConfigService) {
  return config.get<string>('os.appSlug') ?? 'superfreight';
}

export function getOsInternalHeaders(config: ConfigService) {
  return {
    'Content-Type': 'application/json',
    'x-internal-key': config.get<string>('os.internalApiKey') ?? '',
  };
}

export function formatVerifySummary(payload: OsVerifyPasswordResponse) {
  return JSON.stringify({
    valid: !!payload?.valid,
    reason: payload?.reason ?? null,
    hasUser: !!payload?.user,
    osUserId: payload?.user?.os_user_id ?? null,
    isAppAdmin: payload?.user?.is_app_admin ?? null,
  });
}

export function verifyOsSsoSignature(
  token: string,
  publicKey: string,
): OsSsoTokenPayload {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new BadRequestException('Invalid token format');
  }

  const verifier = createVerify('RSA-SHA256');
  verifier.update(`${parts[0]}.${parts[1]}`);
  verifier.end();
  const isValid = verifier.verify(
    publicKey,
    Buffer.from(parts[2], 'base64url'),
  );
  if (!isValid) {
    throw new UnauthorizedException('Invalid SSO signature');
  }

  const payload = JSON.parse(
    Buffer.from(parts[1], 'base64url').toString('utf8'),
  ) as OsSsoTokenPayload;
  if (!payload.exp || Date.now() >= payload.exp * 1000) {
    throw new UnauthorizedException('SSO token expired');
  }
  if (!payload.token_id || !payload.user_id || !payload.email) {
    throw new UnauthorizedException('SSO token payload is incomplete');
  }
  return payload;
}

export function assertOsSessionActive(isActive: boolean) {
  if (!isActive) {
    throw new ForbiddenException('Your OS account has been deactivated');
  }
}

export function mapSsoTokenToOsUserPayload(
  payload: OsSsoTokenPayload,
): OsUserPayload {
  return {
    os_user_id: payload.user_id,
    email: payload.email,
    name: payload.name,
    user_type: payload.user_type,
    department_slug: payload.department_slug,
    department_name: payload.department_name,
    org_id: payload.org_id,
    org_name: payload.org_name,
    is_app_admin: !!payload.is_app_admin,
    is_team_lead: !!payload.is_team_lead,
  };
}
