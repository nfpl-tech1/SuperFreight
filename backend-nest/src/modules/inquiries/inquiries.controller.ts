import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Audit } from '../../common/decorators/audit.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  AnyModuleAccess,
  ModuleAccess,
} from '../../common/decorators/module-access.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { User } from '../users/entities/user.entity';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { TransferInquiryDto } from './dto/transfer-inquiry.dto';
import { UpdateInquiryDto } from './dto/update-inquiry.dto';
import { InquiriesService } from './inquiries.service';

@Controller('inquiries')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Get()
  @AnyModuleAccess([
    { moduleKey: 'dashboard', action: 'view' },
    { moduleKey: 'inquiries', action: 'view' },
    { moduleKey: 'rfq', action: 'view' },
    { moduleKey: 'comparison', action: 'view' },
    { moduleKey: 'customer-quote', action: 'view' },
  ])
  list(@CurrentUser() user: User) {
    return this.inquiriesService.list(user);
  }

  @Post()
  @ModuleAccess('inquiries', 'edit')
  @Audit('INQUIRY_CREATED', 'inquiry')
  create(@Body() dto: CreateInquiryDto, @CurrentUser() user: User) {
    return this.inquiriesService.create(dto, user);
  }

  @Put(':id')
  @ModuleAccess('inquiries', 'edit')
  @Audit('INQUIRY_UPDATED', 'inquiry')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateInquiryDto,
    @CurrentUser() user: User,
  ) {
    return this.inquiriesService.update(id, dto, user);
  }

  @Delete(':id')
  @ModuleAccess('inquiries', 'edit')
  @Audit('INQUIRY_DELETED', 'inquiry')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.inquiriesService.remove(id, user);
  }

  @Post(':id/transfer')
  @ModuleAccess('inquiries', 'edit')
  @Audit('INQUIRY_TRANSFERRED', 'inquiry')
  transfer(
    @Param('id') id: string,
    @Body() dto: TransferInquiryDto,
    @CurrentUser() user: User,
  ) {
    return this.inquiriesService.transfer(id, dto, user);
  }
}
