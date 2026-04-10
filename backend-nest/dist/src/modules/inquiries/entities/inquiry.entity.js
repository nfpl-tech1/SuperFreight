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
exports.Inquiry = exports.InquiryCustomerRole = exports.ShipmentMode = exports.TradeLane = exports.InquiryStatus = exports.InquiryType = void 0;
const typeorm_1 = require("typeorm");
var InquiryType;
(function (InquiryType) {
    InquiryType["CHA_ONLY"] = "CHA_ONLY";
    InquiryType["FREIGHT_ONLY"] = "FREIGHT_ONLY";
    InquiryType["CHA_FREIGHT"] = "CHA_FREIGHT";
})(InquiryType || (exports.InquiryType = InquiryType = {}));
var InquiryStatus;
(function (InquiryStatus) {
    InquiryStatus["PENDING"] = "PENDING";
    InquiryStatus["RFQ_SENT"] = "RFQ_SENT";
    InquiryStatus["QUOTES_RECEIVED"] = "QUOTES_RECEIVED";
    InquiryStatus["QUOTED_TO_CUSTOMER"] = "QUOTED_TO_CUSTOMER";
    InquiryStatus["CLOSED"] = "CLOSED";
})(InquiryStatus || (exports.InquiryStatus = InquiryStatus = {}));
var TradeLane;
(function (TradeLane) {
    TradeLane["EXPORT"] = "Export";
    TradeLane["IMPORT"] = "Import";
    TradeLane["CROSS_TRADE"] = "Cross Trade";
})(TradeLane || (exports.TradeLane = TradeLane = {}));
var ShipmentMode;
(function (ShipmentMode) {
    ShipmentMode["AIR"] = "AIR";
    ShipmentMode["FCL"] = "FCL";
    ShipmentMode["LCL"] = "LCL";
})(ShipmentMode || (exports.ShipmentMode = ShipmentMode = {}));
var InquiryCustomerRole;
(function (InquiryCustomerRole) {
    InquiryCustomerRole["CONSIGNEE"] = "Consignee/Agent";
    InquiryCustomerRole["SHIPPER"] = "Shipper";
})(InquiryCustomerRole || (exports.InquiryCustomerRole = InquiryCustomerRole = {}));
let Inquiry = class Inquiry {
    id;
    inquiryNumber;
    inquiryType;
    status;
    customerName;
    customerRole;
    tradeLane;
    origin;
    destination;
    shipmentMode;
    incoterm;
    cargoSummary;
    ownerUserId;
    mailboxOwnerUserId;
    latestClientThreadKey;
    latestAgentThreadKey;
    firstReadAt;
    lastMailEventAt;
    extractedData;
    aiMeta;
    createdAt;
    updatedAt;
};
exports.Inquiry = Inquiry;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Inquiry.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Inquiry.prototype, "inquiryNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: InquiryType,
        default: InquiryType.FREIGHT_ONLY,
    }),
    __metadata("design:type", String)
], Inquiry.prototype, "inquiryType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: InquiryStatus, default: InquiryStatus.PENDING }),
    __metadata("design:type", String)
], Inquiry.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Inquiry.prototype, "customerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Inquiry.prototype, "customerRole", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Inquiry.prototype, "tradeLane", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Inquiry.prototype, "origin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Inquiry.prototype, "destination", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Inquiry.prototype, "shipmentMode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Inquiry.prototype, "incoterm", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Inquiry.prototype, "cargoSummary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Inquiry.prototype, "ownerUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Inquiry.prototype, "mailboxOwnerUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Inquiry.prototype, "latestClientThreadKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Inquiry.prototype, "latestAgentThreadKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], Inquiry.prototype, "firstReadAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], Inquiry.prototype, "lastMailEventAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Inquiry.prototype, "extractedData", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Inquiry.prototype, "aiMeta", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Inquiry.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Inquiry.prototype, "updatedAt", void 0);
exports.Inquiry = Inquiry = __decorate([
    (0, typeorm_1.Index)('IDX_inquiries_createdAt', ['createdAt']),
    (0, typeorm_1.Index)('IDX_inquiries_ownerUserId_createdAt', ['ownerUserId', 'createdAt']),
    (0, typeorm_1.Index)('IDX_inquiries_mailboxOwnerUserId_createdAt', [
        'mailboxOwnerUserId',
        'createdAt',
    ]),
    (0, typeorm_1.Entity)('inquiries')
], Inquiry);
//# sourceMappingURL=inquiry.entity.js.map