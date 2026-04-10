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
exports.VendorMaster = void 0;
const typeorm_1 = require("typeorm");
let VendorMaster = class VendorMaster {
    id;
    companyName;
    normalizedName;
    isActive;
    notes;
    primaryOfficeId;
    createdAt;
    updatedAt;
};
exports.VendorMaster = VendorMaster;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], VendorMaster.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], VendorMaster.prototype, "companyName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], VendorMaster.prototype, "normalizedName", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], VendorMaster.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], VendorMaster.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], VendorMaster.prototype, "primaryOfficeId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], VendorMaster.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], VendorMaster.prototype, "updatedAt", void 0);
exports.VendorMaster = VendorMaster = __decorate([
    (0, typeorm_1.Index)('UQ_vendor_master_normalizedName', ['normalizedName'], { unique: true }),
    (0, typeorm_1.Index)('IDX_vendor_master_companyName', ['companyName']),
    (0, typeorm_1.Index)('IDX_vendor_master_isActive', ['isActive']),
    (0, typeorm_1.Entity)('vendor_master')
], VendorMaster);
//# sourceMappingURL=vendor-master.entity.js.map