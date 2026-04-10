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
exports.VendorOfficeServiceLocation = void 0;
const typeorm_1 = require("typeorm");
let VendorOfficeServiceLocation = class VendorOfficeServiceLocation {
    id;
    officeId;
    serviceLocationId;
    isPrimary;
    notes;
    createdAt;
    updatedAt;
};
exports.VendorOfficeServiceLocation = VendorOfficeServiceLocation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], VendorOfficeServiceLocation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], VendorOfficeServiceLocation.prototype, "officeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], VendorOfficeServiceLocation.prototype, "serviceLocationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], VendorOfficeServiceLocation.prototype, "isPrimary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], VendorOfficeServiceLocation.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], VendorOfficeServiceLocation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], VendorOfficeServiceLocation.prototype, "updatedAt", void 0);
exports.VendorOfficeServiceLocation = VendorOfficeServiceLocation = __decorate([
    (0, typeorm_1.Index)('UQ_vendor_office_service_locations_officeId_serviceLocationId', ['officeId', 'serviceLocationId'], { unique: true }),
    (0, typeorm_1.Index)('IDX_vendor_office_service_locations_serviceLocationId', [
        'serviceLocationId',
    ]),
    (0, typeorm_1.Index)('UQ_vendor_office_service_locations_officeId_primary', ['officeId'], {
        unique: true,
        where: '"isPrimary" = true',
    }),
    (0, typeorm_1.Entity)('vendor_office_service_locations')
], VendorOfficeServiceLocation);
//# sourceMappingURL=vendor-office-service-location.entity.js.map