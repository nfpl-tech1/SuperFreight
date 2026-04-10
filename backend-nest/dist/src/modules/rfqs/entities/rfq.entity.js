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
exports.Rfq = void 0;
const typeorm_1 = require("typeorm");
let Rfq = class Rfq {
    id;
    inquiryId;
    inquiryNumber;
    departmentId;
    createdByUserId;
    formValues;
    vendorIds;
    sent;
    subjectLine;
    promptTemplateMeta;
    sentAt;
    createdAt;
    updatedAt;
};
exports.Rfq = Rfq;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Rfq.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Rfq.prototype, "inquiryId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Rfq.prototype, "inquiryNumber", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Rfq.prototype, "departmentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Rfq.prototype, "createdByUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], Rfq.prototype, "formValues", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, default: '{}' }),
    __metadata("design:type", Array)
], Rfq.prototype, "vendorIds", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Rfq.prototype, "sent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Rfq.prototype, "subjectLine", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Rfq.prototype, "promptTemplateMeta", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], Rfq.prototype, "sentAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Rfq.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Rfq.prototype, "updatedAt", void 0);
exports.Rfq = Rfq = __decorate([
    (0, typeorm_1.Index)('IDX_rfqs_createdAt', ['createdAt']),
    (0, typeorm_1.Index)('IDX_rfqs_inquiryId', ['inquiryId']),
    (0, typeorm_1.Index)('IDX_rfqs_createdByUserId', ['createdByUserId']),
    (0, typeorm_1.Entity)('rfqs')
], Rfq);
//# sourceMappingURL=rfq.entity.js.map