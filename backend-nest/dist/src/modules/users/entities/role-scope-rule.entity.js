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
exports.RoleScopeRule = void 0;
const typeorm_1 = require("typeorm");
const app_role_entity_1 = require("./app-role.entity");
let RoleScopeRule = class RoleScopeRule {
    id;
    roleId;
    scopeType;
    scopeValue;
    role;
};
exports.RoleScopeRule = RoleScopeRule;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], RoleScopeRule.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RoleScopeRule.prototype, "roleId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RoleScopeRule.prototype, "scopeType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RoleScopeRule.prototype, "scopeValue", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => app_role_entity_1.AppRole, (role) => role.scopeRules, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'roleId' }),
    __metadata("design:type", app_role_entity_1.AppRole)
], RoleScopeRule.prototype, "role", void 0);
exports.RoleScopeRule = RoleScopeRule = __decorate([
    (0, typeorm_1.Index)('IDX_role_scope_rules_roleId', ['roleId']),
    (0, typeorm_1.Unique)('UQ_role_scope_rules_roleId_scopeType_scopeValue', [
        'roleId',
        'scopeType',
        'scopeValue',
    ]),
    (0, typeorm_1.Entity)('role_scope_rules')
], RoleScopeRule);
//# sourceMappingURL=role-scope-rule.entity.js.map