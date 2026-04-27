import {
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { findByIdOrThrow } from '../../common/persistence/find-or-throw.helpers';
import { AppRole } from './entities/app-role.entity';
import { UserRoleAssignment } from './entities/user-role-assignment.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDepartment } from './entities/user-department.entity';
import { User } from './entities/user.entity';
import { applyOsUserPayload, getDefaultRoleName } from './os-user-sync.helpers';
import { OsUserPayload } from '../auth/os-auth.helpers';
import { formatUserResponse } from './user-response.helpers';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserDepartment)
    private readonly deptRepo: Repository<UserDepartment>,
    @InjectRepository(AppRole)
    private readonly appRoleRepo: Repository<AppRole>,
    @InjectRepository(UserRoleAssignment)
    private readonly assignmentRepo: Repository<UserRoleAssignment>,
  ) {}

  async findAll(skip = 0, limit = 100): Promise<User[]> {
    return this.userRepo.find({ skip, take: limit });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async findByOsUserId(osUserId: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { osUserId } });
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already registered');

    const user = this.userRepo.create({ id: uuidv4(), ...dto });
    return this.userRepo.save(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await findByIdOrThrow(this.userRepo, id, 'User');

    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  async updateDepartments(
    userId: string,
    departments: string[],
  ): Promise<User> {
    await findByIdOrThrow(this.userRepo, userId, 'User');

    await this.replaceDepartments(userId, departments);

    return this.findById(userId) as Promise<User>;
  }

  async syncFromOsUser(osUser: OsUserPayload): Promise<User> {
    let user = await this.findExistingOsUser(osUser);
    user ??= this.userRepo.create({ id: uuidv4() });

    applyOsUserPayload(user, osUser);
    user = await this.userRepo.save(user);

    await this.ensureDefaultRoleAssignment(user);
    return (await this.findById(user.id)) as User;
  }

  async markOutlookConnected(userId: string, connectedAt: Date) {
    const user = await findByIdOrThrow(this.userRepo, userId, 'User');
    user.outlookConnectedAt = connectedAt;
    return this.userRepo.save(user);
  }

  async updateSignature(userId: string, signature: string | null) {
    const user = await findByIdOrThrow(this.userRepo, userId, 'User');
    user.emailSignature = signature;
    return this.userRepo.save(user);
  }

  private async ensureDefaultRoleAssignment(user: User) {
    const existing = await this.assignmentRepo.find({
      where: { userId: user.id },
    });
    if (existing.length > 0) return;

    const roleName = getDefaultRoleName(user.isAppAdmin);
    const role = await this.appRoleRepo.findOne({ where: { name: roleName } });
    if (!role) return;
    await this.assignmentRepo.save(
      this.assignmentRepo.create({ userId: user.id, roleId: role.id }),
    );
  }

  private async replaceDepartments(userId: string, departments: string[]) {
    await this.deptRepo.delete({ userId });

    if (departments.length === 0) {
      return;
    }

    const rows = departments.map((department) =>
      this.deptRepo.create({
        userId,
        department: department as UserDepartment['department'],
      }),
    );
    await this.deptRepo.save(rows);
  }

  private async findExistingOsUser(osUser: OsUserPayload) {
    const osUserId = osUser.os_user_id as string;
    const byOsId = await this.findByOsUserId(osUserId);
    if (byOsId) {
      return byOsId;
    }

    if (!osUser.email) {
      return null;
    }

    return this.findByEmail(osUser.email);
  }

  format(user: User) {
    return formatUserResponse(user);
  }

  formatMany(users: User[]) {
    return users.map((u) => this.format(u));
  }
}
