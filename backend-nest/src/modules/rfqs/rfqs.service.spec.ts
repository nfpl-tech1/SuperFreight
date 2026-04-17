import { BadRequestException, NotFoundException } from '@nestjs/common';
jest.mock('../outlook/outlook.service', () => ({
  OutlookService: class OutlookService {},
}));

import { Repository } from 'typeorm';
import { RfqsService } from './rfqs.service';
import { CreateRfqDto } from './dto/create-rfq.dto';
import { Inquiry, InquiryStatus } from '../inquiries/entities/inquiry.entity';
import { User } from '../users/entities/user.entity';
import { Rfq } from './entities/rfq.entity';
import { RfqFieldSpec } from './entities/rfq-field-spec.entity';
import { VendorMaster } from '../vendors/entities/vendor-master.entity';
import { VendorOffice } from '../vendors/entities/vendor-office.entity';
import { VendorContact } from '../vendors/entities/vendor-contact.entity';
import { VendorCcRecipient } from '../vendors/entities/vendor-cc-recipient.entity';
import { OutlookService } from '../outlook/outlook.service';

type MockRepository<T> = Partial<
  Record<'create' | 'save' | 'findOne' | 'find', jest.Mock>
> &
  Partial<Repository<T>>;

describe('RfqsService', () => {
  let service: RfqsService;
  let rfqRepo: MockRepository<Rfq>;
  let fieldSpecRepo: MockRepository<RfqFieldSpec>;
  let inquiryRepo: MockRepository<Inquiry>;
  let vendorRepo: MockRepository<VendorMaster>;
  let officeRepo: MockRepository<VendorOffice>;
  let contactRepo: MockRepository<VendorContact>;
  let ccRepo: MockRepository<VendorCcRecipient>;
  let outlookService: {
    sendMail: jest.Mock;
  };

  let storedRfq: Partial<Rfq> | null;
  let storedInquiry: Partial<Inquiry> | null;

  const createDto = (overrides: Partial<CreateRfqDto> = {}): CreateRfqDto => ({
    inquiryId: 'inquiry-1',
    inquiryNumber: 'E123456',
    departmentId: 'ocean_freight',
    formValues: { packages: 4 },
    vendorIds: ['vendor-1'],
    officeSelections: [],
    responseFields: [
      {
        fieldKey: 'totalRate',
        fieldLabel: 'Total Rate',
        isCustom: false,
      },
    ],
    sendNow: false,
    mailSubject: 'Custom RFQ Subject',
    mailBodyHtml: '<p>Body</p>',
    ...overrides,
  });

  beforeEach(() => {
    storedRfq = null;
    storedInquiry = {
      id: 'inquiry-1',
      inquiryNumber: 'E123456',
      customerName: 'Acme',
      origin: 'Mumbai',
      destination: 'Dubai',
      shipmentMode: 'SEA',
      incoterm: 'FOB',
      cargoSummary: 'General cargo',
      status: InquiryStatus.PENDING,
    };

    rfqRepo = {
      create: jest.fn((input: Partial<Rfq>) => input),
      save: jest.fn((input: Partial<Rfq>) => {
        storedRfq = {
          ...storedRfq,
          ...input,
          id: storedRfq?.id ?? 'rfq-1',
        };
        return Promise.resolve(storedRfq);
      }),
      findOne: jest.fn(() => Promise.resolve(storedRfq)),
    };
    fieldSpecRepo = {
      create: jest.fn((input: Partial<RfqFieldSpec>) => input),
      save: jest.fn((input: Partial<RfqFieldSpec>[]) => Promise.resolve(input)),
    };
    inquiryRepo = {
      findOne: jest.fn(({ where }: { where: { id: string } }) =>
        Promise.resolve(where.id === storedInquiry?.id ? storedInquiry : null),
      ),
      save: jest.fn((input: Partial<Inquiry>) => {
        storedInquiry = {
          ...storedInquiry,
          ...input,
        };
        return Promise.resolve(storedInquiry);
      }),
    };
    vendorRepo = {
      find: jest.fn(() =>
        Promise.resolve([
          {
            id: 'vendor-1',
            companyName: 'Acme Logistics',
            primaryOfficeId: 'office-1',
          },
        ]),
      ),
    };
    officeRepo = {
      find: jest.fn(() =>
        Promise.resolve([
          {
            id: 'office-1',
            vendorId: 'vendor-1',
            officeName: 'Mumbai Office',
            isActive: true,
          },
        ]),
      ),
    };
    contactRepo = {
      find: jest.fn(() =>
        Promise.resolve([
          {
            officeId: 'office-1',
            contactName: 'Jane Smith',
            salutation: 'Ms.',
            emailPrimary: 'jane@acme.com',
            emailSecondary: null,
          },
        ]),
      ),
    };
    ccRepo = {
      find: jest.fn(() =>
        Promise.resolve([
          {
            officeId: 'office-1',
            email: 'ops@acme.com',
          },
        ]),
      ),
    };
    outlookService = {
      sendMail: jest.fn(() => Promise.resolve(undefined)),
    };

    service = new RfqsService(
      rfqRepo as Repository<Rfq>,
      fieldSpecRepo as Repository<RfqFieldSpec>,
      inquiryRepo as Repository<Inquiry>,
      vendorRepo as Repository<VendorMaster>,
      officeRepo as Repository<VendorOffice>,
      contactRepo as Repository<VendorContact>,
      ccRepo as Repository<VendorCcRecipient>,
      outlookService as unknown as OutlookService,
    );
  });

  it('creates a draft RFQ without sending mail when sendNow is false', async () => {
    const result = await service.create(createDto(), {
      id: 'user-1',
      email: 'user@example.com',
    } as User);

    expect(outlookService.sendMail).not.toHaveBeenCalled();
    expect(fieldSpecRepo.save).toHaveBeenCalledTimes(1);
    expect(result).toEqual(
      expect.objectContaining({
        id: 'rfq-1',
        sent: false,
      }),
    );
  });

  it('sends the RFQ, picks the fallback office recipient, and marks the inquiry as sent', async () => {
    const result = await service.create(
      createDto({ sendNow: true }),
      {
        id: 'user-1',
        email: 'user@example.com',
        name: 'RFQ Owner',
        emailSignature: '<p>Signature</p>',
      } as User,
      [],
    );

    expect(outlookService.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'user-1' }),
      expect.objectContaining({
        subject: 'Custom RFQ Subject',
        to: [{ address: 'jane@acme.com', name: 'Jane Smith' }],
        cc: [{ address: 'ops@acme.com' }],
      }),
    );
    expect(storedInquiry?.status).toBe(InquiryStatus.RFQ_SENT);
    expect(result).toEqual(
      expect.objectContaining({
        id: 'rfq-1',
        sent: true,
      }),
    );
  });

  it('throws when the RFQ inquiry cannot be found during send', async () => {
    storedInquiry = null;

    await expect(
      service.create(createDto({ sendNow: true }), {
        id: 'user-1',
        email: 'user@example.com',
      } as User),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(outlookService.sendMail).not.toHaveBeenCalled();
  });

  it('throws when a selected vendor has no usable recipient email', async () => {
    contactRepo.find = jest.fn(() =>
      Promise.resolve([
        {
          officeId: 'office-1',
          contactName: 'Jane Smith',
          salutation: 'Ms.',
          emailPrimary: null,
          emailSecondary: null,
        },
      ]),
    );

    await expect(
      service.create(createDto({ sendNow: true }), {
        id: 'user-1',
        email: 'user@example.com',
      } as User),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(outlookService.sendMail).not.toHaveBeenCalled();
  });
});
