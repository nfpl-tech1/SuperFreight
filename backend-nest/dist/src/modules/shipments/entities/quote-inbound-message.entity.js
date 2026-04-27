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
exports.QuoteInboundMessage = exports.QuoteInboundMessageStatus = void 0;
const typeorm_1 = require("typeorm");
var QuoteInboundMessageStatus;
(function (QuoteInboundMessageStatus) {
    QuoteInboundMessageStatus["IGNORED"] = "ignored";
    QuoteInboundMessageStatus["UNMATCHED"] = "unmatched";
    QuoteInboundMessageStatus["EXTRACTION_PENDING"] = "extraction_pending";
    QuoteInboundMessageStatus["NEEDS_REVIEW"] = "needs_review";
    QuoteInboundMessageStatus["FINALIZED"] = "finalized";
    QuoteInboundMessageStatus["FAILED"] = "failed";
})(QuoteInboundMessageStatus || (exports.QuoteInboundMessageStatus = QuoteInboundMessageStatus = {}));
let QuoteInboundMessage = class QuoteInboundMessage {
    id;
    mailboxOwnerUserId;
    outlookMessageId;
    internetMessageId;
    conversationId;
    receivedAt;
    fromEmail;
    fromName;
    subject;
    bodyPreview;
    webLink;
    hasAttachments;
    matchedInquiryId;
    matchedRfqId;
    matchedVendorId;
    status;
    ignoreReason;
    failureReason;
    rawMetadata;
    attachmentMetadata;
    processedAt;
    createdAt;
    updatedAt;
};
exports.QuoteInboundMessage = QuoteInboundMessage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], QuoteInboundMessage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], QuoteInboundMessage.prototype, "mailboxOwnerUserId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], QuoteInboundMessage.prototype, "outlookMessageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], QuoteInboundMessage.prototype, "internetMessageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], QuoteInboundMessage.prototype, "conversationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], QuoteInboundMessage.prototype, "receivedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], QuoteInboundMessage.prototype, "fromEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], QuoteInboundMessage.prototype, "fromName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], QuoteInboundMessage.prototype, "subject", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], QuoteInboundMessage.prototype, "bodyPreview", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], QuoteInboundMessage.prototype, "webLink", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], QuoteInboundMessage.prototype, "hasAttachments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], QuoteInboundMessage.prototype, "matchedInquiryId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], QuoteInboundMessage.prototype, "matchedRfqId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], QuoteInboundMessage.prototype, "matchedVendorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], QuoteInboundMessage.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], QuoteInboundMessage.prototype, "ignoreReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], QuoteInboundMessage.prototype, "failureReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], QuoteInboundMessage.prototype, "rawMetadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], QuoteInboundMessage.prototype, "attachmentMetadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], QuoteInboundMessage.prototype, "processedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], QuoteInboundMessage.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], QuoteInboundMessage.prototype, "updatedAt", void 0);
exports.QuoteInboundMessage = QuoteInboundMessage = __decorate([
    (0, typeorm_1.Index)('UQ_quote_inbound_messages_outlookMessageId', ['outlookMessageId'], {
        unique: true,
    }),
    (0, typeorm_1.Index)('IDX_quote_inbound_messages_receivedAt', ['receivedAt']),
    (0, typeorm_1.Index)('IDX_quote_inbound_messages_status_receivedAt', ['status', 'receivedAt']),
    (0, typeorm_1.Index)('IDX_quote_inbound_messages_matchedInquiryId', ['matchedInquiryId']),
    (0, typeorm_1.Index)('IDX_quote_inbound_messages_matchedRfqId', ['matchedRfqId']),
    (0, typeorm_1.Index)('IDX_quote_inbound_messages_matchedVendorId', ['matchedVendorId']),
    (0, typeorm_1.Entity)('quote_inbound_messages')
], QuoteInboundMessage);
//# sourceMappingURL=quote-inbound-message.entity.js.map