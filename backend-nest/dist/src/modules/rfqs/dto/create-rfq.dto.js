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
exports.CreateRfqDto = exports.MscFieldsDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class ResponseFieldDto {
    fieldKey;
    fieldLabel;
    isCustom;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResponseFieldDto.prototype, "fieldKey", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResponseFieldDto.prototype, "fieldLabel", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ResponseFieldDto.prototype, "isCustom", void 0);
class OfficeSelectionDto {
    vendorId;
    officeId;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OfficeSelectionDto.prototype, "vendorId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OfficeSelectionDto.prototype, "officeId", void 0);
class MscFieldsDto {
    shipper;
    forwarder;
    por;
    pol;
    pod;
    commodity;
    cargoWeight;
    volume;
    requestedRates;
    freeTimeIfAny;
    validity;
    termsOfShipment;
    specificRemarks;
}
exports.MscFieldsDto = MscFieldsDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MscFieldsDto.prototype, "shipper", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MscFieldsDto.prototype, "forwarder", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MscFieldsDto.prototype, "por", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MscFieldsDto.prototype, "pol", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MscFieldsDto.prototype, "pod", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MscFieldsDto.prototype, "commodity", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MscFieldsDto.prototype, "cargoWeight", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MscFieldsDto.prototype, "volume", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MscFieldsDto.prototype, "requestedRates", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MscFieldsDto.prototype, "freeTimeIfAny", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MscFieldsDto.prototype, "validity", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MscFieldsDto.prototype, "termsOfShipment", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MscFieldsDto.prototype, "specificRemarks", void 0);
class CreateRfqDto {
    inquiryId;
    inquiryNumber;
    departmentId;
    formValues;
    vendorIds;
    officeSelections;
    responseFields;
    mscFields;
    customCcEmail;
    sendNow;
    mailSubject;
    mailBodyHtml;
}
exports.CreateRfqDto = CreateRfqDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRfqDto.prototype, "inquiryId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRfqDto.prototype, "inquiryNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRfqDto.prototype, "departmentId", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateRfqDto.prototype, "formValues", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateRfqDto.prototype, "vendorIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => OfficeSelectionDto),
    __metadata("design:type", Array)
], CreateRfqDto.prototype, "officeSelections", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ResponseFieldDto),
    __metadata("design:type", Array)
], CreateRfqDto.prototype, "responseFields", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => MscFieldsDto),
    __metadata("design:type", MscFieldsDto)
], CreateRfqDto.prototype, "mscFields", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRfqDto.prototype, "customCcEmail", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateRfqDto.prototype, "sendNow", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRfqDto.prototype, "mailSubject", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRfqDto.prototype, "mailBodyHtml", void 0);
//# sourceMappingURL=create-rfq.dto.js.map