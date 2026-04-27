jest.mock('./services/quote-intake.service', () => ({
  QuoteIntakeService: class QuoteIntakeService {},
}));

import { Repository } from 'typeorm';
import { ShipmentsService } from './shipments.service';
import { FreightQuote } from './entities/freight-quote.entity';
import { RateSheet } from './entities/rate-sheet.entity';
import { QuoteIntakeService } from './services/quote-intake.service';

type MockRepository<T> = Partial<
  Record<'find' | 'findOne' | 'create' | 'save', jest.Mock>
> &
  Partial<Repository<T>>;

describe('ShipmentsService', () => {
  let service: ShipmentsService;
  let rateSheetRepo: MockRepository<RateSheet>;
  let quoteRepo: MockRepository<FreightQuote>;
  let quoteIntakeService: Partial<Record<keyof QuoteIntakeService, jest.Mock>>;

  beforeEach(() => {
    rateSheetRepo = {
      find: jest.fn(),
    };
    quoteRepo = {
      find: jest.fn(() => Promise.resolve([])),
      findOne: jest.fn(),
      create: jest.fn((input: Partial<FreightQuote>) => input),
      save: jest.fn((input: Partial<FreightQuote>) => Promise.resolve(input)),
    };
    quoteIntakeService = {
      listInboundMessages: jest.fn(),
      scanNow: jest.fn(),
      reprocessInboundMessage: jest.fn(),
      ignoreInboundMessage: jest.fn(),
      linkInboundMessage: jest.fn(),
    };

    service = new ShipmentsService(
      rateSheetRepo as Repository<RateSheet>,
      quoteRepo as Repository<FreightQuote>,
      quoteIntakeService as QuoteIntakeService,
    );
  });

  it('returns only latest quote versions by default', async () => {
    await service.listQuotes({ inquiryId: 'inquiry-1', rfqId: 'rfq-1' });

    expect(quoteRepo.find).toHaveBeenCalledWith({
      where: {
        inquiryId: 'inquiry-1',
        rfqId: 'rfq-1',
        isLatestVersion: true,
      },
      order: {
        vendorName: 'ASC',
        receivedAt: 'DESC',
        createdAt: 'DESC',
      },
    });
  });

  it('includes quote history when explicitly requested', async () => {
    await service.listQuotes({
      inquiryId: 'inquiry-1',
      rfqId: 'rfq-1',
      includeHistory: true,
    });

    expect(quoteRepo.find).toHaveBeenCalledWith({
      where: {
        inquiryId: 'inquiry-1',
        rfqId: 'rfq-1',
      },
      order: {
        vendorName: 'ASC',
        receivedAt: 'DESC',
        createdAt: 'DESC',
      },
    });
  });
});
