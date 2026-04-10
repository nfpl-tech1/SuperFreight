import { ConfigService } from '@nestjs/config';
import { getOsBackendUrl, getOsInternalHeaders } from './os-auth.helpers';

export function fetchFromOs(config: ConfigService, path: string) {
  return fetch(`${getOsBackendUrl(config)}${path}`).catch(() => null);
}

export function postToOs(
  config: ConfigService,
  path: string,
  payload: Record<string, unknown>,
) {
  return fetch(`${getOsBackendUrl(config)}${path}`, {
    method: 'POST',
    headers: getOsInternalHeaders(config),
    body: JSON.stringify(payload),
  }).catch(() => null);
}
