"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireVendorCompanyName = requireVendorCompanyName;
exports.requireVendorOfficeName = requireVendorOfficeName;
exports.resolveVendorOfficeName = resolveVendorOfficeName;
exports.requireVendorContactName = requireVendorContactName;
exports.assertSinglePrimaryContact = assertSinglePrimaryContact;
const common_1 = require("@nestjs/common");
const vendor_normalization_1 = require("./vendor-normalization");
function requireVendorCompanyName(value) {
    const cleaned = (0, vendor_normalization_1.normalizeVendorCompanyName)(value);
    if (!cleaned) {
        throw new common_1.BadRequestException('Company name is required');
    }
    return cleaned;
}
function requireVendorOfficeName(value) {
    const cleaned = (0, vendor_normalization_1.normalizeVendorOfficeName)(value);
    if (!cleaned) {
        throw new common_1.BadRequestException('Office name is required');
    }
    return cleaned;
}
function resolveVendorOfficeName(input) {
    const explicitOfficeName = (0, vendor_normalization_1.normalizeVendorOfficeName)(input.officeName);
    if (explicitOfficeName) {
        return explicitOfficeName;
    }
    const locationName = (0, vendor_normalization_1.normalizeVendorLocationName)(input.cityName) ??
        (0, vendor_normalization_1.normalizeVendorLocationName)(input.stateName) ??
        (0, vendor_normalization_1.normalizeVendorLocationName)(input.countryName);
    if (locationName) {
        return locationName;
    }
    const externalCode = (0, vendor_normalization_1.normalizeVendorExternalCode)(input.externalCode);
    if (externalCode) {
        return externalCode;
    }
    const fallbackOfficeName = (0, vendor_normalization_1.normalizeVendorOfficeName)(input.fallbackOfficeName);
    if (fallbackOfficeName) {
        return fallbackOfficeName;
    }
    throw new common_1.BadRequestException('Office name could not be derived. Add a city, state, country, or external code.');
}
function requireVendorContactName(value) {
    const cleaned = (0, vendor_normalization_1.normalizeVendorContactName)(value);
    if (!cleaned) {
        throw new common_1.BadRequestException('Contact name is required');
    }
    return cleaned;
}
function assertSinglePrimaryContact(contacts) {
    if (!contacts || contacts.length === 0) {
        return;
    }
    const primaryCount = contacts.filter((contact) => contact.isPrimary).length;
    if (primaryCount > 1) {
        throw new common_1.BadRequestException('Only one primary contact is allowed per office');
    }
}
//# sourceMappingURL=vendor-validation.js.map