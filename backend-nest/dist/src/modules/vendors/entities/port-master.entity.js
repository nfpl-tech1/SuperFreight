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
exports.PortMaster = exports.PortMode = void 0;
const typeorm_1 = require("typeorm");
var PortMode;
(function (PortMode) {
    PortMode["AIRPORT"] = "AIRPORT";
    PortMode["SEAPORT"] = "SEAPORT";
})(PortMode || (exports.PortMode = PortMode = {}));
let PortMaster = class PortMaster {
    id;
    code;
    name;
    normalizedName;
    cityName;
    normalizedCityName;
    stateName;
    countryName;
    normalizedCountryName;
    portMode;
    regionId;
    unlocode;
    sourceConfidence;
    isActive;
    notes;
    createdAt;
    updatedAt;
};
exports.PortMaster = PortMaster;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PortMaster.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PortMaster.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PortMaster.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], PortMaster.prototype, "normalizedName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], PortMaster.prototype, "cityName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], PortMaster.prototype, "normalizedCityName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], PortMaster.prototype, "stateName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PortMaster.prototype, "countryName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], PortMaster.prototype, "normalizedCountryName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: PortMode }),
    __metadata("design:type", String)
], PortMaster.prototype, "portMode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], PortMaster.prototype, "regionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], PortMaster.prototype, "unlocode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], PortMaster.prototype, "sourceConfidence", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], PortMaster.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PortMaster.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PortMaster.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PortMaster.prototype, "updatedAt", void 0);
exports.PortMaster = PortMaster = __decorate([
    (0, typeorm_1.Index)('UQ_port_master_portMode_code', ['portMode', 'code'], { unique: true }),
    (0, typeorm_1.Index)('IDX_port_master_name', ['name']),
    (0, typeorm_1.Index)('IDX_port_master_country_city', ['countryName', 'cityName']),
    (0, typeorm_1.Index)('IDX_port_master_portMode_isActive', ['portMode', 'isActive']),
    (0, typeorm_1.Entity)('port_master')
], PortMaster);
//# sourceMappingURL=port-master.entity.js.map