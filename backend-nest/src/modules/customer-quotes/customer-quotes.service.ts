import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerDraft } from './entities/customer-draft.entity';
import { GenerateCustomerDraftDto } from './dto/generate-customer-draft.dto';
import { FreightQuote } from '../shipments/entities/freight-quote.entity';
import { Inquiry } from '../inquiries/entities/inquiry.entity';
import { User } from '../users/entities/user.entity';

const DEFAULT_MARGIN_PERCENT = 10;
const DEFAULT_CURRENCY = 'USD';
const UNKNOWN_VALUE_LABEL = 'TBC';
const DEFAULT_SHIPMENT_MODE = 'FREIGHT';

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
    const { quote, inquiry } = await this.loadDraftContextOrThrow(dto);
    const marginPercent = this.resolveMarginPercent(dto);
    const sellRate = this.calculateSellRate(quote, marginPercent);
    const draftBody = this.buildDraftBody(inquiry, quote, sellRate);

    return this.draftRepo.save(
      this.draftRepo.create({
        inquiryId: dto.inquiryId,
        quoteId: dto.quoteId,
        generatedByUserId: user.id,
        marginPercent,
        subjectLine: this.buildSubjectLine(inquiry),
        draftBody,
        isSelected: true,
      }),
    );
  }

  private async loadDraftContextOrThrow(dto: GenerateCustomerDraftDto) {
    const [quote, inquiry] = await Promise.all([
      this.quoteRepo.findOne({ where: { id: dto.quoteId } }),
      this.inquiryRepo.findOne({
        where: { id: dto.inquiryId },
      }),
    ]);

    if (!quote || !inquiry) {
      throw new NotFoundException('Inquiry or quote not found');
    }

    return { quote, inquiry };
  }

  private resolveMarginPercent(dto: GenerateCustomerDraftDto) {
    return dto.marginPercent ?? DEFAULT_MARGIN_PERCENT;
  }

  private calculateSellRate(quote: FreightQuote, marginPercent: number) {
    const baseRate = Number(quote.totalRate ?? 0);
    return Math.round(baseRate * (1 + marginPercent / 100));
  }

  private buildSubjectLine(inquiry: Inquiry) {
    return `Quotation for ${inquiry.inquiryNumber}`;
  }

  private buildDraftBody(
    inquiry: Inquiry,
    quote: FreightQuote,
    sellRate: number,
  ) {
    return [
      'Dear Customer,',
      '',
      `Thank you for your inquiry ${inquiry.inquiryNumber}.`,
      '',
      `Trade Lane: ${this.formatTradeLane(inquiry)}`,
      `Mode: ${inquiry.shipmentMode ?? DEFAULT_SHIPMENT_MODE}`,
      `Cargo: ${inquiry.cargoSummary ?? UNKNOWN_VALUE_LABEL}`,
      '',
      `Our offer: ${sellRate} ${quote.currency ?? DEFAULT_CURRENCY}`,
      `Transit: ${quote.transitDays ?? UNKNOWN_VALUE_LABEL} days`,
      `Validity: ${quote.validUntil ?? UNKNOWN_VALUE_LABEL}`,
      '',
      'Best regards,',
      'Nagarkot Forwarders Pvt. Ltd.',
    ].join('\n');
  }

  private formatTradeLane(inquiry: Inquiry) {
    return `${inquiry.origin ?? UNKNOWN_VALUE_LABEL} -> ${inquiry.destination ?? UNKNOWN_VALUE_LABEL}`;
  }
}
