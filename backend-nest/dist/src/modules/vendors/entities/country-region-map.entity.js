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
exports.CountryRegionMap = void 0;
const typeorm_1 = require("typeorm");
let CountryRegionMap = class CountryRegionMap {
    id;
    countryName;
    normalizedCountryName;
    regionId;
    sourceWorkbook;
    sourceSheet;
    createdAt;
    updatedAt;
};
exports.CountryRegionMap = CountryRegionMap;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CountryRegionMap.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CountryRegionMap.prototype, "countryName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CountryRegionMap.prototype, "normalizedCountryName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], CountryRegionMap.prototype, "regionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], CountryRegionMap.prototype, "sourceWorkbook", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], CountryRegionMap.prototype, "sourceSheet", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CountryRegionMap.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CountryRegionMap.prototype, "updatedAt", void 0);
exports.CountryRegionMap = CountryRegionMap = __decorate([
    (0, typeorm_1.Index)('UQ_country_region_map_normalizedCountryName_regionId', ['normalizedCountryName', 'regionId'], { unique: true }),
    (0, typeorm_1.Index)('IDX_country_region_map_regionId', ['regionId']),
    (0, typeorm_1.Entity)('country_region_map')
], CountryRegionMap);
//# sourceMappingURL=country-region-map.entity.js.map