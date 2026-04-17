import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CustomerQuotesService } from './customer-quotes.service';
import { CustomerDraft } from './entities/customer-draft.entity';
import { FreightQuote } from '../shipments/entities/freight-quote.entity';
import { Inquiry } from '../inquiries/entities/inquiry.entity';
import { GenerateCustomerDraftDto } from './dto/generate-customer-draft.dto';
import { User } from '../users/entities/user.entity';

type DraftCreateInput = Partial<CustomerDraft>;

describe('CustomerQuotesService', () => {
  let service: CustomerQuotesService;
  let savedDraft: DraftCreateInput | undefined;
  let draftRepo: {
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let quoteRepo: {
    findOne: jest.Mock;
  };
  let inquiryRepo: {
    findOne: jest.Mock;
  };

  beforeEach(() => {
    savedDraft = undefined;
    draftRepo = {
      find: jest.fn(),
      create: jest.fn((input: DraftCreateInput): DraftCreateInput => input),
      save: jest.fn((input: DraftCreateInput): Promise<CustomerDraft> => {
        savedDraft = input;
        return Promise.resolve({ id: 'draft-1', ...input } as CustomerDraft);
      }),
    };
    quoteRepo = {
      findOne: jest.fn(),
    };
    inquiryRepo = {
      findOne: jest.fn(),
    };

    service = new CustomerQuotesService(
      draftRepo as unknown as Repository<CustomerDraft>,
      quoteRepo as unknown as Repository<FreightQuote>,
      inquiryRepo as unknown as Repository<Inquiry>,
    );
  });

  it('generates a draft with the default margin and fallback labels', async () => {
    quoteRepo.findOne.mockResolvedValue({
      id: 'quote-1',
      totalRate: 100,
      currency: null,
      transitDays: null,
      validUntil: null,
    } as FreightQuote);
    inquiryRepo.findOne.mockResolvedValue({
      id: 'inquiry-1',
      inquiryNumber: 'E123456',
      origin: null,
      destination: 'Dubai',
      shipmentMode: null,
      cargoSummary: null,
    } as Inquiry);

    const result = await service.generate(
      {
        inquiryId: 'inquiry-1',
        quoteId: 'quote-1',
      } as GenerateCustomerDraftDto,
      { id: 'user-1' } as User,
    );

    expect(draftRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        inquiryId: 'inquiry-1',
        quoteId: 'quote-1',
        generatedByUserId: 'user-1',
        marginPercent: 10,
        subjectLine: 'Quotation for E123456',
        isSelected: true,
      }),
    );
    expect(draftRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        draftBody: [
          'Dear Customer,',
          '',
          'Thank you for your inquiry E123456.',
          '',
          'Trade Lane: TBC -> Dubai',
          'Mode: FREIGHT',
          'Cargo: TBC',
          '',
          'Our offer: 110 USD',
          'Transit: TBC days',
          'Validity: TBC',
          '',
          'Best regards,',
          'Nagarkot Forwarders Pvt. Ltd.',
        ].join('\n'),
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        id: 'draft-1',
        subjectLine: 'Quotation for E123456',
      }),
    );
  });

  it('uses the provided margin percent when calculating the sell rate', async () => {
    quoteRepo.findOne.mockResolvedValue({
      id: 'quote-1',
      totalRate: 89.6,
      currency: 'INR',
      transitDays: 5,
      validUntil: '2026-04-30',
    } as FreightQuote);
    inquiryRepo.findOne.mockResolvedValue({
      id: 'inquiry-1',
      inquiryNumber: 'E654321',
      origin: 'Mumbai',
      destination: 'Singapore',
      shipmentMode: 'SEA',
      cargoSummary: 'Machinery',
    } as Inquiry);

    await service.generate(
      {
        inquiryId: 'inquiry-1',
        quoteId: 'quote-1',
        marginPercent: 12.5,
      } as GenerateCustomerDraftDto,
      { id: 'user-1' } as User,
    );

    expect(savedDraft?.marginPercent).toBe(12.5);
    expect(savedDraft?.draftBody).toContain('Our offer: 101 INR');
  });

  it('throws when the quote or inquiry cannot be found', async () => {
    quoteRepo.findOne.mockResolvedValue(null);
    inquiryRepo.findOne.mockResolvedValue({
      id: 'inquiry-1',
      inquiryNumber: 'E123456',
    } as Inquiry);

    await expect(
      service.generate(
        {
          inquiryId: 'inquiry-1',
          quoteId: 'quote-1',
        } as GenerateCustomerDraftDto,
        { id: 'user-1' } as User,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(draftRepo.create).not.toHaveBeenCalled();
    expect(draftRepo.save).not.toHaveBeenCalled();
  });
});
