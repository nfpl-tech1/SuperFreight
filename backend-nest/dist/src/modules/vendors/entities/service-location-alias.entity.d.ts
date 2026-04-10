import { ServiceLocationKind } from './service-location-master.entity';
export declare class ServiceLocationAlias {
    id: string;
    serviceLocationId: string;
    alias: string;
    normalizedAlias: string;
    countryName: string | null;
    locationKind: ServiceLocationKind | null;
    isPrimary: boolean;
    sourceWorkbook: string | null;
    sourceSheet: string | null;
    createdAt: Date;
    updatedAt: Date;
}
