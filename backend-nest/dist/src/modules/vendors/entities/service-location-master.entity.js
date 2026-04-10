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
exports.ServiceLocationMaster = exports.ServiceLocationKind = void 0;
const typeorm_1 = require("typeorm");
var ServiceLocationKind;
(function (ServiceLocationKind) {
    ServiceLocationKind["INLAND_CITY"] = "INLAND_CITY";
    ServiceLocationKind["ICD"] = "ICD";
    ServiceLocationKind["CFS"] = "CFS";
    ServiceLocationKind["WAREHOUSE_ZONE"] = "WAREHOUSE_ZONE";
    ServiceLocationKind["CUSTOMS_NODE"] = "CUSTOMS_NODE";
    ServiceLocationKind["AIR_CARGO_AREA"] = "AIR_CARGO_AREA";
    ServiceLocationKind["UNKNOWN"] = "UNKNOWN";
})(ServiceLocationKind || (exports.ServiceLocationKind = ServiceLocationKind = {}));
let ServiceLocationMaster = class ServiceLocationMaster {
    id;
    name;
    normalizedName;
    cityName;
    normalizedCityName;
    stateName;
    countryName;
    normalizedCountryName;
    locationKind;
    regionId;
    isActive;
    notes;
    createdAt;
    updatedAt;
};
exports.ServiceLocationMaster = ServiceLocationMaster;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ServiceLocationMaster.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ServiceLocationMaster.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ServiceLocationMaster.prototype, "normalizedName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], ServiceLocationMaster.prototype, "cityName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], ServiceLocationMaster.prototype, "normalizedCityName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], ServiceLocationMaster.prototype, "stateName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ServiceLocationMaster.prototype, "countryName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ServiceLocationMaster.prototype, "normalizedCountryName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ServiceLocationKind }),
    __metadata("design:type", String)
], ServiceLocationMaster.prototype, "locationKind", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], ServiceLocationMaster.prototype, "regionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], ServiceLocationMaster.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], ServiceLocationMaster.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ServiceLocationMaster.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ServiceLocationMaster.prototype, "updatedAt", void 0);
exports.ServiceLocationMaster = ServiceLocationMaster = __decorate([
    (0, typeorm_1.Index)('IDX_service_location_master_kind_country_name', ['locationKind', 'normalizedCountryName', 'normalizedName']),
    (0, typeorm_1.Index)('IDX_service_location_master_city', ['normalizedCityName']),
    (0, typeorm_1.Index)('IDX_service_location_master_regionId', ['regionId']),
    (0, typeorm_1.Entity)('service_location_master')
], ServiceLocationMaster);
//# sourceMappingURL=service-location-master.entity.js.map