import { ConfigService } from '@nestjs/config';
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
export declare function getOsBackendUrl(config: ConfigService): string;
export declare function getOsAppSlug(config: ConfigService): string;
export declare function getOsInternalHeaders(config: ConfigService): {
    'Content-Type': string;
    'x-internal-key': string;
};
export declare function formatVerifySummary(payload: OsVerifyPasswordResponse): string;
export declare function verifyOsSsoSignature(token: string, publicKey: string): OsSsoTokenPayload;
export declare function assertOsSessionActive(isActive: boolean): void;
export declare function mapSsoTokenToOsUserPayload(payload: OsSsoTokenPayload): OsUserPayload;
