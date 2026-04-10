"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const audit_module_1 = require("../audit/audit.module");
const app_role_entity_1 = require("./entities/app-role.entity");
const role_permission_entity_1 = require("./entities/role-permission.entity");
const role_scope_rule_entity_1 = require("./entities/role-scope-rule.entity");
const user_department_entity_1 = require("./entities/user-department.entity");
const user_role_assignment_entity_1 = require("./entities/user-role-assignment.entity");
const user_entity_1 = require("./entities/user.entity");
const roles_controller_1 = require("./roles.controller");
const roles_service_1 = require("./roles.service");
const users_controller_1 = require("./users.controller");
const users_service_1 = require("./users.service");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User,
                user_department_entity_1.UserDepartment,
                app_role_entity_1.AppRole,
                role_permission_entity_1.RolePermission,
                role_scope_rule_entity_1.RoleScopeRule,
                user_role_assignment_entity_1.UserRoleAssignment,
            ]),
            audit_module_1.AuditModule,
        ],
        controllers: [users_controller_1.UsersController, roles_controller_1.RolesController],
        providers: [users_service_1.UsersService, roles_service_1.RolesService],
        exports: [users_service_1.UsersService, roles_service_1.RolesService],
    })
], UsersModule);
//# sourceMappingURL=users.module.js.map