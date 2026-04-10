export declare enum ServiceLocationKind {
    INLAND_CITY = "INLAND_CITY",
    ICD = "ICD",
    CFS = "CFS",
    WAREHOUSE_ZONE = "WAREHOUSE_ZONE",
    CUSTOMS_NODE = "CUSTOMS_NODE",
    AIR_CARGO_AREA = "AIR_CARGO_AREA",
    UNKNOWN = "UNKNOWN"
}
export declare class ServiceLocationMaster {
    id: string;
    name: string;
    normalizedName: string;
    cityName: string | null;
    normalizedCityName: string | null;
    stateName: string | null;
    countryName: string;
    normalizedCountryName: string;
    locationKind: ServiceLocationKind;
    regionId: string | null;
    isActive: boolean;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}
