export declare class VendorOffice {
    id: string;
    vendorId: string;
    officeName: string;
    cityName: string | null;
    stateName: string | null;
    countryName: string | null;
    addressRaw: string | null;
    externalCode: string | null;
    specializationRaw: string | null;
    isActive: boolean;
    isIataCertified: boolean;
    doesSeaFreight: boolean;
    doesProjectCargo: boolean;
    doesOwnConsolidation: boolean;
    doesOwnTransportation: boolean;
    doesOwnWarehousing: boolean;
    doesOwnCustomClearance: boolean;
    createdAt: Date;
    updatedAt: Date;
}
