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
exports.RfqFieldSpec = void 0;
const typeorm_1 = require("typeorm");
const rfq_entity_1 = require("./rfq.entity");
let RfqFieldSpec = class RfqFieldSpec {
    id;
    rfqId;
    fieldKey;
    fieldLabel;
    isCustom;
    rfq;
};
exports.RfqFieldSpec = RfqFieldSpec;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], RfqFieldSpec.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RfqFieldSpec.prototype, "rfqId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RfqFieldSpec.prototype, "fieldKey", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RfqFieldSpec.prototype, "fieldLabel", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], RfqFieldSpec.prototype, "isCustom", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => rfq_entity_1.Rfq, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'rfqId' }),
    __metadata("design:type", rfq_entity_1.Rfq)
], RfqFieldSpec.prototype, "rfq", void 0);
exports.RfqFieldSpec = RfqFieldSpec = __decorate([
    (0, typeorm_1.Index)('IDX_rfq_field_specs_rfqId', ['rfqId']),
    (0, typeorm_1.Unique)('UQ_rfq_field_specs_rfqId_fieldKey', ['rfqId', 'fieldKey']),
    (0, typeorm_1.Entity)('rfq_field_specs')
], RfqFieldSpec);
//# sourceMappingURL=rfq-field-spec.entity.js.map