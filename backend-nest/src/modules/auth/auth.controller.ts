import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Audit } from '../../common/decorators/audit.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import {
  buildRefreshTokenClearCookie,
  buildRefreshTokenSetCookie,
  readCookieValue,
} from './auth-cookie.helpers';
import { LoginDto } from './dto/login.dto';
import { SsoLoginDto } from './dto/sso-login.dto';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Audit('USER_LOGIN', 'auth')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.loginWithOsCredentials(
      dto.email,
      dto.password,
    );
    this.setRefreshTokenCookie(response, result.refreshToken);
    return result.session;
  }

  @Post('sso')
  @HttpCode(HttpStatus.OK)
  @Audit('USER_SSO_LOGIN', 'auth')
  async consumeSso(
    @Body() dto: SsoLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.loginWithOsSso(dto.token);
    this.setRefreshTokenCookie(response, result.refreshToken);
    return result.session;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = readCookieValue(
      request.headers.cookie,
      this.authService.getRefreshCookieName(),
    );

    if (!refreshToken) {
      this.clearRefreshTokenCookie(response);
      throw new UnauthorizedException('Refresh token is missing');
    }

    const result = await this.authService.refreshSession(refreshToken);
    this.setRefreshTokenCookie(response, result.refreshToken);
    return result.session;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) response: Response) {
    this.clearRefreshTokenCookie(response);
    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: User) {
    return this.authService.buildSessionPayload(user);
  }

  private setRefreshTokenCookie(response: Response, refreshToken: string) {
    response.setHeader(
      'Set-Cookie',
      buildRefreshTokenSetCookie(refreshToken, {
        cookieName: this.authService.getRefreshCookieName(),
        maxAgeSeconds: this.authService.getRefreshCookieMaxAgeSeconds(),
        secure: this.authService.shouldUseSecureCookies(),
      }),
    );
  }

  private clearRefreshTokenCookie(response: Response) {
    response.setHeader(
      'Set-Cookie',
      buildRefreshTokenClearCookie(
        this.authService.getRefreshCookieName(),
        this.authService.shouldUseSecureCookies(),
      ),
    );
  }
}
