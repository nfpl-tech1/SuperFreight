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
exports.PortAlias = void 0;
const typeorm_1 = require("typeorm");
const port_master_entity_1 = require("./port-master.entity");
let PortAlias = class PortAlias {
    id;
    portId;
    alias;
    normalizedAlias;
    countryName;
    portMode;
    isPrimary;
    sourceWorkbook;
    sourceSheet;
    createdAt;
    updatedAt;
};
exports.PortAlias = PortAlias;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PortAlias.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], PortAlias.prototype, "portId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PortAlias.prototype, "alias", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PortAlias.prototype, "normalizedAlias", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], PortAlias.prototype, "countryName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: port_master_entity_1.PortMode, nullable: true }),
    __metadata("design:type", Object)
], PortAlias.prototype, "portMode", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], PortAlias.prototype, "isPrimary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], PortAlias.prototype, "sourceWorkbook", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], PortAlias.prototype, "sourceSheet", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PortAlias.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PortAlias.prototype, "updatedAt", void 0);
exports.PortAlias = PortAlias = __decorate([
    (0, typeorm_1.Index)('IDX_port_alias_portId', ['portId']),
    (0, typeorm_1.Index)('IDX_port_alias_normalizedAlias_countryName_portMode', ['normalizedAlias', 'countryName', 'portMode']),
    (0, typeorm_1.Entity)('port_alias')
], PortAlias);
//# sourceMappingURL=port-alias.entity.js.map