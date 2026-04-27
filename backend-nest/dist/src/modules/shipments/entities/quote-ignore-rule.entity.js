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
exports.QuoteIgnoreRule = void 0;
const typeorm_1 = require("typeorm");
let QuoteIgnoreRule = class QuoteIgnoreRule {
    id;
    mailboxOwnerUserId;
    name;
    priority;
    isActive;
    conditions;
    createdByUserId;
    createdAt;
    updatedAt;
};
exports.QuoteIgnoreRule = QuoteIgnoreRule;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], QuoteIgnoreRule.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], QuoteIgnoreRule.prototype, "mailboxOwnerUserId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], QuoteIgnoreRule.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 100 }),
    __metadata("design:type", Number)
], QuoteIgnoreRule.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], QuoteIgnoreRule.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], QuoteIgnoreRule.prototype, "conditions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], QuoteIgnoreRule.prototype, "createdByUserId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], QuoteIgnoreRule.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], QuoteIgnoreRule.prototype, "updatedAt", void 0);
exports.QuoteIgnoreRule = QuoteIgnoreRule = __decorate([
    (0, typeorm_1.Index)('IDX_quote_ignore_rules_mailboxOwnerUserId_priority', [
        'mailboxOwnerUserId',
        'priority',
    ]),
    (0, typeorm_1.Index)('IDX_quote_ignore_rules_isActive_priority', ['isActive', 'priority']),
    (0, typeorm_1.Entity)('quote_ignore_rules')
], QuoteIgnoreRule);
//# sourceMappingURL=quote-ignore-rule.entity.js.map