import {
  ForbiddenException,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { ConsumedSsoToken } from './entities/consumed-sso-token.entity';
import { User } from '../users/entities/user.entity';
import {
  assertOsSessionActive,
  formatVerifySummary,
  getOsAppSlug,
  mapSsoTokenToOsUserPayload,
  OsSsoTokenPayload,
  OsUserPayload,
  OsVerifyPasswordResponse,
  verifyOsSsoSignature,
} from './os-auth.helpers';
import { fetchFromOs, postToOs } from './os-auth-http.helpers';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @InjectRepository(ConsumedSsoToken)
    private readonly consumedRepo: Repository<ConsumedSsoToken>,
  ) {}

  async loginWithOsCredentials(email: string, password: string) {
    const osRes = await postToOs(this.config, '/auth/verify-password', {
      email,
      password,
      app_slug: getOsAppSlug(this.config),
    });

    if (!osRes) {
      this.logger.error(
        'OS verify-password request failed: no response received',
      );
      throw new ServiceUnavailableException('OS identity server unreachable');
    }

    if (!osRes.ok) {
      this.logger.error(
        `OS verify-password request failed with status ${osRes.status}`,
      );
      throw new ServiceUnavailableException('OS identity verification failed');
    }

    const payload = (await osRes.json()) as OsVerifyPasswordResponse;
    const verifySummary = formatVerifySummary(payload);

    if (payload?.valid) {
      this.logger.log(
        `OS verify-password response for ${email}: ${verifySummary}`,
      );
    } else {
      this.logger.warn(
        `OS verify-password response for ${email}: ${verifySummary}`,
      );
    }
    if (!payload.valid) {
      if (payload.reason === 'no_app_access') {
        throw new ForbiddenException('You do not have access to SuperFreight.');
      }
      throw new UnauthorizedException('Invalid email or password');
    }

    const user = await this.usersService.syncFromOsUser(
      payload.user as OsUserPayload,
    );
    return this.issueSession(user);
  }

  async loginWithOsSso(token: string) {
    const payload = await this.verifyOsSsoToken(token);
    const existing = await this.consumedRepo.findOne({
      where: { tokenId: payload.token_id },
    });
    if (existing) {
      throw new UnauthorizedException('SSO token has already been used');
    }

    await this.verifyOsSession(payload.user_id);
    await this.consumeOsSsoToken(payload.token_id);

    await this.consumedRepo.save({
      tokenId: payload.token_id,
      appSlug: getOsAppSlug(this.config),
    });

    const user = await this.usersService.syncFromOsUser(
      mapSsoTokenToOsUserPayload(payload),
    );

    return this.issueSession(user);
  }

  buildSessionPayload(user: User) {
    return {
      user: this.usersService.format(user),
      onboarding_required: !user.outlookConnectedAt,
    };
  }

  private async issueSession(user: User) {
    if (!user.isActive) {
      throw new ForbiddenException('Account has been disabled');
    }

    const access_token = this.jwtService.sign({ sub: user.id });
    return {
      access_token,
      token_type: 'bearer',
      user: this.usersService.format(user),
    };
  }

  private async verifyOsSession(osUserId: string) {
    const res = await postToOs(this.config, '/auth/verify-session', {
      os_user_id: osUserId,
    });

    if (!res || !res.ok) {
      throw new ForbiddenException('Unable to verify OS session');
    }

    const data = await res.json();
    assertOsSessionActive(data.is_active);
  }

  private async consumeOsSsoToken(tokenId: string) {
    const res = await postToOs(this.config, '/auth/sso-token/consume', {
      token_id: tokenId,
    });

    if (!res) {
      this.logger.error(
        `OS SSO consume request failed for token ${tokenId}: no response received`,
      );
      throw new ServiceUnavailableException('Unable to finalize OS SSO login');
    }

    if (!res.ok) {
      this.logger.warn(
        `OS refused SSO consume for token ${tokenId} with status ${res.status}`,
      );
      throw new UnauthorizedException('SSO token could not be consumed');
    }
  }

  private async verifyOsSsoToken(token: string): Promise<OsSsoTokenPayload> {
    return verifyOsSsoSignature(token, await this.getOsPublicKey());
  }

  private async getOsPublicKey(): Promise<string> {
    const configured = this.config.get<string>('os.jwtPublicKey');
    if (configured) return configured;

    const res = await fetchFromOs(this.config, '/auth/public-key');
    if (!res || !res.ok) {
      throw new UnauthorizedException('OS public key is unavailable');
    }
    const data = await res.json();
    return data.public_key;
  }
}
