import { VendorCcRecipientInputDto } from './vendor-cc-recipient-input.dto';
import { VendorContactInputDto } from './vendor-contact-input.dto';
export declare class CreateVendorOfficeDto {
    officeName?: string;
    cityName?: string;
    stateName?: string;
    countryName?: string;
    addressRaw?: string;
    externalCode?: string;
    specializationRaw?: string;
    isActive?: boolean;
    isIataCertified?: boolean;
    doesSeaFreight?: boolean;
    doesProjectCargo?: boolean;
    doesOwnConsolidation?: boolean;
    doesOwnTransportation?: boolean;
    doesOwnWarehousing?: boolean;
    doesOwnCustomClearance?: boolean;
    isPrimary?: boolean;
    typeIds?: string[];
    portIds?: string[];
    contacts?: VendorContactInputDto[];
    ccRecipients?: VendorCcRecipientInputDto[];
}
