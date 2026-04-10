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
exports.VendorOffice = void 0;
const typeorm_1 = require("typeorm");
let VendorOffice = class VendorOffice {
    id;
    vendorId;
    officeName;
    cityName;
    stateName;
    countryName;
    addressRaw;
    externalCode;
    specializationRaw;
    isActive;
    isIataCertified;
    doesSeaFreight;
    doesProjectCargo;
    doesOwnConsolidation;
    doesOwnTransportation;
    doesOwnWarehousing;
    doesOwnCustomClearance;
    createdAt;
    updatedAt;
};
exports.VendorOffice = VendorOffice;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], VendorOffice.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], VendorOffice.prototype, "vendorId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], VendorOffice.prototype, "officeName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], VendorOffice.prototype, "cityName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], VendorOffice.prototype, "stateName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], VendorOffice.prototype, "countryName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], VendorOffice.prototype, "addressRaw", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], VendorOffice.prototype, "externalCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], VendorOffice.prototype, "specializationRaw", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], VendorOffice.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], VendorOffice.prototype, "isIataCertified", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], VendorOffice.prototype, "doesSeaFreight", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], VendorOffice.prototype, "doesProjectCargo", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], VendorOffice.prototype, "doesOwnConsolidation", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], VendorOffice.prototype, "doesOwnTransportation", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], VendorOffice.prototype, "doesOwnWarehousing", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], VendorOffice.prototype, "doesOwnCustomClearance", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], VendorOffice.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], VendorOffice.prototype, "updatedAt", void 0);
exports.VendorOffice = VendorOffice = __decorate([
    (0, typeorm_1.Index)('UQ_vendor_offices_vendorId_officeName', ['vendorId', 'officeName'], {
        unique: true,
    }),
    (0, typeorm_1.Index)('IDX_vendor_offices_vendorId', ['vendorId']),
    (0, typeorm_1.Index)('IDX_vendor_offices_country_city', ['countryName', 'cityName']),
    (0, typeorm_1.Index)('IDX_vendor_offices_externalCode', ['externalCode']),
    (0, typeorm_1.Index)('IDX_vendor_offices_isActive', ['isActive']),
    (0, typeorm_1.Entity)('vendor_offices')
], VendorOffice);
//# sourceMappingURL=vendor-office.entity.js.map