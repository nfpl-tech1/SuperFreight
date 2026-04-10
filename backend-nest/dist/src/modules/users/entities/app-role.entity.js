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
exports.AppRole = void 0;
const typeorm_1 = require("typeorm");
const role_permission_entity_1 = require("./role-permission.entity");
const role_scope_rule_entity_1 = require("./role-scope-rule.entity");
const user_role_assignment_entity_1 = require("./user-role-assignment.entity");
let AppRole = class AppRole {
    id;
    name;
    description;
    isSystem;
    permissions;
    scopeRules;
    userAssignments;
    createdAt;
    updatedAt;
};
exports.AppRole = AppRole;
__decorate([
    (0, typeorm_1.PrimaryColumn)('uuid'),
    __metadata("design:type", String)
], AppRole.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], AppRole.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], AppRole.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], AppRole.prototype, "isSystem", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => role_permission_entity_1.RolePermission, (permission) => permission.role, {
        cascade: true,
        eager: true,
    }),
    __metadata("design:type", Array)
], AppRole.prototype, "permissions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => role_scope_rule_entity_1.RoleScopeRule, (scope) => scope.role, {
        cascade: true,
        eager: true,
    }),
    __metadata("design:type", Array)
], AppRole.prototype, "scopeRules", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_role_assignment_entity_1.UserRoleAssignment, (assignment) => assignment.role),
    __metadata("design:type", Array)
], AppRole.prototype, "userAssignments", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AppRole.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], AppRole.prototype, "updatedAt", void 0);
exports.AppRole = AppRole = __decorate([
    (0, typeorm_1.Entity)('app_roles')
], AppRole);
//# sourceMappingURL=app-role.entity.js.map