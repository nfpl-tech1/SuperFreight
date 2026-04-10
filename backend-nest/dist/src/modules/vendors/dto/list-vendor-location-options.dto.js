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
exports.ListVendorLocationOptionsDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const vendor_selection_context_1 = require("../domain/vendor-selection-context");
const port_master_entity_1 = require("../entities/port-master.entity");
const vendor_type_master_entity_1 = require("../entities/vendor-type-master.entity");
function parseCsv(value) {
    if (Array.isArray(value)) {
        return value
            .flatMap((entry) => typeof entry === 'string' ? entry.split(',') : String(entry).split(','))
            .map((entry) => entry.trim())
            .filter(Boolean);
    }
    if (typeof value !== 'string') {
        return value;
    }
    return value
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean);
}
class ListVendorLocationOptionsDto {
    page = 1;
    pageSize = 20;
    quoteTypeContext;
    shipmentMode;
    locationKind;
    locationRole;
    portMode;
    countryName;
    search;
    typeCodes;
}
exports.ListVendorLocationOptionsDto = ListVendorLocationOptionsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ListVendorLocationOptionsDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], ListVendorLocationOptionsDto.prototype, "pageSize", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(vendor_selection_context_1.VendorQuoteTypeContext),
    __metadata("design:type", String)
], ListVendorLocationOptionsDto.prototype, "quoteTypeContext", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListVendorLocationOptionsDto.prototype, "shipmentMode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(vendor_selection_context_1.VendorLocationKind),
    __metadata("design:type", String)
], ListVendorLocationOptionsDto.prototype, "locationKind", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(vendor_selection_context_1.VendorLocationRole),
    __metadata("design:type", String)
], ListVendorLocationOptionsDto.prototype, "locationRole", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(port_master_entity_1.PortMode),
    __metadata("design:type", String)
], ListVendorLocationOptionsDto.prototype, "portMode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListVendorLocationOptionsDto.prototype, "countryName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListVendorLocationOptionsDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseCsv(value)),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(vendor_type_master_entity_1.VendorTypeCode, { each: true }),
    __metadata("design:type", Array)
], ListVendorLocationOptionsDto.prototype, "typeCodes", void 0);
//# sourceMappingURL=list-vendor-location-options.dto.js.map