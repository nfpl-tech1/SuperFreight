"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRefreshTokenSetCookie = buildRefreshTokenSetCookie;
exports.buildRefreshTokenClearCookie = buildRefreshTokenClearCookie;
exports.readCookieValue = readCookieValue;
function buildRefreshTokenSetCookie(refreshToken, config) {
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
function buildRefreshTokenClearCookie(cookieName, secure) {
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
function readCookieValue(cookieHeader, cookieName) {
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
//# sourceMappingURL=auth-cookie.helpers.js.map