import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * Validates inbound JWT Bearer tokens.
 * On each authenticated request:
 *   1. Decodes and verifies the token signature
 *   2. Loads the user from DB (ensures user still exists and is active)
 *   3. Attaches the user entity to request.user
 *
 * The isActive check here implements the "immediate kick-out" pattern —
 * even a valid, unexpired token is rejected if the user has been disabled.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.secret'),
    });
  }

  async validate(payload: { sub: string }): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: payload.sub } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or has been deactivated');
    }
    return user;
  }
}
