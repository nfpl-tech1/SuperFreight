import { PortMode } from '../entities/port-master.entity';
import { PortMasterAliasInputDto } from './port-master-alias-input.dto';
export declare class UpdatePortMasterDto {
    code?: string;
    name?: string;
    cityName?: string;
    stateName?: string;
    countryName?: string;
    portMode?: PortMode;
    unlocode?: string;
    sourceConfidence?: string;
    isActive?: boolean;
    notes?: string;
    aliases?: PortMasterAliasInputDto[];
}
