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
exports.FreightQuote = void 0;
const typeorm_1 = require("typeorm");
let FreightQuote = class FreightQuote {
    id;
    inquiryId;
    rfqId;
    vendorId;
    vendorName;
    currency;
    totalRate;
    freightRate;
    localCharges;
    documentation;
    transitDays;
    validUntil;
    sourceThreadRefId;
    inboundMessageId;
    receivedAt;
    extractedFields;
    comparisonFields;
    quotePromptSnapshot;
    reviewStatus;
    versionNumber;
    isLatestVersion;
    extractionConfidence;
    reviewedByUserId;
    reviewedAt;
    remarks;
    isSelected;
    createdAt;
    updatedAt;
};
exports.FreightQuote = FreightQuote;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FreightQuote.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FreightQuote.prototype, "inquiryId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], FreightQuote.prototype, "rfqId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], FreightQuote.prototype, "vendorId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FreightQuote.prototype, "vendorName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], FreightQuote.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', nullable: true }),
    __metadata("design:type", Object)
], FreightQuote.prototype, "totalRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', nullable: true }),
    __metadata("design:type", Object)
], FreightQuote.prototype, "freightRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', nullable: true }),
    __metadata("design:type", Object)
], FreightQuote.prototype, "localCharges", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', nullable: true }),
    __metadata("design:type", Object)
], FreightQuote.prototype, "documentation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Object)
], FreightQuote.prototype, "transitDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Object)
], FreightQuote.prototype, "validUntil", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], FreightQuote.prototype, "sourceThreadRefId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], FreightQuote.prototype, "inboundMessageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], FreightQuote.prototype, "receivedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], FreightQuote.prototype, "extractedFields", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], FreightQuote.prototype, "comparisonFields", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], FreightQuote.prototype, "quotePromptSnapshot", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], FreightQuote.prototype, "reviewStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], FreightQuote.prototype, "versionNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], FreightQuote.prototype, "isLatestVersion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', nullable: true }),
    __metadata("design:type", Object)
], FreightQuote.prototype, "extractionConfidence", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], FreightQuote.prototype, "reviewedByUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], FreightQuote.prototype, "reviewedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], FreightQuote.prototype, "remarks", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], FreightQuote.prototype, "isSelected", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], FreightQuote.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], FreightQuote.prototype, "updatedAt", void 0);
exports.FreightQuote = FreightQuote = __decorate([
    (0, typeorm_1.Index)('IDX_freight_quotes_createdAt', ['createdAt']),
    (0, typeorm_1.Index)('IDX_freight_quotes_inquiryId_createdAt', ['inquiryId', 'createdAt']),
    (0, typeorm_1.Index)('IDX_freight_quotes_rfqId', ['rfqId']),
    (0, typeorm_1.Index)('IDX_freight_quotes_vendorId', ['vendorId']),
    (0, typeorm_1.Index)('IDX_freight_quotes_inboundMessageId', ['inboundMessageId']),
    (0, typeorm_1.Index)('IDX_freight_quotes_rfqId_vendorId_isLatestVersion', [
        'rfqId',
        'vendorId',
        'isLatestVersion',
    ]),
    (0, typeorm_1.Entity)('freight_quotes')
], FreightQuote);
//# sourceMappingURL=freight-quote.entity.js.map