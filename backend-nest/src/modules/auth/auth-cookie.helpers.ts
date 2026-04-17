type RefreshCookieConfig = {
  cookieName: string;
  maxAgeSeconds: number;
  secure: boolean;
};

export function buildRefreshTokenSetCookie(
  refreshToken: string,
  config: RefreshCookieConfig,
) {
  return [
    `${config.cookieName}=${encodeURIComponent(refreshToken)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${config.maxAgeSeconds}`,
    config.secure ? 'Secure' : null,
  ]
    .filter(Boolean)
    .join('; ');
}

export function buildRefreshTokenClearCookie(
  cookieName: string,
  secure: boolean,
) {
  return [
    `${cookieName}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    secure ? 'Secure' : null,
  ]
    .filter(Boolean)
    .join('; ');
}

export function readCookieValue(
  cookieHeader: string | undefined,
  cookieName: string,
) {
  if (!cookieHeader) {
    return null;
  }

  const prefix = `${cookieName}=`;
  const match = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));

  return match ? decodeURIComponent(match.slice(prefix.length)) : null;
}
