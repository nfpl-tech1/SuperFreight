import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from '../audit/audit.module';
import { Inquiry } from '../inquiries/entities/inquiry.entity';
import { OutlookModule } from '../outlook/outlook.module';
import { VendorCcRecipient } from '../vendors/entities/vendor-cc-recipient.entity';
import { VendorContact } from '../vendors/entities/vendor-contact.entity';
import { VendorMaster } from '../vendors/entities/vendor-master.entity';
import { VendorOffice } from '../vendors/entities/vendor-office.entity';
import { RfqFieldSpec } from './entities/rfq-field-spec.entity';
import { Rfq } from './entities/rfq.entity';
import { RfqsController } from './rfqs.controller';
import { RfqsService } from './rfqs.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Rfq, RfqFieldSpec]),
    TypeOrmModule.forFeature(
      [Inquiry, VendorMaster, VendorOffice, VendorContact, VendorCcRecipient],
      'business',
    ),
    AuditModule,
    OutlookModule,
  ],
  controllers: [RfqsController],
  providers: [RfqsService],
  exports: [RfqsService],
})
export class RfqsModule {}
