import 'reflect-metadata';
import {
  ANY_MODULE_ACCESS_KEY,
  MODULE_ACCESS_KEY,
} from '../../common/decorators/module-access.decorator';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';

describe('VendorsController', () => {
  let controller: VendorsController;
  const controllerPrototype = VendorsController.prototype;

  beforeEach(() => {
    controller = new VendorsController({} as VendorsService);
  });

  it.each([
    ['create', controllerPrototype.create],
    ['update', controllerPrototype.update],
    ['remove', controllerPrototype.remove],
    ['createOffice', controllerPrototype.createOffice],
    ['updateOffice', controllerPrototype.updateOffice],
  ] as const)(
    'uses vendors module edit access for %s',
    (_methodName, handler) => {
      expect(Reflect.getMetadata(MODULE_ACCESS_KEY, handler)).toEqual({
        moduleKey: 'vendors',
        action: 'edit',
      });
      expect(Reflect.getMetadata(ROLES_KEY, handler)).toBeUndefined();
    },
  );

  it.each([
    ['listPortMaster', controllerPrototype.listPortMaster, 'view'],
    ['getPortMasterDetail', controllerPrototype.getPortMasterDetail, 'view'],
    ['createPortMaster', controllerPrototype.createPortMaster, 'edit'],
    ['updatePortMaster', controllerPrototype.updatePortMaster, 'edit'],
  ] as const)(
    'keeps admin-ports module access for %s',
    (_methodName, handler, action) => {
      expect(Reflect.getMetadata(MODULE_ACCESS_KEY, handler)).toEqual({
        moduleKey: 'admin-ports',
        action,
      });
    },
  );

  it('keeps vendors summary on direct vendors view access', () => {
    expect(
      Reflect.getMetadata(MODULE_ACCESS_KEY, controllerPrototype.getSummary),
    ).toEqual({
      moduleKey: 'vendors',
      action: 'view',
    });
  });

  it.each([
    [
      controllerPrototype.getLookups,
      [
        { moduleKey: 'vendors', action: 'view' },
        { moduleKey: 'rfq', action: 'view' },
      ],
    ],
    [
      controllerPrototype.getLocationOptions,
      [
        { moduleKey: 'vendors', action: 'view' },
        { moduleKey: 'inquiries', action: 'view' },
        { moduleKey: 'rfq', action: 'view' },
      ],
    ],
    [
      controllerPrototype.list,
      [
        { moduleKey: 'vendors', action: 'view' },
        { moduleKey: 'rfq', action: 'view' },
      ],
    ],
    [
      controllerPrototype.getDetail,
      [
        { moduleKey: 'vendors', action: 'view' },
        { moduleKey: 'rfq', action: 'view' },
        { moduleKey: 'comparison', action: 'view' },
      ],
    ],
  ] as const)(
    'uses any-module view access for shared vendor reads',
    (handler, requirements) => {
      expect(Reflect.getMetadata(ANY_MODULE_ACCESS_KEY, handler)).toEqual(
        requirements,
      );
      expect(Reflect.getMetadata(MODULE_ACCESS_KEY, handler)).toBeUndefined();
    },
  );
});
