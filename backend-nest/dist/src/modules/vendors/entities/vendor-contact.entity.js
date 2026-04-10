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
exports.VendorContact = void 0;
const typeorm_1 = require("typeorm");
let VendorContact = class VendorContact {
    id;
    officeId;
    contactName;
    salutation;
    designation;
    emailPrimary;
    emailSecondary;
    mobile1;
    mobile2;
    landline;
    whatsappNumber;
    isPrimary;
    isActive;
    notes;
    createdAt;
    updatedAt;
};
exports.VendorContact = VendorContact;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], VendorContact.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], VendorContact.prototype, "officeId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], VendorContact.prototype, "contactName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], VendorContact.prototype, "salutation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], VendorContact.prototype, "designation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], VendorContact.prototype, "emailPrimary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], VendorContact.prototype, "emailSecondary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], VendorContact.prototype, "mobile1", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], VendorContact.prototype, "mobile2", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], VendorContact.prototype, "landline", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], VendorContact.prototype, "whatsappNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], VendorContact.prototype, "isPrimary", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], VendorContact.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], VendorContact.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], VendorContact.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], VendorContact.prototype, "updatedAt", void 0);
exports.VendorContact = VendorContact = __decorate([
    (0, typeorm_1.Index)('IDX_vendor_contacts_officeId', ['officeId']),
    (0, typeorm_1.Index)('IDX_vendor_contacts_emailPrimary', ['emailPrimary']),
    (0, typeorm_1.Index)('UQ_vendor_contacts_officeId_primary', ['officeId'], {
        unique: true,
        where: '"isPrimary" = true',
    }),
    (0, typeorm_1.Entity)('vendor_contacts')
], VendorContact);
//# sourceMappingURL=vendor-contact.entity.js.map