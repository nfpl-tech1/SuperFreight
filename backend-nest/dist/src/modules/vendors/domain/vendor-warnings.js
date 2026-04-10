"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inferVendorCompanyNameFromEmail = inferVendorCompanyNameFromEmail;
const normalization_1 = require("../../../common/normalization");
const vendor_normalization_1 = require("./vendor-normalization");
function inferVendorCompanyNameFromEmail(email) {
    const normalizedEmail = email?.toLowerCase() ?? '';
    const domain = (0, normalization_1.getEmailDomain)(normalizedEmail);
    if (!domain || (0, normalization_1.isGenericEmailDomain)(normalizedEmail)) {
        return null;
    }
    const companyToken = domain.includes('.com')
        ? domain.split('.com')[0]
        : domain.split('.')[0];
    if (!companyToken) {
        return null;
    }
    return (0, vendor_normalization_1.normalizeVendorCompanyName)(companyToken
        .split(/[-_.]+/)
        .filter(Boolean)
        .join(' '));
}
//# sourceMappingURL=vendor-warnings.js.map