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
exports.RegionMaster = void 0;
const typeorm_1 = require("typeorm");
let RegionMaster = class RegionMaster {
    id;
    sectorName;
    normalizedSectorName;
    displayName;
    isActive;
    createdAt;
    updatedAt;
};
exports.RegionMaster = RegionMaster;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RegionMaster.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RegionMaster.prototype, "sectorName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RegionMaster.prototype, "normalizedSectorName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RegionMaster.prototype, "displayName", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], RegionMaster.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RegionMaster.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], RegionMaster.prototype, "updatedAt", void 0);
exports.RegionMaster = RegionMaster = __decorate([
    (0, typeorm_1.Index)('UQ_region_master_normalizedSectorName', ['normalizedSectorName'], {
        unique: true,
    }),
    (0, typeorm_1.Index)('IDX_region_master_isActive', ['isActive']),
    (0, typeorm_1.Entity)('region_master')
], RegionMaster);
//# sourceMappingURL=region-master.entity.js.map