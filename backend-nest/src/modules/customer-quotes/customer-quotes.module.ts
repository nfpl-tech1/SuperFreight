import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from '../audit/audit.module';
import { Inquiry } from '../inquiries/entities/inquiry.entity';
import { FreightQuote } from '../shipments/entities/freight-quote.entity';
import { CustomerQuotesController } from './customer-quotes.controller';
import { CustomerQuotesService } from './customer-quotes.service';
import { CustomerDraft } from './entities/customer-draft.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerDraft, FreightQuote]),
    TypeOrmModule.forFeature([Inquiry], 'business'),
    AuditModule,
  ],
  controllers: [CustomerQuotesController],
  providers: [CustomerQuotesService],
})
export class CustomerQuotesModule {}
