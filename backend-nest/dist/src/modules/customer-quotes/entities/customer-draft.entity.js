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
exports.CustomerDraft = void 0;
const typeorm_1 = require("typeorm");
let CustomerDraft = class CustomerDraft {
    id;
    inquiryId;
    quoteId;
    generatedByUserId;
    marginPercent;
    draftBody;
    subjectLine;
    isSelected;
    createdAt;
    updatedAt;
};
exports.CustomerDraft = CustomerDraft;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CustomerDraft.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CustomerDraft.prototype, "inquiryId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CustomerDraft.prototype, "quoteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], CustomerDraft.prototype, "generatedByUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', nullable: true }),
    __metadata("design:type", Object)
], CustomerDraft.prototype, "marginPercent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], CustomerDraft.prototype, "draftBody", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], CustomerDraft.prototype, "subjectLine", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], CustomerDraft.prototype, "isSelected", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CustomerDraft.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CustomerDraft.prototype, "updatedAt", void 0);
exports.CustomerDraft = CustomerDraft = __decorate([
    (0, typeorm_1.Index)('IDX_customer_drafts_createdAt', ['createdAt']),
    (0, typeorm_1.Index)('IDX_customer_drafts_inquiryId', ['inquiryId']),
    (0, typeorm_1.Index)('IDX_customer_drafts_quoteId', ['quoteId']),
    (0, typeorm_1.Index)('IDX_customer_drafts_generatedByUserId', ['generatedByUserId']),
    (0, typeorm_1.Entity)('customer_drafts')
], CustomerDraft);
//# sourceMappingURL=customer-draft.entity.js.map