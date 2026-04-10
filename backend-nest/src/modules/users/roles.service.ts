import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AppRole } from './entities/app-role.entity';
import { RolePermission } from './entities/role-permission.entity';
import { RoleScopeRule } from './entities/role-scope-rule.entity';
import { UserRoleAssignment } from './entities/user-role-assignment.entity';
import { CreateAppRoleDto } from './dto/create-app-role.dto';
import { OPERATOR_MODULES, ROLE_NAMES, SYSTEM_MODULES } from './role-presets';

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(
    @InjectRepository(AppRole)
    private readonly roleRepo: Repository<AppRole>,
    @InjectRepository(RolePermission)
    private readonly permissionRepo: Repository<RolePermission>,
    @InjectRepository(RoleScopeRule)
    private readonly scopeRepo: Repository<RoleScopeRule>,
    @InjectRepository(UserRoleAssignment)
    private readonly assignmentRepo: Repository<UserRoleAssignment>,
  ) {}

  async onModuleInit() {
    const count = await this.roleRepo.count();
    if (count > 0) return;

    const adminRole = this.roleRepo.create({
      id: uuidv4(),
      name: ROLE_NAMES.ADMIN,
      description: 'Full access across SuperFreight',
      isSystem: true,
      permissions: SYSTEM_MODULES.map((moduleKey) =>
        this.permissionRepo.create({ moduleKey, canView: true, canEdit: true }),
      ),
      scopeRules: [
        this.scopeRepo.create({ scopeType: 'visibility', scopeValue: 'ALL' }),
      ],
    });

    const operatorRole = this.roleRepo.create({
      id: uuidv4(),
      name: ROLE_NAMES.OPERATOR,
      description: 'Default operator role for freight users',
      isSystem: true,
      permissions: OPERATOR_MODULES.map((moduleKey) =>
        this.permissionRepo.create({ moduleKey, canView: true, canEdit: true }),
      ),
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

  async create(dto: CreateAppRoleDto) {
    const existing = await this.roleRepo.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictException('Role name already exists');

    const role = this.roleRepo.create({
      id: uuidv4(),
      name: dto.name,
      description: dto.description ?? null,
      permissions: dto.permissions.map((permission) =>
        this.permissionRepo.create(permission),
      ),
      scopeRules: dto.scopeRules.map((scope) => this.scopeRepo.create(scope)),
    });

    return this.roleRepo.save(role);
  }

  async update(id: string, dto: CreateAppRoleDto) {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');

    role.name = dto.name;
    role.description = dto.description ?? null;
    await this.permissionRepo.delete({ roleId: id });
    await this.scopeRepo.delete({ roleId: id });
    role.permissions = dto.permissions.map((permission) =>
      this.permissionRepo.create({ ...permission, roleId: id }),
    );
    role.scopeRules = dto.scopeRules.map((scope) =>
      this.scopeRepo.create({ ...scope, roleId: id }),
    );
    return this.roleRepo.save(role);
  }

  async remove(id: string) {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    if (role.isSystem) {
      throw new ConflictException('System roles cannot be deleted');
    }

    const assignmentsCount = await this.assignmentRepo.count({
      where: { roleId: id },
    });
    if (assignmentsCount > 0) {
      throw new ConflictException(
        'This role is assigned to users. Remove those assignments first.',
      );
    }

    await this.roleRepo.delete({ id });
    return { success: true };
  }

  async assignUserRoles(userId: string, roleIds: string[]) {
    const roles = await this.roleRepo.find({ where: { id: In(roleIds) } });
    if (roles.length !== roleIds.length) {
      throw new NotFoundException('One or more roles were not found');
    }

    await this.assignmentRepo.delete({ userId });
    const assignments = roles.map((role) =>
      this.assignmentRepo.create({ userId, roleId: role.id }),
    );
    await this.assignmentRepo.save(assignments);
    return this.assignmentRepo.find({ where: { userId } });
  }
}
