import { BadRequestException } from '@nestjs/common';
jest.mock('./rfqs.service', () => ({
  RfqsService: class RfqsService {},
}));

import { RfqsController } from './rfqs.controller';
import { CreateRfqDto } from './dto/create-rfq.dto';
import { RfqsService } from './rfqs.service';
import { User } from '../users/entities/user.entity';

describe('RfqsController', () => {
  let controller: RfqsController;
  let rfqsService: {
    list: jest.Mock;
    create: jest.Mock;
  };

  beforeEach(() => {
    rfqsService = {
      list: jest.fn(),
      create: jest.fn(),
    };

    controller = new RfqsController(rfqsService as unknown as RfqsService);
  });

  it('delegates list calls to the RFQ service', () => {
    rfqsService.list.mockReturnValue(['rfq-1']);

    expect(controller.list()).toEqual(['rfq-1']);
    expect(rfqsService.list).toHaveBeenCalledTimes(1);
  });

  it('parses multipart-style create payloads before delegating to the RFQ service', async () => {
    rfqsService.create.mockResolvedValue({ id: 'rfq-1' });

    const files = [] as Express.Multer.File[];
    const user = { id: 'user-1' } as User;
    const rawBody = {
      inquiryId: 'inquiry-1',
      inquiryNumber: 'E123456',
      departmentId: 'ocean-freight',
      formValues: JSON.stringify({ cargoType: 'General', packages: 4 }),
      vendorIds: JSON.stringify(['vendor-1', 'vendor-2']),
      officeSelections: JSON.stringify([
        { vendorId: 'vendor-1', officeId: 'office-1' },
      ]),
      responseFields: JSON.stringify([
        {
          fieldKey: 'totalRate',
          fieldLabel: 'Total Rate',
          isCustom: false,
        },
      ]),
      sendNow: 'true',
      mailSubject: 'Test RFQ',
      mailBodyHtml: '<p>Hello</p>',
    };

    await controller.create(rawBody, files, user);

    expect(rfqsService.create).toHaveBeenCalledWith(
      expect.objectContaining<CreateRfqDto>({
        inquiryId: 'inquiry-1',
        inquiryNumber: 'E123456',
        departmentId: 'ocean-freight',
        formValues: { cargoType: 'General', packages: 4 },
        vendorIds: ['vendor-1', 'vendor-2'],
        officeSelections: [{ vendorId: 'vendor-1', officeId: 'office-1' }],
        responseFields: [
          {
            fieldKey: 'totalRate',
            fieldLabel: 'Total Rate',
            isCustom: false,
          },
        ],
        sendNow: true,
        mailSubject: 'Test RFQ',
        mailBodyHtml: '<p>Hello</p>',
      }),
      user,
      files,
    );
  });

  it('throws a bad request when a JSON field is invalid', () => {
    expect(() =>
      controller.create(
        {
          inquiryId: 'inquiry-1',
          inquiryNumber: 'E123456',
          departmentId: 'ocean-freight',
          formValues: '{invalid-json',
          vendorIds: '[]',
          responseFields: '[]',
        },
        [] as Express.Multer.File[],
        { id: 'user-1' } as User,
      ),
    ).toThrow(BadRequestException);

    expect(rfqsService.create).not.toHaveBeenCalled();
  });

  it('throws a bad request when required RFQ fields are missing', () => {
    expect(() =>
      controller.create(
        {
          inquiryNumber: 'E123456',
          departmentId: 'ocean-freight',
          formValues: '{}',
          vendorIds: '[]',
          responseFields: '[]',
        },
        [] as Express.Multer.File[],
        { id: 'user-1' } as User,
      ),
    ).toThrow(BadRequestException);

    expect(rfqsService.create).not.toHaveBeenCalled();
  });
});
