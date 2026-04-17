import {
  buildRefreshTokenClearCookie,
  buildRefreshTokenSetCookie,
  readCookieValue,
} from './auth-cookie.helpers';

describe('auth-cookie.helpers', () => {
  it('builds a refresh token cookie with the expected flags', () => {
    expect(
      buildRefreshTokenSetCookie('token-value', {
        cookieName: 'sf_refresh_token',
        maxAgeSeconds: 2_592_000,
        secure: true,
      }),
    ).toBe(
      'sf_refresh_token=token-value; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000; Secure',
    );
  });

  it('builds a clear-cookie header for logout', () => {
    expect(buildRefreshTokenClearCookie('sf_refresh_token', false)).toBe(
      'sf_refresh_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
    );
  });

  it('reads an individual cookie value from a cookie header', () => {
    expect(
      readCookieValue(
        'foo=bar; sf_refresh_token=refresh-token; another=value',
        'sf_refresh_token',
      ),
    ).toBe('refresh-token');
    expect(readCookieValue(undefined, 'sf_refresh_token')).toBeNull();
  });
});
