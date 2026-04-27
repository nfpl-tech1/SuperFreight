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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
const find_or_throw_helpers_1 = require("../../common/persistence/find-or-throw.helpers");
const app_role_entity_1 = require("./entities/app-role.entity");
const user_role_assignment_entity_1 = require("./entities/user-role-assignment.entity");
const user_department_entity_1 = require("./entities/user-department.entity");
const user_entity_1 = require("./entities/user.entity");
const os_user_sync_helpers_1 = require("./os-user-sync.helpers");
const user_response_helpers_1 = require("./user-response.helpers");
let UsersService = class UsersService {
    userRepo;
    deptRepo;
    appRoleRepo;
    assignmentRepo;
    constructor(userRepo, deptRepo, appRoleRepo, assignmentRepo) {
        this.userRepo = userRepo;
        this.deptRepo = deptRepo;
        this.appRoleRepo = appRoleRepo;
        this.assignmentRepo = assignmentRepo;
    }
    async findAll(skip = 0, limit = 100) {
        return this.userRepo.find({ skip, take: limit });
    }
    async findById(id) {
        return this.userRepo.findOne({ where: { id } });
    }
    async findByEmail(email) {
        return this.userRepo.findOne({ where: { email } });
    }
    async findByOsUserId(osUserId) {
        return this.userRepo.findOne({ where: { osUserId } });
    }
    async create(dto) {
        const existing = await this.findByEmail(dto.email);
        if (existing)
            throw new common_1.ConflictException('Email already registered');
        const user = this.userRepo.create({ id: (0, uuid_1.v4)(), ...dto });
        return this.userRepo.save(user);
    }
    async update(id, dto) {
        const user = await (0, find_or_throw_helpers_1.findByIdOrThrow)(this.userRepo, id, 'User');
        Object.assign(user, dto);
        return this.userRepo.save(user);
    }
    async updateDepartments(userId, departments) {
        await (0, find_or_throw_helpers_1.findByIdOrThrow)(this.userRepo, userId, 'User');
        await this.replaceDepartments(userId, departments);
        return this.findById(userId);
    }
    async syncFromOsUser(osUser) {
        let user = await this.findExistingOsUser(osUser);
        user ??= this.userRepo.create({ id: (0, uuid_1.v4)() });
        (0, os_user_sync_helpers_1.applyOsUserPayload)(user, osUser);
        user = await this.userRepo.save(user);
        await this.ensureDefaultRoleAssignment(user);
        return (await this.findById(user.id));
    }
    async markOutlookConnected(userId, connectedAt) {
        const user = await (0, find_or_throw_helpers_1.findByIdOrThrow)(this.userRepo, userId, 'User');
        user.outlookConnectedAt = connectedAt;
        return this.userRepo.save(user);
    }
    async updateSignature(userId, signature) {
        const user = await (0, find_or_throw_helpers_1.findByIdOrThrow)(this.userRepo, userId, 'User');
        user.emailSignature = signature;
        return this.userRepo.save(user);
    }
    async ensureDefaultRoleAssignment(user) {
        const existing = await this.assignmentRepo.find({
            where: { userId: user.id },
        });
        if (existing.length > 0)
            return;
        const roleName = (0, os_user_sync_helpers_1.getDefaultRoleName)(user.isAppAdmin);
        const role = await this.appRoleRepo.findOne({ where: { name: roleName } });
        if (!role)
            return;
        await this.assignmentRepo.save(this.assignmentRepo.create({ userId: user.id, roleId: role.id }));
    }
    async replaceDepartments(userId, departments) {
        await this.deptRepo.delete({ userId });
        if (departments.length === 0) {
            return;
        }
        const rows = departments.map((department) => this.deptRepo.create({
            userId,
            department: department,
        }));
        await this.deptRepo.save(rows);
    }
    async findExistingOsUser(osUser) {
        const osUserId = osUser.os_user_id;
        const byOsId = await this.findByOsUserId(osUserId);
        if (byOsId) {
            return byOsId;
        }
        if (!osUser.email) {
            return null;
        }
        return this.findByEmail(osUser.email);
    }
    format(user) {
        return (0, user_response_helpers_1.formatUserResponse)(user);
    }
    formatMany(users) {
        return users.map((u) => this.format(u));
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(user_department_entity_1.UserDepartment)),
    __param(2, (0, typeorm_1.InjectRepository)(app_role_entity_1.AppRole)),
    __param(3, (0, typeorm_1.InjectRepository)(user_role_assignment_entity_1.UserRoleAssignment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map