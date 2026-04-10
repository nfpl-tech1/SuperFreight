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
exports.ListVendorsDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const vendor_selection_context_1 = require("../domain/vendor-selection-context");
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
function parseBoolean(value) {
    if (typeof value === 'boolean' || value === undefined || value === null) {
        return value;
    }
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (['true', '1', 'yes'].includes(normalized)) {
            return true;
        }
        if (['false', '0', 'no'].includes(normalized)) {
            return false;
        }
    }
    return value;
}
class ListVendorsDto {
    page = 1;
    pageSize = 25;
    search;
    isActive;
    countryName;
    cityName;
    quoteTypeContext;
    shipmentMode;
    locationKind;
    locationId;
    locationCountryName;
    locationRole;
    locationScope;
    typeCodes;
    isIataCertified;
    doesSeaFreight;
    doesProjectCargo;
    doesOwnConsolidation;
    doesOwnTransportation;
    doesOwnWarehousing;
    doesOwnCustomClearance;
}
exports.ListVendorsDto = ListVendorsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ListVendorsDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], ListVendorsDto.prototype, "pageSize", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListVendorsDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseBoolean(value)),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ListVendorsDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListVendorsDto.prototype, "countryName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListVendorsDto.prototype, "cityName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(vendor_selection_context_1.VendorQuoteTypeContext),
    __metadata("design:type", String)
], ListVendorsDto.prototype, "quoteTypeContext", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListVendorsDto.prototype, "shipmentMode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(vendor_selection_context_1.VendorLocationKind),
    __metadata("design:type", String)
], ListVendorsDto.prototype, "locationKind", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListVendorsDto.prototype, "locationId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListVendorsDto.prototype, "locationCountryName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(vendor_selection_context_1.VendorLocationRole),
    __metadata("design:type", String)
], ListVendorsDto.prototype, "locationRole", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(vendor_selection_context_1.VendorLocationScope),
    __metadata("design:type", String)
], ListVendorsDto.prototype, "locationScope", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseCsv(value)),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(vendor_type_master_entity_1.VendorTypeCode, { each: true }),
    __metadata("design:type", Array)
], ListVendorsDto.prototype, "typeCodes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseBoolean(value)),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ListVendorsDto.prototype, "isIataCertified", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseBoolean(value)),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ListVendorsDto.prototype, "doesSeaFreight", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseBoolean(value)),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ListVendorsDto.prototype, "doesProjectCargo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseBoolean(value)),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ListVendorsDto.prototype, "doesOwnConsolidation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseBoolean(value)),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ListVendorsDto.prototype, "doesOwnTransportation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseBoolean(value)),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ListVendorsDto.prototype, "doesOwnWarehousing", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseBoolean(value)),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ListVendorsDto.prototype, "doesOwnCustomClearance", void 0);
//# sourceMappingURL=list-vendors.dto.js.map