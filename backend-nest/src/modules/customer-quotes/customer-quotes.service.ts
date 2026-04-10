import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerDraft } from './entities/customer-draft.entity';
import { GenerateCustomerDraftDto } from './dto/generate-customer-draft.dto';
import { FreightQuote } from '../shipments/entities/freight-quote.entity';
import { Inquiry } from '../inquiries/entities/inquiry.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CustomerQuotesService {
  constructor(
    @InjectRepository(CustomerDraft)
    private readonly draftRepo: Repository<CustomerDraft>,
    @InjectRepository(FreightQuote)
    private readonly quoteRepo: Repository<FreightQuote>,
    @InjectRepository(Inquiry, 'business')
    private readonly inquiryRepo: Repository<Inquiry>,
  ) {}

  list() {
    return this.draftRepo.find({ order: { createdAt: 'DESC' } });
  }

  async generate(dto: GenerateCustomerDraftDto, user: User) {
    const quote = await this.quoteRepo.findOne({ where: { id: dto.quoteId } });
    const inquiry = await this.inquiryRepo.findOne({
      where: { id: dto.inquiryId },
    });
    if (!quote || !inquiry) {
      throw new NotFoundException('Inquiry or quote not found');
    }

    const margin = dto.marginPercent ?? 10;
    const baseRate = Number(quote.totalRate ?? 0);
    const sellRate = Math.round(baseRate * (1 + margin / 100));
    const draftBody = `Dear Customer,\n\nThank you for your inquiry ${inquiry.inquiryNumber}.\n\nTrade Lane: ${inquiry.origin ?? 'TBC'} -> ${inquiry.destination ?? 'TBC'}\nMode: ${inquiry.shipmentMode ?? 'FREIGHT'}\nCargo: ${inquiry.cargoSummary ?? 'TBC'}\n\nOur offer: ${sellRate} ${quote.currency ?? 'USD'}\nTransit: ${quote.transitDays ?? 'TBC'} days\nValidity: ${quote.validUntil ?? 'TBC'}\n\nBest regards,\nNagarkot Forwarders Pvt. Ltd.`;

    return this.draftRepo.save(
      this.draftRepo.create({
        inquiryId: dto.inquiryId,
        quoteId: dto.quoteId,
        generatedByUserId: user.id,
        marginPercent: margin,
        subjectLine: `Quotation for ${inquiry.inquiryNumber}`,
        draftBody,
        isSelected: true,
      }),
    );
  }
}
