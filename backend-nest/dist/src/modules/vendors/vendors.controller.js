"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorsController = void 0;
const common_1 = require("@nestjs/common");
const audit_decorator_1 = require("../../common/decorators/audit.decorator");
const module_access_decorator_1 = require("../../common/decorators/module-access.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const user_entity_1 = require("../users/entities/user.entity");
const create_vendor_dto_1 = require("./dto/create-vendor.dto");
const create_vendor_office_dto_1 = require("./dto/create-vendor-office.dto");
const create_port_master_dto_1 = require("./dto/create-port-master.dto");
const list_vendor_location_options_dto_1 = require("./dto/list-vendor-location-options.dto");
const list_port_master_dto_1 = require("./dto/list-port-master.dto");
const list_vendors_dto_1 = require("./dto/list-vendors.dto");
const update_port_master_dto_1 = require("./dto/update-port-master.dto");
const update_vendor_dto_1 = require("./dto/update-vendor.dto");
const update_vendor_office_dto_1 = require("./dto/update-vendor-office.dto");
const vendors_service_1 = require("./vendors.service");
let VendorsController = class VendorsController {
    vendorsService;
    constructor(vendorsService) {
        this.vendorsService = vendorsService;
    }
    getSummary() {
        return this.vendorsService.getCatalogSummary();
    }
    getLookups() {
        return this.vendorsService.getCatalogLookups();
    }
    getLocationOptions(query) {
        return this.vendorsService.getLocationOptions(query);
    }
    listPortMaster(query) {
        return this.vendorsService.listPortMaster(query);
    }
    getPortMasterDetail(id) {
        return this.vendorsService.getPortMasterDetail(id);
    }
    list(query) {
        return this.vendorsService.listVendors(query);
    }
    getDetail(id) {
        return this.vendorsService.getVendorDetail(id);
    }
    create(dto) {
        return this.vendorsService.createVendor(dto);
    }
    createPortMaster(dto) {
        return this.vendorsService.createPortMaster(dto);
    }
    update(id, dto) {
        return this.vendorsService.updateVendor(id, dto);
    }
    updatePortMaster(id, dto) {
        return this.vendorsService.updatePortMaster(id, dto);
    }
    remove(id) {
        return this.vendorsService.deleteVendor(id);
    }
    createOffice(vendorId, dto) {
        return this.vendorsService.createOffice(vendorId, dto);
    }
    updateOffice(officeId, dto) {
        return this.vendorsService.updateOffice(officeId, dto);
    }
};
exports.VendorsController = VendorsController;
__decorate([
    (0, common_1.Get)('summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('lookups'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "getLookups", null);
__decorate([
    (0, common_1.Get)('location-options'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_vendor_location_options_dto_1.ListVendorLocationOptionsDto]),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "getLocationOptions", null);
__decorate([
    (0, common_1.Get)('port-master'),
    (0, module_access_decorator_1.ModuleAccess)('admin-ports', 'view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_port_master_dto_1.ListPortMasterDto]),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "listPortMaster", null);
__decorate([
    (0, common_1.Get)('port-master/:id'),
    (0, module_access_decorator_1.ModuleAccess)('admin-ports', 'view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "getPortMasterDetail", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_vendors_dto_1.ListVendorsDto]),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "getDetail", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_entity_1.Role.ADMIN),
    (0, audit_decorator_1.Audit)('VENDOR_CREATED', 'vendor_master'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_vendor_dto_1.CreateVendorDto]),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('port-master'),
    (0, module_access_decorator_1.ModuleAccess)('admin-ports', 'edit'),
    (0, audit_decorator_1.Audit)('PORT_MASTER_CREATED', 'port_master'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_port_master_dto_1.CreatePortMasterDto]),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "createPortMaster", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.Role.ADMIN),
    (0, audit_decorator_1.Audit)('VENDOR_UPDATED', 'vendor_master'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_vendor_dto_1.UpdateVendorDto]),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "update", null);
__decorate([
    (0, common_1.Put)('port-master/:id'),
    (0, module_access_decorator_1.ModuleAccess)('admin-ports', 'edit'),
    (0, audit_decorator_1.Audit)('PORT_MASTER_UPDATED', 'port_master'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_port_master_dto_1.UpdatePortMasterDto]),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "updatePortMaster", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.Role.ADMIN),
    (0, audit_decorator_1.Audit)('VENDOR_DELETED', 'vendor_master'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':vendorId/offices'),
    (0, roles_decorator_1.Roles)(user_entity_1.Role.ADMIN),
    (0, audit_decorator_1.Audit)('VENDOR_OFFICE_CREATED', 'vendor_office'),
    __param(0, (0, common_1.Param)('vendorId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_vendor_office_dto_1.CreateVendorOfficeDto]),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "createOffice", null);
__decorate([
    (0, common_1.Put)('offices/:officeId'),
    (0, roles_decorator_1.Roles)(user_entity_1.Role.ADMIN),
    (0, audit_decorator_1.Audit)('VENDOR_OFFICE_UPDATED', 'vendor_office'),
    __param(0, (0, common_1.Param)('officeId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_vendor_office_dto_1.UpdateVendorOfficeDto]),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "updateOffice", null);
exports.VendorsController = VendorsController = __decorate([
    (0, common_1.Controller)('vendors'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [vendors_service_1.VendorsService])
], VendorsController);
//# sourceMappingURL=vendors.controller.js.map