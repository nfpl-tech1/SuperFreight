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
exports.ExternalThreadRef = void 0;
const typeorm_1 = require("typeorm");
let ExternalThreadRef = class ExternalThreadRef {
    id;
    inquiryId;
    participantType;
    participantEmail;
    conversationId;
    messageId;
    internetMessageId;
    webLink;
    lastActivityAt;
    metadata;
    createdAt;
    updatedAt;
};
exports.ExternalThreadRef = ExternalThreadRef;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ExternalThreadRef.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ExternalThreadRef.prototype, "inquiryId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ExternalThreadRef.prototype, "participantType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], ExternalThreadRef.prototype, "participantEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], ExternalThreadRef.prototype, "conversationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], ExternalThreadRef.prototype, "messageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], ExternalThreadRef.prototype, "internetMessageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], ExternalThreadRef.prototype, "webLink", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], ExternalThreadRef.prototype, "lastActivityAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ExternalThreadRef.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ExternalThreadRef.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ExternalThreadRef.prototype, "updatedAt", void 0);
exports.ExternalThreadRef = ExternalThreadRef = __decorate([
    (0, typeorm_1.Index)('IDX_external_thread_refs_inquiryId', ['inquiryId']),
    (0, typeorm_1.Entity)('external_thread_refs')
], ExternalThreadRef);
//# sourceMappingURL=external-thread-ref.entity.js.map