import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
import { CreateFreightQuoteDto } from './dto/create-freight-quote.dto';
import { LinkQuoteInboxMessageDto } from './dto/link-quote-inbox-message.dto';
import { ListQuoteInboxDto } from './dto/list-quote-inbox.dto';
import { ListQuotesDto } from './dto/list-quotes.dto';
import { UpdateFreightQuoteDto } from './dto/update-freight-quote.dto';
import { UpsertRateSheetDto } from './dto/upsert-rate-sheet.dto';
import { ShipmentsService } from './shipments.service';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Get('rate-sheets')
  @ModuleAccess('rate-sheets', 'view')
  listRateSheets() {
    return this.shipmentsService.listRateSheets();
  }

  @Post('rate-sheets')
  @ModuleAccess('rate-sheets', 'edit')
  @Audit('RATE_SHEET_CREATED', 'rate_sheet')
  createRateSheet(@Body() dto: UpsertRateSheetDto) {
    return this.shipmentsService.createRateSheet(dto);
  }

  @Get('quotes')
  @AnyModuleAccess([
    { moduleKey: 'comparison', action: 'view' },
    { moduleKey: 'customer-quote', action: 'view' },
  ])
  listQuotes(@Query() query: ListQuotesDto) {
    return this.shipmentsService.listQuotes(query);
  }

  @Get('quote-inbox')
  @ModuleAccess('comparison', 'view')
  listQuoteInbox(@Query() query: ListQuoteInboxDto) {
    return this.shipmentsService.listQuoteInbox(query);
  }

  @Post('quote-inbox/scan')
  @ModuleAccess('comparison', 'edit')
  @Audit('QUOTE_INBOX_SCAN_TRIGGERED', 'quote_inbox')
  triggerQuoteInboxScan() {
    return this.shipmentsService.triggerQuoteInboxScan();
  }

  @Post('quote-inbox/:id/reprocess')
  @ModuleAccess('comparison', 'edit')
  @Audit('QUOTE_INBOX_REPROCESSED', 'quote_inbox')
  reprocessQuoteInboxMessage(@Param('id') id: string) {
    return this.shipmentsService.reprocessQuoteInboxMessage(id);
  }

  @Post('quote-inbox/:id/ignore')
  @ModuleAccess('comparison', 'edit')
  @Audit('QUOTE_INBOX_IGNORED', 'quote_inbox')
  ignoreQuoteInboxMessage(@Param('id') id: string) {
    return this.shipmentsService.ignoreQuoteInboxMessage(id);
  }

  @Post('quote-inbox/:id/link')
  @ModuleAccess('comparison', 'edit')
  @Audit('QUOTE_INBOX_LINKED', 'quote_inbox')
  linkQuoteInboxMessage(
    @Param('id') id: string,
    @Body() dto: LinkQuoteInboxMessageDto,
  ) {
    return this.shipmentsService.linkQuoteInboxMessage(id, dto);
  }

  @Post('quotes')
  @ModuleAccess('comparison', 'edit')
  @Audit('QUOTE_CREATED', 'quote')
  createQuote(@Body() dto: CreateFreightQuoteDto) {
    return this.shipmentsService.createQuote(dto);
  }

  @Patch('quotes/:id')
  @ModuleAccess('comparison', 'edit')
  @Audit('QUOTE_UPDATED', 'quote')
  updateQuote(
    @Param('id') id: string,
    @Body() dto: UpdateFreightQuoteDto,
    @CurrentUser() user: User,
  ) {
    return this.shipmentsService.updateQuote(id, dto, user);
  }
}
