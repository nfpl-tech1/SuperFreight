import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Audit } from '../../common/decorators/audit.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { User } from '../users/entities/user.entity';
import { CreateRfqDto } from './dto/create-rfq.dto';
import { RfqsService } from './rfqs.service';

@Controller('rfqs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RfqsController {
  constructor(private readonly rfqsService: RfqsService) {}

  @Get()
  list() {
    return this.rfqsService.list();
  }

  @Post()
  @Audit('RFQ_CREATED', 'rfq')
  create(@Body() dto: CreateRfqDto, @CurrentUser() user: User) {
    return this.rfqsService.create(dto, user);
  }
}
