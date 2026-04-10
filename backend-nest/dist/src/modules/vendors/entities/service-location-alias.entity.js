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
exports.ServiceLocationAlias = void 0;
const typeorm_1 = require("typeorm");
const service_location_master_entity_1 = require("./service-location-master.entity");
let ServiceLocationAlias = class ServiceLocationAlias {
    id;
    serviceLocationId;
    alias;
    normalizedAlias;
    countryName;
    locationKind;
    isPrimary;
    sourceWorkbook;
    sourceSheet;
    createdAt;
    updatedAt;
};
exports.ServiceLocationAlias = ServiceLocationAlias;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ServiceLocationAlias.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], ServiceLocationAlias.prototype, "serviceLocationId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ServiceLocationAlias.prototype, "alias", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ServiceLocationAlias.prototype, "normalizedAlias", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], ServiceLocationAlias.prototype, "countryName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: service_location_master_entity_1.ServiceLocationKind, nullable: true }),
    __metadata("design:type", Object)
], ServiceLocationAlias.prototype, "locationKind", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ServiceLocationAlias.prototype, "isPrimary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], ServiceLocationAlias.prototype, "sourceWorkbook", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], ServiceLocationAlias.prototype, "sourceSheet", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ServiceLocationAlias.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ServiceLocationAlias.prototype, "updatedAt", void 0);
exports.ServiceLocationAlias = ServiceLocationAlias = __decorate([
    (0, typeorm_1.Index)('IDX_service_location_alias_serviceLocationId', ['serviceLocationId']),
    (0, typeorm_1.Index)('IDX_service_location_alias_normalizedAlias_country_kind', ['normalizedAlias', 'countryName', 'locationKind']),
    (0, typeorm_1.Entity)('service_location_alias')
], ServiceLocationAlias);
//# sourceMappingURL=service-location-alias.entity.js.map