import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ModuleAccess } from '../../common/decorators/module-access.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { User } from '../users/entities/user.entity';
import { CompleteOutlookConnectDto } from './dto/complete-outlook-connect.dto';
import { OutlookService } from './outlook.service';

@Controller('outlook')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OutlookController {
  constructor(private readonly outlookService: OutlookService) {}

  @Get('status')
  @ModuleAccess('profile', 'view')
  getStatus(@CurrentUser() user: User) {
    return this.outlookService.getStatus(user);
  }

  @Get('connect-url')
  @ModuleAccess('profile', 'edit')
  getConnectUrl(@CurrentUser() user: User) {
    return this.outlookService.getConnectUrl(user);
  }

  @Post('complete')
  @ModuleAccess('profile', 'edit')
  complete(@Body() dto: CompleteOutlookConnectDto, @CurrentUser() user: User) {
    return this.outlookService.completeConnection(user, dto.code);
  }

  @Post('reconnect')
  @ModuleAccess('profile', 'edit')
  reconnect(@CurrentUser() user: User) {
    return this.outlookService.reconnect(user);
  }
}
