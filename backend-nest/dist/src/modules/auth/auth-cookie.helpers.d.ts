type RefreshCookieConfig = {
    cookieName: string;
    maxAgeSeconds: number;
    secure: boolean;
};
export declare function buildRefreshTokenSetCookie(refreshToken: string, config: RefreshCookieConfig): string;
export declare function buildRefreshTokenClearCookie(cookieName: string, secure: boolean): string;
export declare function readCookieValue(cookieHeader: string | undefined, cookieName: string): string | null;
export {};
