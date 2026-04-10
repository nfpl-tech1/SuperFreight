export declare enum PortMode {
    AIRPORT = "AIRPORT",
    SEAPORT = "SEAPORT"
}
export declare class PortMaster {
    id: string;
    code: string;
    name: string;
    normalizedName: string | null;
    cityName: string | null;
    normalizedCityName: string | null;
    stateName: string | null;
    countryName: string;
    normalizedCountryName: string | null;
    portMode: PortMode;
    regionId: string | null;
    unlocode: string | null;
    sourceConfidence: string | null;
    isActive: boolean;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}
