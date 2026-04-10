"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const users_service_1 = require("../users/users.service");
const consumed_sso_token_entity_1 = require("./entities/consumed-sso-token.entity");
const os_auth_helpers_1 = require("./os-auth.helpers");
const os_auth_http_helpers_1 = require("./os-auth-http.helpers");
let AuthService = AuthService_1 = class AuthService {
    usersService;
    jwtService;
    config;
    consumedRepo;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(usersService, jwtService, config, consumedRepo) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.config = config;
        this.consumedRepo = consumedRepo;
    }
    async loginWithOsCredentials(email, password) {
        const osRes = await (0, os_auth_http_helpers_1.postToOs)(this.config, '/auth/verify-password', {
            email,
            password,
            app_slug: (0, os_auth_helpers_1.getOsAppSlug)(this.config),
        });
        if (!osRes) {
            this.logger.error('OS verify-password request failed: no response received');
            throw new common_1.ServiceUnavailableException('OS identity server unreachable');
        }
        if (!osRes.ok) {
            this.logger.error(`OS verify-password request failed with status ${osRes.status}`);
            throw new common_1.ServiceUnavailableException('OS identity verification failed');
        }
        const payload = (await osRes.json());
        const verifySummary = (0, os_auth_helpers_1.formatVerifySummary)(payload);
        if (payload?.valid) {
            this.logger.log(`OS verify-password response for ${email}: ${verifySummary}`);
        }
        else {
            this.logger.warn(`OS verify-password response for ${email}: ${verifySummary}`);
        }
        if (!payload.valid) {
            if (payload.reason === 'no_app_access') {
                throw new common_1.ForbiddenException('You do not have access to SuperFreight.');
            }
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const user = await this.usersService.syncFromOsUser(payload.user);
        return this.issueSession(user);
    }
    async loginWithOsSso(token) {
        const payload = await this.verifyOsSsoToken(token);
        const existing = await this.consumedRepo.findOne({
            where: { tokenId: payload.token_id },
        });
        if (existing) {
            throw new common_1.UnauthorizedException('SSO token has already been used');
        }
        await this.verifyOsSession(payload.user_id);
        await this.consumeOsSsoToken(payload.token_id);
        await this.consumedRepo.save({
            tokenId: payload.token_id,
            appSlug: (0, os_auth_helpers_1.getOsAppSlug)(this.config),
        });
        const user = await this.usersService.syncFromOsUser((0, os_auth_helpers_1.mapSsoTokenToOsUserPayload)(payload));
        return this.issueSession(user);
    }
    buildSessionPayload(user) {
        return {
            user: this.usersService.format(user),
            onboarding_required: !user.outlookConnectedAt,
        };
    }
    async issueSession(user) {
        if (!user.isActive) {
            throw new common_1.ForbiddenException('Account has been disabled');
        }
        const access_token = this.jwtService.sign({ sub: user.id });
        return {
            access_token,
            token_type: 'bearer',
            user: this.usersService.format(user),
        };
    }
    async verifyOsSession(osUserId) {
        const res = await (0, os_auth_http_helpers_1.postToOs)(this.config, '/auth/verify-session', {
            os_user_id: osUserId,
        });
        if (!res || !res.ok) {
            throw new common_1.ForbiddenException('Unable to verify OS session');
        }
        const data = await res.json();
        (0, os_auth_helpers_1.assertOsSessionActive)(data.is_active);
    }
    async consumeOsSsoToken(tokenId) {
        const res = await (0, os_auth_http_helpers_1.postToOs)(this.config, '/auth/sso-token/consume', {
            token_id: tokenId,
        });
        if (!res) {
            this.logger.error(`OS SSO consume request failed for token ${tokenId}: no response received`);
            throw new common_1.ServiceUnavailableException('Unable to finalize OS SSO login');
        }
        if (!res.ok) {
            this.logger.warn(`OS refused SSO consume for token ${tokenId} with status ${res.status}`);
            throw new common_1.UnauthorizedException('SSO token could not be consumed');
        }
    }
    async verifyOsSsoToken(token) {
        return (0, os_auth_helpers_1.verifyOsSsoSignature)(token, await this.getOsPublicKey());
    }
    async getOsPublicKey() {
        const configured = this.config.get('os.jwtPublicKey');
        if (configured)
            return configured;
        const res = await (0, os_auth_http_helpers_1.fetchFromOs)(this.config, '/auth/public-key');
        if (!res || !res.ok) {
            throw new common_1.UnauthorizedException('OS public key is unavailable');
        }
        const data = await res.json();
        return data.public_key;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, typeorm_1.InjectRepository)(consumed_sso_token_entity_1.ConsumedSsoToken)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService,
        typeorm_2.Repository])
], AuthService);
//# sourceMappingURL=auth.service.js.map