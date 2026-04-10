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
exports.VendorTypeMaster = exports.VendorTypeCode = void 0;
const typeorm_1 = require("typeorm");
var VendorTypeCode;
(function (VendorTypeCode) {
    VendorTypeCode["TRANSPORTER"] = "TRANSPORTER";
    VendorTypeCode["CFS_BUFFER_YARD"] = "CFS_BUFFER_YARD";
    VendorTypeCode["CHA"] = "CHA";
    VendorTypeCode["IATA"] = "IATA";
    VendorTypeCode["CO_LOADER"] = "CO_LOADER";
    VendorTypeCode["CARRIER"] = "CARRIER";
    VendorTypeCode["SHIPPING_LINE"] = "SHIPPING_LINE";
    VendorTypeCode["PACKER"] = "PACKER";
    VendorTypeCode["LICENSING"] = "LICENSING";
    VendorTypeCode["WCA_AGENT"] = "WCA_AGENT";
})(VendorTypeCode || (exports.VendorTypeCode = VendorTypeCode = {}));
let VendorTypeMaster = class VendorTypeMaster {
    id;
    typeCode;
    typeName;
    description;
    sortOrder;
    isActive;
    createdAt;
    updatedAt;
};
exports.VendorTypeMaster = VendorTypeMaster;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], VendorTypeMaster.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], VendorTypeMaster.prototype, "typeCode", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], VendorTypeMaster.prototype, "typeName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], VendorTypeMaster.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], VendorTypeMaster.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], VendorTypeMaster.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], VendorTypeMaster.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], VendorTypeMaster.prototype, "updatedAt", void 0);
exports.VendorTypeMaster = VendorTypeMaster = __decorate([
    (0, typeorm_1.Index)('UQ_vendor_type_master_typeCode', ['typeCode'], { unique: true }),
    (0, typeorm_1.Index)('IDX_vendor_type_master_sortOrder_isActive', ['sortOrder', 'isActive']),
    (0, typeorm_1.Entity)('vendor_type_master')
], VendorTypeMaster);
//# sourceMappingURL=vendor-type-master.entity.js.map