import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  AnyModuleAccess,
  ModuleAccess,
} from '../../common/decorators/module-access.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Audit } from '../../common/decorators/audit.decorator';
import { CreateAppRoleDto } from './dto/create-app-role.dto';
import { RolesService } from './roles.service';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @AnyModuleAccess([
    { moduleKey: 'admin-roles', action: 'view' },
    { moduleKey: 'admin-users', action: 'view' },
  ])
  getAll() {
    return this.rolesService.list();
  }

  @Post()
  @ModuleAccess('admin-roles', 'edit')
  @Audit('ROLE_CREATED', 'role')
  create(@Body() dto: CreateAppRoleDto) {
    return this.rolesService.create(dto);
  }

  @Put(':id')
  @ModuleAccess('admin-roles', 'edit')
  @Audit('ROLE_UPDATED', 'role')
  update(@Param('id') id: string, @Body() dto: CreateAppRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @Delete(':id')
  @ModuleAccess('admin-roles', 'edit')
  @Audit('ROLE_DELETED', 'role')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
