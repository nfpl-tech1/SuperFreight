import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from '../audit/audit.module';
import { FreightQuote } from './entities/freight-quote.entity';
import { RateSheet } from './entities/rate-sheet.entity';
import { ShipmentsController } from './shipments.controller';
import { ShipmentsService } from './shipments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FreightQuote]),
    TypeOrmModule.forFeature([RateSheet], 'business'),
    AuditModule,
  ],
  controllers: [ShipmentsController],
  providers: [ShipmentsService],
  exports: [ShipmentsService],
})
export class ShipmentsModule {}
