import { PortMode } from '../entities/port-master.entity';
import { VendorTypeCode } from '../entities/vendor-type-master.entity';
export declare enum VendorLocationKind {
    PORT = "PORT",
    SERVICE_LOCATION = "SERVICE_LOCATION"
}
export declare enum VendorLocationRole {
    ORIGIN = "ORIGIN",
    DESTINATION = "DESTINATION"
}
export declare enum VendorLocationScope {
    EXACT = "EXACT",
    COUNTRY = "COUNTRY"
}
export declare enum VendorQuoteTypeContext {
    ROAD_FREIGHT = "road_freight",
    CHA_SERVICES = "cha_services",
    OCEAN_FREIGHT = "ocean_freight",
    AIR_FREIGHT = "air_freight",
    LOCAL_PORT_CHARGES = "local_port_charges",
    DESTINATION_CHARGES = "destination_charges"
}
export type VendorSelectionContext = {
    locationKind: VendorLocationKind;
    portMode: PortMode | null;
    defaultTypeCodes: VendorTypeCode[];
};
export declare function resolveVendorSelectionContext(input: {
    quoteTypeContext?: string | null;
    shipmentMode?: string | null;
}): VendorSelectionContext;
export declare function buildLegacyServiceLocationId(normalizedName: string, normalizedCountryName: string): string;
export declare function parseLegacyServiceLocationId(value?: string | null): {
    normalizedName: string;
    normalizedCountryName: string;
} | null;
