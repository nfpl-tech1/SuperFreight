import { PortMode } from '../entities/port-master.entity';
export declare class ListPortMasterDto {
    page?: number;
    pageSize?: number;
    search?: string;
    countryName?: string;
    portMode?: PortMode;
    isActive?: boolean;
}
