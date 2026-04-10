import { VendorContactInputDto } from '../dto/vendor-contact-input.dto';
export declare function requireVendorCompanyName(value: unknown): string;
export declare function requireVendorOfficeName(value: unknown): string;
export declare function resolveVendorOfficeName(input: {
    officeName?: unknown;
    cityName?: unknown;
    stateName?: unknown;
    countryName?: unknown;
    externalCode?: unknown;
    fallbackOfficeName?: unknown;
}): string;
export declare function requireVendorContactName(value: unknown): string;
export declare function assertSinglePrimaryContact(contacts?: VendorContactInputDto[]): void;
