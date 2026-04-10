import { VendorLocationKind, VendorLocationRole, VendorQuoteTypeContext } from '../domain/vendor-selection-context';
import { PortMode } from '../entities/port-master.entity';
import { VendorTypeCode } from '../entities/vendor-type-master.entity';
export declare class ListVendorLocationOptionsDto {
    page?: number;
    pageSize?: number;
    quoteTypeContext?: VendorQuoteTypeContext;
    shipmentMode?: string;
    locationKind?: VendorLocationKind;
    locationRole?: VendorLocationRole;
    portMode?: PortMode;
    countryName?: string;
    search?: string;
    typeCodes?: VendorTypeCode[];
}
