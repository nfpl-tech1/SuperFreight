import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { Audit } from '../../common/decorators/audit.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '../users/entities/user.entity';
import { CreateFreightQuoteDto } from './dto/create-freight-quote.dto';
import { UpsertRateSheetDto } from './dto/upsert-rate-sheet.dto';
import { ShipmentsService } from './shipments.service';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Get('rate-sheets')
  listRateSheets() {
    return this.shipmentsService.listRateSheets();
  }

  @Post('rate-sheets')
  @Roles(Role.ADMIN)
  @Audit('RATE_SHEET_CREATED', 'rate_sheet')
  createRateSheet(@Body() dto: UpsertRateSheetDto) {
    return this.shipmentsService.createRateSheet(dto);
  }

  @Get('quotes')
  listQuotes(@Query('inquiryId') inquiryId?: string) {
    return this.shipmentsService.listQuotes(inquiryId);
  }

  @Post('quotes')
  @Audit('QUOTE_CREATED', 'quote')
  createQuote(@Body() dto: CreateFreightQuoteDto) {
    return this.shipmentsService.createQuote(dto);
  }
}
