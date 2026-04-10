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
exports.VendorCcRecipient = void 0;
const typeorm_1 = require("typeorm");
let VendorCcRecipient = class VendorCcRecipient {
    id;
    officeId;
    email;
    isActive;
    createdAt;
    updatedAt;
};
exports.VendorCcRecipient = VendorCcRecipient;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], VendorCcRecipient.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], VendorCcRecipient.prototype, "officeId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], VendorCcRecipient.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], VendorCcRecipient.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], VendorCcRecipient.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], VendorCcRecipient.prototype, "updatedAt", void 0);
exports.VendorCcRecipient = VendorCcRecipient = __decorate([
    (0, typeorm_1.Index)('UQ_vendor_cc_recipients_officeId_email', ['officeId', 'email'], {
        unique: true,
    }),
    (0, typeorm_1.Index)('IDX_vendor_cc_recipients_officeId', ['officeId']),
    (0, typeorm_1.Entity)('vendor_cc_recipients')
], VendorCcRecipient);
//# sourceMappingURL=vendor-cc-recipient.entity.js.map