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
exports.CreateAppRoleDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class PermissionDto {
    moduleKey;
    canView;
    canEdit;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PermissionDto.prototype, "moduleKey", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PermissionDto.prototype, "canView", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PermissionDto.prototype, "canEdit", void 0);
class ScopeRuleDto {
    scopeType;
    scopeValue;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScopeRuleDto.prototype, "scopeType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScopeRuleDto.prototype, "scopeValue", void 0);
class CreateAppRoleDto {
    name;
    description;
    permissions;
    scopeRules;
}
exports.CreateAppRoleDto = CreateAppRoleDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAppRoleDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAppRoleDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayNotEmpty)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PermissionDto),
    __metadata("design:type", Array)
], CreateAppRoleDto.prototype, "permissions", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ScopeRuleDto),
    __metadata("design:type", Array)
], CreateAppRoleDto.prototype, "scopeRules", void 0);
//# sourceMappingURL=create-app-role.dto.js.map