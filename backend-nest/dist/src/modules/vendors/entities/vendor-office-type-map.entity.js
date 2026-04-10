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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorOfficeTypeMap = void 0;
const typeorm_1 = require("typeorm");
let VendorOfficeTypeMap = class VendorOfficeTypeMap {
    id;
    officeId;
    vendorTypeId;
    isActive;
    createdAt;
    updatedAt;
};
exports.VendorOfficeTypeMap = VendorOfficeTypeMap;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], VendorOfficeTypeMap.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], VendorOfficeTypeMap.prototype, "officeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], VendorOfficeTypeMap.prototype, "vendorTypeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], VendorOfficeTypeMap.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], VendorOfficeTypeMap.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], VendorOfficeTypeMap.prototype, "updatedAt", void 0);
exports.VendorOfficeTypeMap = VendorOfficeTypeMap = __decorate([
    (0, typeorm_1.Index)('UQ_vendor_office_type_map_officeId_vendorTypeId', ['officeId', 'vendorTypeId'], { unique: true }),
    (0, typeorm_1.Index)('IDX_vendor_office_type_map_vendorTypeId', ['vendorTypeId']),
    (0, typeorm_1.Entity)('vendor_office_type_map')
], VendorOfficeTypeMap);
//# sourceMappingURL=vendor-office-type-map.entity.js.map