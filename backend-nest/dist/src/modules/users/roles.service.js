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
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
const app_role_entity_1 = require("./entities/app-role.entity");
const role_permission_entity_1 = require("./entities/role-permission.entity");
const role_scope_rule_entity_1 = require("./entities/role-scope-rule.entity");
const user_role_assignment_entity_1 = require("./entities/user-role-assignment.entity");
const role_presets_1 = require("./role-presets");
let RolesService = class RolesService {
    roleRepo;
    permissionRepo;
    scopeRepo;
    assignmentRepo;
    constructor(roleRepo, permissionRepo, scopeRepo, assignmentRepo) {
        this.roleRepo = roleRepo;
        this.permissionRepo = permissionRepo;
        this.scopeRepo = scopeRepo;
        this.assignmentRepo = assignmentRepo;
    }
    async onModuleInit() {
        const count = await this.roleRepo.count();
        if (count > 0)
            return;
        const adminRole = this.roleRepo.create({
            id: (0, uuid_1.v4)(),
            name: role_presets_1.ROLE_NAMES.ADMIN,
            description: 'Full access across SuperFreight',
            isSystem: true,
            permissions: role_presets_1.SYSTEM_MODULES.map((moduleKey) => this.permissionRepo.create({ moduleKey, canView: true, canEdit: true })),
            scopeRules: [
                this.scopeRepo.create({ scopeType: 'visibility', scopeValue: 'ALL' }),
            ],
        });
        const operatorRole = this.roleRepo.create({
            id: (0, uuid_1.v4)(),
            name: role_presets_1.ROLE_NAMES.OPERATOR,
            description: 'Default operator role for freight users',
            isSystem: true,
            permissions: role_presets_1.OPERATOR_MODULES.map((moduleKey) => this.permissionRepo.create({ moduleKey, canView: true, canEdit: true })),
            scopeRules: [
                this.scopeRepo.create({
                    scopeType: 'visibility',
                    scopeValue: 'OWNED_ONLY',
                }),
            ],
        });
        await this.roleRepo.save([adminRole, operatorRole]);
    }
    async list() {
        return this.roleRepo.find({ order: { name: 'ASC' } });
    }
    async create(dto) {
        const existing = await this.roleRepo.findOne({ where: { name: dto.name } });
        if (existing)
            throw new common_1.ConflictException('Role name already exists');
        const role = this.roleRepo.create({
            id: (0, uuid_1.v4)(),
            name: dto.name,
            description: dto.description ?? null,
            permissions: dto.permissions.map((permission) => this.permissionRepo.create(permission)),
            scopeRules: dto.scopeRules.map((scope) => this.scopeRepo.create(scope)),
        });
        return this.roleRepo.save(role);
    }
    async update(id, dto) {
        const role = await this.roleRepo.findOne({ where: { id } });
        if (!role)
            throw new common_1.NotFoundException('Role not found');
        role.name = dto.name;
        role.description = dto.description ?? null;
        await this.permissionRepo.delete({ roleId: id });
        await this.scopeRepo.delete({ roleId: id });
        role.permissions = dto.permissions.map((permission) => this.permissionRepo.create({ ...permission, roleId: id }));
        role.scopeRules = dto.scopeRules.map((scope) => this.scopeRepo.create({ ...scope, roleId: id }));
        return this.roleRepo.save(role);
    }
    async remove(id) {
        const role = await this.roleRepo.findOne({ where: { id } });
        if (!role)
            throw new common_1.NotFoundException('Role not found');
        if (role.isSystem) {
            throw new common_1.ConflictException('System roles cannot be deleted');
        }
        const assignmentsCount = await this.assignmentRepo.count({
            where: { roleId: id },
        });
        if (assignmentsCount > 0) {
            throw new common_1.ConflictException('This role is assigned to users. Remove those assignments first.');
        }
        await this.roleRepo.delete({ id });
        return { success: true };
    }
    async assignUserRoles(userId, roleIds) {
        const roles = await this.roleRepo.find({ where: { id: (0, typeorm_2.In)(roleIds) } });
        if (roles.length !== roleIds.length) {
            throw new common_1.NotFoundException('One or more roles were not found');
        }
        await this.assignmentRepo.delete({ userId });
        const assignments = roles.map((role) => this.assignmentRepo.create({ userId, roleId: role.id }));
        await this.assignmentRepo.save(assignments);
        return this.assignmentRepo.find({ where: { userId } });
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(app_role_entity_1.AppRole)),
    __param(1, (0, typeorm_1.InjectRepository)(role_permission_entity_1.RolePermission)),
    __param(2, (0, typeorm_1.InjectRepository)(role_scope_rule_entity_1.RoleScopeRule)),
    __param(3, (0, typeorm_1.InjectRepository)(user_role_assignment_entity_1.UserRoleAssignment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], RolesService);
//# sourceMappingURL=roles.service.js.map