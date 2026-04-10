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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const audit_decorator_1 = require("../../common/decorators/audit.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const assign_user_roles_dto_1 = require("./dto/assign-user-roles.dto");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_departments_dto_1 = require("./dto/update-departments.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const user_entity_1 = require("./entities/user.entity");
const roles_service_1 = require("./roles.service");
const users_service_1 = require("./users.service");
let UsersController = class UsersController {
    usersService;
    rolesService;
    constructor(usersService, rolesService) {
        this.usersService = usersService;
        this.rolesService = rolesService;
    }
    getMe(user) {
        return this.usersService.format(user);
    }
    async updateMySignature(user, body) {
        const updated = await this.usersService.updateSignature(user.id, body.signature ?? null);
        return this.usersService.format(updated);
    }
    async getAll(skip = 0, limit = 100) {
        const users = await this.usersService.findAll(+skip, +limit);
        return this.usersService.formatMany(users);
    }
    async create(dto) {
        const user = await this.usersService.create(dto);
        return this.usersService.format(user);
    }
    async update(id, dto) {
        const user = await this.usersService.update(id, dto);
        return this.usersService.format(user);
    }
    async updateDepartments(id, dto) {
        const user = await this.usersService.updateDepartments(id, dto.departments);
        return this.usersService.format(user);
    }
    async assignRoles(id, dto) {
        await this.rolesService.assignUserRoles(id, dto.roleIds);
        const user = await this.usersService.findById(id);
        return this.usersService.format(user);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getMe", null);
__decorate([
    (0, common_1.Patch)('me/signature'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateMySignature", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_entity_1.Role.ADMIN),
    __param(0, (0, common_1.Query)('skip')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_entity_1.Role.ADMIN),
    (0, audit_decorator_1.Audit)('USER_CREATED', 'user'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.Role.ADMIN),
    (0, audit_decorator_1.Audit)('USER_UPDATED', 'user'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/departments'),
    (0, roles_decorator_1.Roles)(user_entity_1.Role.ADMIN),
    (0, audit_decorator_1.Audit)('USER_DEPARTMENTS_UPDATED', 'user'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_departments_dto_1.UpdateDepartmentsDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateDepartments", null);
__decorate([
    (0, common_1.Post)(':id/roles'),
    (0, roles_decorator_1.Roles)(user_entity_1.Role.ADMIN),
    (0, audit_decorator_1.Audit)('USER_ROLES_UPDATED', 'user'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_user_roles_dto_1.AssignUserRolesDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "assignRoles", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        roles_service_1.RolesService])
], UsersController);
//# sourceMappingURL=users.controller.js.map