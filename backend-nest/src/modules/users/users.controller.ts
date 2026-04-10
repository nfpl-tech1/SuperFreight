import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Audit } from '../../common/decorators/audit.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AssignUserRolesDto } from './dto/assign-user-roles.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateDepartmentsDto } from './dto/update-departments.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role, User } from './entities/user.entity';
import { RolesService } from './roles.service';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
  ) {}

  @Get('me')
  getMe(@CurrentUser() user: User) {
    return this.usersService.format(user);
  }

  @Patch('me/signature')
  @HttpCode(HttpStatus.OK)
  async updateMySignature(
    @CurrentUser() user: User,
    @Body() body: { signature: string | null },
  ) {
    const updated = await this.usersService.updateSignature(user.id, body.signature ?? null);
    return this.usersService.format(updated);
  }

  @Get()
  @Roles(Role.ADMIN)
  async getAll(@Query('skip') skip = 0, @Query('limit') limit = 100) {
    const users = await this.usersService.findAll(+skip, +limit);
    return this.usersService.formatMany(users);
  }

  @Post()
  @Roles(Role.ADMIN)
  @Audit('USER_CREATED', 'user')
  async create(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    return this.usersService.format(user);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @Audit('USER_UPDATED', 'user')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.update(id, dto);
    return this.usersService.format(user);
  }

  @Post(':id/departments')
  @Roles(Role.ADMIN)
  @Audit('USER_DEPARTMENTS_UPDATED', 'user')
  @HttpCode(HttpStatus.OK)
  async updateDepartments(
    @Param('id') id: string,
    @Body() dto: UpdateDepartmentsDto,
  ) {
    const user = await this.usersService.updateDepartments(id, dto.departments);
    return this.usersService.format(user);
  }

  @Post(':id/roles')
  @Roles(Role.ADMIN)
  @Audit('USER_ROLES_UPDATED', 'user')
  @HttpCode(HttpStatus.OK)
  async assignRoles(@Param('id') id: string, @Body() dto: AssignUserRolesDto) {
    await this.rolesService.assignUserRoles(id, dto.roleIds);
    const user = await this.usersService.findById(id);
    return this.usersService.format(user as User);
  }
}
