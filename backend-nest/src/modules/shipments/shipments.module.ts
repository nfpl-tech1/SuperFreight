import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from '../audit/audit.module';
import { Inquiry } from '../inquiries/entities/inquiry.entity';
import { OutlookModule } from '../outlook/outlook.module';
import { OutlookConnection } from '../outlook/entities/outlook-connection.entity';
import { Rfq } from '../rfqs/entities/rfq.entity';
import { RfqFieldSpec } from '../rfqs/entities/rfq-field-spec.entity';
import { VendorCcRecipient } from '../vendors/entities/vendor-cc-recipient.entity';
import { VendorContact } from '../vendors/entities/vendor-contact.entity';
import { VendorMaster } from '../vendors/entities/vendor-master.entity';
import { VendorOffice } from '../vendors/entities/vendor-office.entity';
import { FreightQuote } from './entities/freight-quote.entity';
import { QuoteIgnoreRule } from './entities/quote-ignore-rule.entity';
import { QuoteInboundMessage } from './entities/quote-inbound-message.entity';
import { QuoteMailboxScanState } from './entities/quote-mailbox-scan-state.entity';
import { RateSheet } from './entities/rate-sheet.entity';
import { ShipmentsController } from './shipments.controller';
import { QuoteExtractionService } from './services/quote-extraction.service';
import { QuoteIgnoreService } from './services/quote-ignore.service';
import { QuoteIntakeService } from './services/quote-intake.service';
import { QuoteMatchingService } from './services/quote-matching.service';
import { ShipmentsService } from './shipments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FreightQuote,
      OutlookConnection,
      QuoteIgnoreRule,
      QuoteInboundMessage,
      QuoteMailboxScanState,
      Rfq,
      RfqFieldSpec,
    ]),
    TypeOrmModule.forFeature(
      [Inquiry, VendorCcRecipient, VendorContact, VendorMaster, VendorOffice],
      'business',
    ),
    TypeOrmModule.forFeature([RateSheet], 'business'),
    AuditModule,
    OutlookModule,
  ],
  controllers: [ShipmentsController],
  providers: [
    ShipmentsService,
    QuoteExtractionService,
    QuoteIgnoreService,
    QuoteIntakeService,
    QuoteMatchingService,
  ],
  exports: [ShipmentsService],
})
export class ShipmentsModule {}
