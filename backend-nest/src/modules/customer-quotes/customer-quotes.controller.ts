import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Audit } from '../../common/decorators/audit.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { User } from '../users/entities/user.entity';
import { CustomerQuotesService } from './customer-quotes.service';
import { GenerateCustomerDraftDto } from './dto/generate-customer-draft.dto';

@Controller('customer-drafts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomerQuotesController {
  constructor(private readonly customerQuotesService: CustomerQuotesService) {}

  @Get()
  list() {
    return this.customerQuotesService.list();
  }

  @Post('generate')
  @Audit('CUSTOMER_DRAFT_GENERATED', 'customer_draft')
  generate(@Body() dto: GenerateCustomerDraftDto, @CurrentUser() user: User) {
    return this.customerQuotesService.generate(dto, user);
  }
}
