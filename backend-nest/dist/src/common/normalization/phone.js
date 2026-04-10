"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePhone = normalizePhone;
exports.extractPhoneNumbers = extractPhoneNumbers;
const string_1 = require("./string");
function normalizePhone(value) {
    const cleaned = (0, string_1.optionalText)(value);
    if (!cleaned) {
        return null;
    }
    const hasLeadingPlus = cleaned.startsWith('+');
    const digits = cleaned.replace(/\D/g, '');
    if (!digits) {
        return null;
    }
    return `${hasLeadingPlus ? '+' : ''}${digits}`;
}
function extractPhoneNumbers(value) {
    const cleaned = (0, string_1.optionalText)(value);
    if (!cleaned) {
        return [];
    }
    return Array.from(new Set(cleaned
        .split(/[;,/]/)
        .map((part) => normalizePhone(part))
        .filter((part) => Boolean(part))));
}
//# sourceMappingURL=phone.js.map