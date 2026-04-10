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
exports.UserRoleAssignment = void 0;
const typeorm_1 = require("typeorm");
const app_role_entity_1 = require("./app-role.entity");
const user_entity_1 = require("./user.entity");
let UserRoleAssignment = class UserRoleAssignment {
    id;
    userId;
    roleId;
    user;
    role;
};
exports.UserRoleAssignment = UserRoleAssignment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserRoleAssignment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserRoleAssignment.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserRoleAssignment.prototype, "roleId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.roleAssignments, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], UserRoleAssignment.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => app_role_entity_1.AppRole, (role) => role.userAssignments, {
        eager: true,
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'roleId' }),
    __metadata("design:type", app_role_entity_1.AppRole)
], UserRoleAssignment.prototype, "role", void 0);
exports.UserRoleAssignment = UserRoleAssignment = __decorate([
    (0, typeorm_1.Index)('IDX_user_role_assignments_userId', ['userId']),
    (0, typeorm_1.Index)('IDX_user_role_assignments_roleId', ['roleId']),
    (0, typeorm_1.Unique)('UQ_user_role_assignments_userId_roleId', ['userId', 'roleId']),
    (0, typeorm_1.Entity)('user_role_assignments')
], UserRoleAssignment);
//# sourceMappingURL=user-role-assignment.entity.js.map