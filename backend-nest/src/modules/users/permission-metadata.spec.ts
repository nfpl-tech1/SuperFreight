import 'reflect-metadata';
jest.mock('../customer-quotes/customer-quotes.service', () => ({
  CustomerQuotesService: class CustomerQuotesService {},
}));
jest.mock('../inquiries/inquiries.service', () => ({
  InquiriesService: class InquiriesService {},
}));
jest.mock('../outlook/outlook.service', () => ({
  OutlookService: class OutlookService {},
}));
jest.mock('../rfqs/rfqs.service', () => ({
  RfqsService: class RfqsService {},
}));
jest.mock('../shipments/shipments.service', () => ({
  ShipmentsService: class ShipmentsService {},
}));
jest.mock('./roles.service', () => ({
  RolesService: class RolesService {},
}));
jest.mock('./users.service', () => ({
  UsersService: class UsersService {},
}));

import { MODULE_ACCESS_KEY } from '../../common/decorators/module-access.decorator';
import { ANY_MODULE_ACCESS_KEY } from '../../common/decorators/module-access.decorator';
import { CustomerQuotesController } from '../customer-quotes/customer-quotes.controller';
import { InquiriesController } from '../inquiries/inquiries.controller';
import { OutlookController } from '../outlook/outlook.controller';
import { RfqsController } from '../rfqs/rfqs.controller';
import { ShipmentsController } from '../shipments/shipments.controller';
import { RolesController } from './roles.controller';
import { UsersController } from './users.controller';

describe('permission metadata audit', () => {
  it.each([
    [UsersController.prototype.getAll, 'admin-users', 'view'],
    [UsersController.prototype.create, 'admin-users', 'edit'],
    [UsersController.prototype.update, 'admin-users', 'edit'],
    [UsersController.prototype.updateDepartments, 'admin-users', 'edit'],
    [UsersController.prototype.assignRoles, 'admin-users', 'edit'],
    [UsersController.prototype.updateMySignature, 'profile', 'edit'],
    [RolesController.prototype.create, 'admin-roles', 'edit'],
    [RolesController.prototype.update, 'admin-roles', 'edit'],
    [RolesController.prototype.remove, 'admin-roles', 'edit'],
    [OutlookController.prototype.getStatus, 'profile', 'view'],
    [OutlookController.prototype.getConnectUrl, 'profile', 'edit'],
    [OutlookController.prototype.complete, 'profile', 'edit'],
    [OutlookController.prototype.reconnect, 'profile', 'edit'],
    [CustomerQuotesController.prototype.list, 'customer-quote', 'view'],
    [CustomerQuotesController.prototype.generate, 'customer-quote', 'edit'],
    [InquiriesController.prototype.create, 'inquiries', 'edit'],
    [InquiriesController.prototype.update, 'inquiries', 'edit'],
    [InquiriesController.prototype.remove, 'inquiries', 'edit'],
    [InquiriesController.prototype.transfer, 'inquiries', 'edit'],
    [RfqsController.prototype.create, 'rfq', 'edit'],
    [ShipmentsController.prototype.listRateSheets, 'rate-sheets', 'view'],
    [ShipmentsController.prototype.createRateSheet, 'rate-sheets', 'edit'],
    [ShipmentsController.prototype.listQuoteInbox, 'comparison', 'view'],
    [ShipmentsController.prototype.triggerQuoteInboxScan, 'comparison', 'edit'],
    [ShipmentsController.prototype.reprocessQuoteInboxMessage, 'comparison', 'edit'],
    [ShipmentsController.prototype.ignoreQuoteInboxMessage, 'comparison', 'edit'],
    [ShipmentsController.prototype.linkQuoteInboxMessage, 'comparison', 'edit'],
    [ShipmentsController.prototype.createQuote, 'comparison', 'edit'],
    [ShipmentsController.prototype.updateQuote, 'comparison', 'edit'],
  ] as const)('attaches module access %s %s', (handler, moduleKey, action) => {
    expect(Reflect.getMetadata(MODULE_ACCESS_KEY, handler)).toEqual({
      moduleKey,
      action,
    });
  });

  it.each([
    [
      RolesController.prototype.getAll,
      [
        { moduleKey: 'admin-roles', action: 'view' },
        { moduleKey: 'admin-users', action: 'view' },
      ],
    ],
    [
      InquiriesController.prototype.list,
      [
        { moduleKey: 'dashboard', action: 'view' },
        { moduleKey: 'inquiries', action: 'view' },
        { moduleKey: 'rfq', action: 'view' },
        { moduleKey: 'comparison', action: 'view' },
        { moduleKey: 'customer-quote', action: 'view' },
      ],
    ],
    [
      RfqsController.prototype.list,
      [
        { moduleKey: 'rfq', action: 'view' },
        { moduleKey: 'comparison', action: 'view' },
      ],
    ],
    [
      ShipmentsController.prototype.listQuotes,
      [
        { moduleKey: 'comparison', action: 'view' },
        { moduleKey: 'customer-quote', action: 'view' },
      ],
    ],
  ] as const)('attaches any-module access metadata', (handler, requirements) => {
    expect(Reflect.getMetadata(ANY_MODULE_ACCESS_KEY, handler)).toEqual(
      requirements,
    );
  });
});
