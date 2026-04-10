import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFreightQuoteDto } from './dto/create-freight-quote.dto';
import { FreightQuote } from './entities/freight-quote.entity';
import { RateSheet } from './entities/rate-sheet.entity';
import { UpsertRateSheetDto } from './dto/upsert-rate-sheet.dto';

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectRepository(RateSheet, 'business')
    private readonly rateSheetRepo: Repository<RateSheet>,
    @InjectRepository(FreightQuote)
    private readonly quoteRepo: Repository<FreightQuote>,
  ) {}

  listRateSheets() {
    return this.rateSheetRepo.find({
      order: { effectiveMonth: 'DESC', shippingLine: 'ASC' },
    });
  }

  createRateSheet(dto: UpsertRateSheetDto) {
    return this.rateSheetRepo.save(this.rateSheetRepo.create(dto));
  }

  listQuotes(inquiryId?: string) {
    return this.quoteRepo.find({
      where: inquiryId ? { inquiryId } : {},
      order: { createdAt: 'DESC' },
    });
  }

  createQuote(dto: CreateFreightQuoteDto) {
    return this.quoteRepo.save(
      this.quoteRepo.create({
        ...dto,
        currency: dto.currency ?? 'USD',
        extractedFields: dto.extractedFields ?? null,
      }),
    );
  }
}
