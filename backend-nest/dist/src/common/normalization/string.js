"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeWhitespace = normalizeWhitespace;
exports.optionalText = optionalText;
exports.normalizeTextKey = normalizeTextKey;
const nullish_1 = require("./nullish");
function normalizeWhitespace(value) {
    return value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}
function optionalText(value) {
    if (value === null || value === undefined) {
        return null;
    }
    const cleaned = normalizeWhitespace(String(value));
    if (!cleaned || (0, nullish_1.isNullishToken)(cleaned)) {
        return null;
    }
    return cleaned;
}
function normalizeTextKey(value) {
    return (optionalText(value)
        ?.toUpperCase()
        .replace(/&/g, ' AND ')
        .replace(/[^A-Z0-9]+/g, ' ')
        .trim() ?? '');
}
//# sourceMappingURL=string.js.map