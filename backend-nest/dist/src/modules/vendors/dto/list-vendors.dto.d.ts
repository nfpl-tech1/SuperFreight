import { VendorLocationKind, VendorLocationRole, VendorLocationScope, VendorQuoteTypeContext } from '../domain/vendor-selection-context';
import { VendorTypeCode } from '../entities/vendor-type-master.entity';
export declare class ListVendorsDto {
    page?: number;
    pageSize?: number;
    search?: string;
    isActive?: boolean;
    countryName?: string;
    cityName?: string;
    quoteTypeContext?: VendorQuoteTypeContext;
    shipmentMode?: string;
    locationKind?: VendorLocationKind;
    locationId?: string;
    locationCountryName?: string;
    locationRole?: VendorLocationRole;
    locationScope?: VendorLocationScope;
    typeCodes?: VendorTypeCode[];
    isIataCertified?: boolean;
    doesSeaFreight?: boolean;
    doesProjectCargo?: boolean;
    doesOwnConsolidation?: boolean;
    doesOwnTransportation?: boolean;
    doesOwnWarehousing?: boolean;
    doesOwnCustomClearance?: boolean;
}
