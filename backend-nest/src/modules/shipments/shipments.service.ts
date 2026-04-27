import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFreightQuoteDto } from './dto/create-freight-quote.dto';
import { LinkQuoteInboxMessageDto } from './dto/link-quote-inbox-message.dto';
import { ListQuoteInboxDto } from './dto/list-quote-inbox.dto';
import { ListQuotesDto } from './dto/list-quotes.dto';
import { UpdateFreightQuoteDto } from './dto/update-freight-quote.dto';
import { FreightQuote } from './entities/freight-quote.entity';
import { RateSheet } from './entities/rate-sheet.entity';
import { UpsertRateSheetDto } from './dto/upsert-rate-sheet.dto';
import { QuoteIntakeService } from './services/quote-intake.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectRepository(RateSheet, 'business')
    private readonly rateSheetRepo: Repository<RateSheet>,
    @InjectRepository(FreightQuote)
    private readonly quoteRepo: Repository<FreightQuote>,
    private readonly quoteIntakeService: QuoteIntakeService,
  ) {}

  listRateSheets() {
    return this.rateSheetRepo.find({
      order: { effectiveMonth: 'DESC', shippingLine: 'ASC' },
    });
  }

  createRateSheet(dto: UpsertRateSheetDto) {
    return this.rateSheetRepo.save(this.rateSheetRepo.create(dto));
  }

  listQuotes(query: ListQuotesDto = {}) {
    return this.quoteRepo.find({
      where: {
        ...(query.inquiryId ? { inquiryId: query.inquiryId } : {}),
        ...(query.rfqId ? { rfqId: query.rfqId } : {}),
        ...(query.includeHistory ? {} : { isLatestVersion: true }),
      },
      order: { vendorName: 'ASC', receivedAt: 'DESC', createdAt: 'DESC' },
    });
  }

  listQuoteInbox(query: ListQuoteInboxDto = {}) {
    return this.quoteIntakeService.listInboundMessages(query);
  }

  triggerQuoteInboxScan() {
    return this.quoteIntakeService.scanNow();
  }

  reprocessQuoteInboxMessage(id: string) {
    return this.quoteIntakeService.reprocessInboundMessage(id);
  }

  ignoreQuoteInboxMessage(id: string) {
    return this.quoteIntakeService.ignoreInboundMessage(id);
  }

  linkQuoteInboxMessage(id: string, dto: LinkQuoteInboxMessageDto) {
    return this.quoteIntakeService.linkInboundMessage(id, dto);
  }

  createQuote(dto: CreateFreightQuoteDto) {
    return this.quoteRepo.save(
      this.quoteRepo.create({
        ...dto,
        currency: dto.currency ?? 'USD',
        extractedFields: dto.extractedFields ?? null,
        comparisonFields: null,
        inboundMessageId: null,
        receivedAt: null,
        reviewStatus: 'manual',
        versionNumber: 1,
        isLatestVersion: true,
        extractionConfidence: null,
        reviewedByUserId: null,
        reviewedAt: null,
      }),
    );
  }

  async updateQuote(id: string, dto: UpdateFreightQuoteDto, user: User) {
    const quote = await this.quoteRepo.findOne({ where: { id } });
    if (!quote) {
      throw new NotFoundException('Quote not found.');
    }

    Object.assign(quote, dto);
    quote.reviewStatus = dto.reviewStatus ?? quote.reviewStatus ?? 'reviewed';
    quote.reviewedByUserId = user.id;
    quote.reviewedAt = new Date();

    return this.quoteRepo.save(quote);
  }
}
