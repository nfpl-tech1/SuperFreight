"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOsBackendUrl = getOsBackendUrl;
exports.getOsAppSlug = getOsAppSlug;
exports.getOsInternalHeaders = getOsInternalHeaders;
exports.formatVerifySummary = formatVerifySummary;
exports.verifyOsSsoSignature = verifyOsSsoSignature;
exports.assertOsSessionActive = assertOsSessionActive;
exports.mapSsoTokenToOsUserPayload = mapSsoTokenToOsUserPayload;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
function getOsBackendUrl(config) {
    return config.get('os.backendUrl') ?? '';
}
function getOsAppSlug(config) {
    return config.get('os.appSlug') ?? 'superfreight';
}
function getOsInternalHeaders(config) {
    return {
        'Content-Type': 'application/json',
        'x-internal-key': config.get('os.internalApiKey') ?? '',
    };
}
function formatVerifySummary(payload) {
    return JSON.stringify({
        valid: !!payload?.valid,
        reason: payload?.reason ?? null,
        hasUser: !!payload?.user,
        osUserId: payload?.user?.os_user_id ?? null,
        isAppAdmin: payload?.user?.is_app_admin ?? null,
    });
}
function verifyOsSsoSignature(token, publicKey) {
    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new common_1.BadRequestException('Invalid token format');
    }
    const verifier = (0, crypto_1.createVerify)('RSA-SHA256');
    verifier.update(`${parts[0]}.${parts[1]}`);
    verifier.end();
    const isValid = verifier.verify(publicKey, Buffer.from(parts[2], 'base64url'));
    if (!isValid) {
        throw new common_1.UnauthorizedException('Invalid SSO signature');
    }
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() >= payload.exp * 1000) {
        throw new common_1.UnauthorizedException('SSO token expired');
    }
    if (!payload.token_id || !payload.user_id || !payload.email) {
        throw new common_1.UnauthorizedException('SSO token payload is incomplete');
    }
    return payload;
}
function assertOsSessionActive(isActive) {
    if (!isActive) {
        throw new common_1.ForbiddenException('Your OS account has been deactivated');
    }
}
function mapSsoTokenToOsUserPayload(payload) {
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
//# sourceMappingURL=os-auth.helpers.js.map