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
exports.OwnershipAssignment = void 0;
const typeorm_1 = require("typeorm");
let OwnershipAssignment = class OwnershipAssignment {
    id;
    inquiryId;
    previousOwnerUserId;
    newOwnerUserId;
    changedByUserId;
    reason;
    createdAt;
};
exports.OwnershipAssignment = OwnershipAssignment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], OwnershipAssignment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], OwnershipAssignment.prototype, "inquiryId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], OwnershipAssignment.prototype, "previousOwnerUserId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], OwnershipAssignment.prototype, "newOwnerUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], OwnershipAssignment.prototype, "changedByUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], OwnershipAssignment.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], OwnershipAssignment.prototype, "createdAt", void 0);
exports.OwnershipAssignment = OwnershipAssignment = __decorate([
    (0, typeorm_1.Index)('IDX_ownership_assignments_inquiryId_createdAt', [
        'inquiryId',
        'createdAt',
    ]),
    (0, typeorm_1.Entity)('ownership_assignments')
], OwnershipAssignment);
//# sourceMappingURL=ownership-assignment.entity.js.map