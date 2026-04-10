import { CreateAppRoleDto } from './dto/create-app-role.dto';
import { RolesService } from './roles.service';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    getAll(): Promise<import("./entities/app-role.entity").AppRole[]>;
    create(dto: CreateAppRoleDto): Promise<import("./entities/app-role.entity").AppRole>;
    update(id: string, dto: CreateAppRoleDto): Promise<import("./entities/app-role.entity").AppRole>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
