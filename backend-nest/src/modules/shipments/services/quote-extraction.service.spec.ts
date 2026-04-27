jest.mock('../../outlook/outlook.service', () => ({
  OutlookService: class OutlookService {},
}));

import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Inquiry } from '../../inquiries/entities/inquiry.entity';
import { OutlookService } from '../../outlook/outlook.service';
import { RfqFieldSpec } from '../../rfqs/entities/rfq-field-spec.entity';
import { Rfq } from '../../rfqs/entities/rfq.entity';
import { FreightQuote } from '../entities/freight-quote.entity';
import {
  QuoteInboundMessage,
  QuoteInboundMessageStatus,
} from '../entities/quote-inbound-message.entity';
import { QuoteExtractionService } from './quote-extraction.service';

type MockRepository<T> = Partial<
  Record<'create' | 'save' | 'findOne' | 'find', jest.Mock>
> &
  Partial<Repository<T>>;

describe('QuoteExtractionService', () => {
  let service: QuoteExtractionService;
  let configService: { get: jest.Mock };
  let outlookService: {
    getMessageDetailsForUser: jest.Mock;
    listMessageAttachmentsForUser: jest.Mock;
  };
  let quoteRepo: MockRepository<FreightQuote>;
  let inboundMessageRepo: MockRepository<QuoteInboundMessage>;
  let rfqRepo: MockRepository<Rfq>;
  let fieldSpecRepo: MockRepository<RfqFieldSpec>;
  let inquiryRepo: MockRepository<Inquiry>;
  let fetchMock: jest.MockedFunction<typeof fetch>;

  const inboundMessage = {
    id: 'inbound-1',
    mailboxOwnerUserId: 'user-1',
    outlookMessageId: 'msg-1',
    matchedInquiryId: 'inquiry-1',
    matchedRfqId: 'rfq-1',
    matchedVendorId: 'vendor-1',
    fromEmail: 'sales@vendor.com',
    fromName: 'Vendor Sales',
    receivedAt: new Date('2026-04-18T10:00:00.000Z'),
    rawMetadata: null,
  } as QuoteInboundMessage;

  beforeEach(() => {
    fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
    global.fetch = fetchMock;

    configService = {
      get: jest.fn((key: string) => {
        switch (key) {
          case 'gemini.apiKey':
            return 'gemini-key';
          case 'gemini.model':
            return 'gemini-2.5-flash';
          default:
            return undefined;
        }
      }),
    };
    outlookService = {
      getMessageDetailsForUser: jest.fn(() =>
        Promise.resolve({
          id: 'msg-1',
          subject: 'Re: RFQ E123456 - Ocean Freight',
          body: {
            content:
              'All-in USD 1200. Freight USD 1000. Valid till 2026-04-30. Transit 12 days.',
          },
          bodyPreview: 'All-in USD 1200',
          from: {
            emailAddress: {
              address: 'sales@vendor.com',
            },
          },
        }),
      ),
      listMessageAttachmentsForUser: jest.fn(() => Promise.resolve([])),
    };

    quoteRepo = {
      create: jest.fn((input: Partial<FreightQuote>) => input),
      findOne: jest
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: 'quote-1',
          versionNumber: 1,
          isLatestVersion: true,
          vendorName: 'Vendor Sales',
        }),
      save: jest.fn((input: Partial<FreightQuote>) =>
        Promise.resolve({
          ...input,
          id: input.id ?? 'quote-1',
        }),
      ),
    };
    inboundMessageRepo = {
      findOne: jest.fn(() => Promise.resolve(inboundMessage)),
      save: jest.fn((input: Partial<QuoteInboundMessage>) => Promise.resolve(input)),
    };
    rfqRepo = {
      findOne: jest.fn(() =>
        Promise.resolve({
          id: 'rfq-1',
          promptTemplateMeta: { selectedFields: ['All-in Rate', 'Validity'] },
        }),
      ),
    };
    fieldSpecRepo = {
      find: jest.fn(() =>
        Promise.resolve([
          { fieldKey: 'all_in_rate', fieldLabel: 'All-in Rate' },
          { fieldKey: 'validity', fieldLabel: 'Validity' },
        ]),
      ),
    };
    inquiryRepo = {
      findOne: jest.fn(() =>
        Promise.resolve({
          id: 'inquiry-1',
          inquiryNumber: 'E123456',
          customerName: 'Acme',
          tradeLane: 'India-UAE',
        }),
      ),
    };

    service = new QuoteExtractionService(
      configService as unknown as ConfigService,
      outlookService as unknown as OutlookService,
      quoteRepo as Repository<FreightQuote>,
      inboundMessageRepo as Repository<QuoteInboundMessage>,
      rfqRepo as Repository<Rfq>,
      fieldSpecRepo as Repository<RfqFieldSpec>,
      inquiryRepo as Repository<Inquiry>,
    );
  });

  it('extracts a matched inbound message into a latest quote version', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      currency: 'USD',
                      totalRate: 1200,
                      freightRate: 1000,
                      localCharges: 200,
                      documentation: null,
                      transitDays: 12,
                      validUntil: '2026-04-30',
                      remarks: 'Rates confirmed by vendor',
                      confidence: 0.92,
                      comparisonFields: {
                        all_in_rate: 1200,
                        validity: '2026-04-30',
                      },
                    }),
                  },
                ],
              },
            },
          ],
        }),
    } as Response);

    const quote = await service.processInboundMessage('inbound-1');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(quoteRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        inquiryId: 'inquiry-1',
        rfqId: 'rfq-1',
        vendorId: 'vendor-1',
        totalRate: 1200,
        reviewStatus: 'needs_review',
        versionNumber: 1,
        isLatestVersion: true,
      }),
    );
    expect(inboundMessageRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'inbound-1',
        status: QuoteInboundMessageStatus.NEEDS_REVIEW,
      }),
    );
    expect(quote).toEqual(
      expect.objectContaining({
        id: 'quote-1',
        totalRate: 1200,
      }),
    );
  });
});
