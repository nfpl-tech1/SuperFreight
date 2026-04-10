import { PortMode } from './port-master.entity';
export declare class PortAlias {
    id: string;
    portId: string;
    alias: string;
    normalizedAlias: string;
    countryName: string | null;
    portMode: PortMode | null;
    isPrimary: boolean;
    sourceWorkbook: string | null;
    sourceSheet: string | null;
    createdAt: Date;
    updatedAt: Date;
}
