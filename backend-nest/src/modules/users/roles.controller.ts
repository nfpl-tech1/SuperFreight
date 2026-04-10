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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import { CreateAppRoleDto } from './dto/create-app-role.dto';
import { Role } from './entities/user.entity';
import { RolesService } from './roles.service';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  getAll() {
    return this.rolesService.list();
  }

  @Post()
  @Audit('ROLE_CREATED', 'role')
  create(@Body() dto: CreateAppRoleDto) {
    return this.rolesService.create(dto);
  }

  @Put(':id')
  @Audit('ROLE_UPDATED', 'role')
  update(@Param('id') id: string, @Body() dto: CreateAppRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @Delete(':id')
  @Audit('ROLE_DELETED', 'role')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
