"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeVendorCompanyName = normalizeVendorCompanyName;
exports.normalizeVendorNameKey = normalizeVendorNameKey;
exports.normalizeVendorOfficeName = normalizeVendorOfficeName;
exports.normalizeVendorLocationName = normalizeVendorLocationName;
exports.normalizeVendorContactName = normalizeVendorContactName;
exports.normalizeVendorDesignation = normalizeVendorDesignation;
exports.normalizeVendorSalutation = normalizeVendorSalutation;
exports.normalizeVendorFreeText = normalizeVendorFreeText;
exports.normalizeVendorAddress = normalizeVendorAddress;
exports.normalizeVendorNotes = normalizeVendorNotes;
exports.normalizeVendorExternalCode = normalizeVendorExternalCode;
exports.normalizeVendorEmail = normalizeVendorEmail;
exports.normalizeVendorPhone = normalizeVendorPhone;
exports.normalizeVendorSheetTitle = normalizeVendorSheetTitle;
const normalization_1 = require("../../../common/normalization");
function shouldApplySmartCase(value) {
    const lettersOnly = value.replace(/[^A-Za-z]/g, '');
    if (!lettersOnly) {
        return false;
    }
    return lettersOnly === lettersOnly.toUpperCase() || lettersOnly === lettersOnly.toLowerCase();
}
function normalizeVendorCompanyName(value) {
    const cleaned = (0, normalization_1.optionalText)(value);
    if (!cleaned) {
        return null;
    }
    return shouldApplySmartCase(cleaned) ? (0, normalization_1.toSmartTitleCase)(cleaned) : cleaned;
}
function normalizeVendorNameKey(value) {
    return (0, normalization_1.normalizeTextKey)(value);
}
function normalizeVendorOfficeName(value) {
    const cleaned = (0, normalization_1.optionalText)(value);
    if (!cleaned) {
        return null;
    }
    return shouldApplySmartCase(cleaned) ? (0, normalization_1.toSmartTitleCase)(cleaned) : cleaned;
}
function normalizeVendorLocationName(value) {
    const cleaned = (0, normalization_1.optionalText)(value);
    return cleaned ? (0, normalization_1.toSmartTitleCase)(cleaned) : null;
}
function normalizeVendorContactName(value) {
    const cleaned = (0, normalization_1.optionalText)(value);
    return cleaned ? (0, normalization_1.toSmartTitleCase)(cleaned) : null;
}
function normalizeVendorDesignation(value) {
    const cleaned = (0, normalization_1.optionalText)(value);
    return cleaned ? (0, normalization_1.toSmartTitleCase)(cleaned) : null;
}
function normalizeVendorSalutation(value) {
    const cleaned = (0, normalization_1.optionalText)(value);
    return cleaned ? (0, normalization_1.toSmartTitleCase)(cleaned) : null;
}
function normalizeVendorFreeText(value) {
    return (0, normalization_1.optionalText)(value);
}
function normalizeVendorAddress(value) {
    return (0, normalization_1.optionalText)(value);
}
function normalizeVendorNotes(value) {
    return (0, normalization_1.optionalText)(value);
}
function normalizeVendorExternalCode(value) {
    return (0, normalization_1.normalizeCode)(value);
}
function normalizeVendorEmail(value) {
    return (0, normalization_1.normalizeEmail)(value);
}
function normalizeVendorPhone(value) {
    return (0, normalization_1.normalizePhone)(value);
}
function normalizeVendorSheetTitle(value) {
    const cleaned = (0, normalization_1.optionalText)(value);
    return cleaned?.replace(/\s+Above\s+\d+\s*years/i, '') ?? null;
}
//# sourceMappingURL=vendor-normalization.js.map