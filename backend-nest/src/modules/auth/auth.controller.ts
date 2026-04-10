import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Audit } from '../../common/decorators/audit.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SsoLoginDto } from './dto/sso-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Audit('USER_LOGIN', 'auth')
  login(@Body() dto: LoginDto) {
    return this.authService.loginWithOsCredentials(dto.email, dto.password);
  }

  @Post('sso')
  @HttpCode(HttpStatus.OK)
  @Audit('USER_SSO_LOGIN', 'auth')
  consumeSso(@Body() dto: SsoLoginDto) {
    return this.authService.loginWithOsSso(dto.token);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  logout() {
    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: User) {
    return this.authService.buildSessionPayload(user);
  }
}
