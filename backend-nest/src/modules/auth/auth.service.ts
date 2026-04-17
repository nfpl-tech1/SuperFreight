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

type AuthSessionResult = {
  session: {
    access_token: string;
    token_type: 'bearer';
    user: ReturnType<UsersService['format']>;
  };
  refreshToken: string;
};

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

  async refreshSession(refreshToken: string) {
    const payload = await this.verifyRefreshToken(refreshToken);
    const user = await this.usersService.findById(payload.sub);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or has been deactivated');
    }

    return this.issueSession(user);
  }

  buildSessionPayload(user: User) {
    return {
      user: this.usersService.format(user),
      onboarding_required: !user.outlookConnectedAt,
    };
  }

  private issueSession(user: User): AuthSessionResult {
    if (!user.isActive) {
      throw new ForbiddenException('Account has been disabled');
    }

    const access_token = this.jwtService.sign({ sub: user.id });
    return {
      session: {
        access_token,
        token_type: 'bearer',
        user: this.usersService.format(user),
      },
      refreshToken: this.jwtService.sign(
        { sub: user.id, type: 'refresh' },
        {
          secret:
            this.config.get<string>('jwt.refreshSecret') ??
            this.config.get<string>('jwt.secret'),
          expiresIn: (this.config.get<string>('jwt.refreshExpiresIn') ??
            '30d') as `${number}${'s' | 'm' | 'h' | 'd'}`,
        },
      ),
    };
  }

  getRefreshCookieName() {
    return (
      this.config.get<string>('jwt.refreshCookieName') ?? 'sf_refresh_token'
    );
  }

  getRefreshCookieMaxAgeSeconds() {
    const expiresIn = this.config.get<string>('jwt.refreshExpiresIn') ?? '30d';
    const match = /^(\d+)([smhd])$/.exec(expiresIn);

    if (!match) {
      return 30 * 24 * 60 * 60;
    }

    const value = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 60 * 60,
      d: 24 * 60 * 60,
    };

    return value * multipliers[unit];
  }

  shouldUseSecureCookies() {
    return this.config.get<string>('nodeEnv') === 'production';
  }

  private async verifyOsSession(osUserId: string) {
    const res = await postToOs(this.config, '/auth/verify-session', {
      os_user_id: osUserId,
    });

    if (!res || !res.ok) {
      throw new ForbiddenException('Unable to verify OS session');
    }

    const data = (await res.json()) as { is_active: boolean };
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

  private async verifyRefreshToken(token: string): Promise<{ sub: string }> {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        type?: string;
      }>(token, {
        secret:
          this.config.get<string>('jwt.refreshSecret') ??
          this.config.get<string>('jwt.secret'),
      });

      if (!payload.sub || payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return { sub: payload.sub };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Refresh token is invalid or expired');
    }
  }

  private async getOsPublicKey(): Promise<string> {
    const configured = this.config.get<string>('os.jwtPublicKey');
    if (configured) return configured;

    const res = await fetchFromOs(this.config, '/auth/public-key');
    if (!res || !res.ok) {
      throw new UnauthorizedException('OS public key is unavailable');
    }
    const data = (await res.json()) as { public_key: string };
    return data.public_key;
  }
}
