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
exports.CreateInquiryDto = void 0;
const class_validator_1 = require("class-validator");
const inquiry_entity_1 = require("../entities/inquiry.entity");
class CreateInquiryDto {
    customerName;
    customerRole;
    tradeLane;
    origin;
    destination;
    shipmentMode;
    incoterm;
    cargoSummary;
    inquiryType;
    mailboxOwnerUserId;
    ownerUserId;
}
exports.CreateInquiryDto = CreateInquiryDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInquiryDto.prototype, "customerName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(inquiry_entity_1.InquiryCustomerRole),
    __metadata("design:type", String)
], CreateInquiryDto.prototype, "customerRole", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(inquiry_entity_1.TradeLane),
    __metadata("design:type", String)
], CreateInquiryDto.prototype, "tradeLane", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInquiryDto.prototype, "origin", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInquiryDto.prototype, "destination", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(inquiry_entity_1.ShipmentMode),
    __metadata("design:type", String)
], CreateInquiryDto.prototype, "shipmentMode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInquiryDto.prototype, "incoterm", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInquiryDto.prototype, "cargoSummary", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(inquiry_entity_1.InquiryType),
    __metadata("design:type", String)
], CreateInquiryDto.prototype, "inquiryType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInquiryDto.prototype, "mailboxOwnerUserId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInquiryDto.prototype, "ownerUserId", void 0);
//# sourceMappingURL=create-inquiry.dto.js.map