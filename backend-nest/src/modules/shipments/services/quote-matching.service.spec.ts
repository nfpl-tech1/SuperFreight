import { Repository } from 'typeorm';
import { QuoteMatchingService } from './quote-matching.service';
import { Inquiry } from '../../inquiries/entities/inquiry.entity';
import { Rfq } from '../../rfqs/entities/rfq.entity';
import { VendorContact } from '../../vendors/entities/vendor-contact.entity';
import { VendorCcRecipient } from '../../vendors/entities/vendor-cc-recipient.entity';
import { VendorOffice } from '../../vendors/entities/vendor-office.entity';

type MockRepository<T> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('QuoteMatchingService', () => {
  let service: QuoteMatchingService;
  let rfqRepo: MockRepository<Rfq>;
  let inquiryRepo: MockRepository<Inquiry>;
  let contactRepo: MockRepository<VendorContact>;
  let ccRepo: MockRepository<VendorCcRecipient>;
  let officeRepo: MockRepository<VendorOffice>;

  beforeEach(() => {
    rfqRepo = {
      find: jest.fn(),
    };
    inquiryRepo = {
      findOne: jest.fn(),
    };
    contactRepo = {
      find: jest.fn(),
    };
    ccRepo = {
      find: jest.fn(),
    };
    officeRepo = {
      findBy: jest.fn(),
    };

    service = new QuoteMatchingService(
      rfqRepo as unknown as Repository<Rfq>,
      inquiryRepo as unknown as Repository<Inquiry>,
      contactRepo as unknown as Repository<VendorContact>,
      ccRepo as unknown as Repository<VendorCcRecipient>,
      officeRepo as unknown as Repository<VendorOffice>,
    );
  });

  it('extracts inquiry number and resolves a single sent rfq', async () => {
    inquiryRepo.findOne?.mockResolvedValue({ id: 'inquiry-1' });
    rfqRepo.find?.mockResolvedValue([
      { id: 'rfq-1', vendorIds: ['vendor-1'] },
    ]);
    contactRepo.find?.mockResolvedValue([]);
    ccRepo.find?.mockResolvedValue([]);

    await expect(
      service.matchMessage({
        fromEmail: 'vendor@example.com',
        subject: 'Re: RFQ E123456 - Ocean Freight',
      }),
    ).resolves.toEqual({
      inquiryNumber: 'E123456',
      matchedInquiryId: 'inquiry-1',
      matchedRfqId: 'rfq-1',
      matchedVendorId: null,
      matchConfidence: 'medium',
      matchReason: 'inquiry_matched_partial_resolution',
      matchedBy: ['inquiry_number', 'single_rfq_for_inquiry'],
      suggestedVendorIds: [],
      suggestedRfqIds: ['rfq-1'],
    });
  });

  it('matches vendor by sender email via active office contact', async () => {
    inquiryRepo.findOne?.mockResolvedValue(null);
    contactRepo.find?.mockResolvedValue([{ officeId: 'office-1' }]);
    ccRepo.find?.mockResolvedValue([]);
    officeRepo.findBy?.mockResolvedValue([{ vendorId: 'vendor-1' }]);

    await expect(
      service.matchMessage({
        fromEmail: 'sales@vendor.com',
        subject: 'General quote reply',
      }),
    ).resolves.toEqual({
      inquiryNumber: null,
      matchedInquiryId: null,
      matchedRfqId: null,
      matchedVendorId: 'vendor-1',
      matchConfidence: 'none',
      matchReason: 'no_inquiry_match',
      matchedBy: ['sender_exact_email'],
      suggestedVendorIds: ['vendor-1'],
      suggestedRfqIds: [],
    });
  });

  it('keeps inquiry-matched mail reviewable when multiple rfqs are possible', async () => {
    inquiryRepo.findOne?.mockResolvedValue({ id: 'inquiry-1' });
    rfqRepo.find?.mockResolvedValue([
      { id: 'rfq-1', vendorIds: ['vendor-1'] },
      { id: 'rfq-2', vendorIds: ['vendor-2'] },
    ]);
    contactRepo.find?.mockResolvedValue([]);
    ccRepo.find?.mockResolvedValue([]);

    await expect(
      service.matchMessage({
        fromEmail: 'vendor@example.com',
        subject: 'Re: E123456',
      }),
    ).resolves.toEqual({
      inquiryNumber: 'E123456',
      matchedInquiryId: 'inquiry-1',
      matchedRfqId: null,
      matchedVendorId: null,
      matchConfidence: 'low',
      matchReason: 'inquiry_matched_needs_review',
      matchedBy: ['inquiry_number'],
      suggestedVendorIds: [],
      suggestedRfqIds: ['rfq-1', 'rfq-2'],
    });
  });

  it('resolves vendor by sender domain within the inquiry vendor set', async () => {
    inquiryRepo.findOne?.mockResolvedValue({ id: 'inquiry-1' });
    rfqRepo.find?.mockResolvedValue([
      { id: 'rfq-1', vendorIds: ['vendor-1'] },
      { id: 'rfq-2', vendorIds: ['vendor-2'] },
    ]);
    contactRepo.find
      ?.mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ officeId: 'office-1' }]);
    ccRepo.find?.mockResolvedValue([]);
    officeRepo.findBy?.mockResolvedValue([{ vendorId: 'vendor-2' }]);

    await expect(
      service.matchMessage({
        fromEmail: 'pricing@vendor2.com',
        subject: 'Re: E123456',
      }),
    ).resolves.toEqual({
      inquiryNumber: 'E123456',
      matchedInquiryId: 'inquiry-1',
      matchedRfqId: 'rfq-2',
      matchedVendorId: 'vendor-2',
      matchConfidence: 'high',
      matchReason: 'inquiry_vendor_rfq_resolved',
      matchedBy: ['inquiry_number', 'sender_email_domain', 'rfq_vendor_membership'],
      suggestedVendorIds: ['vendor-2'],
      suggestedRfqIds: ['rfq-2'],
    });
  });
});
