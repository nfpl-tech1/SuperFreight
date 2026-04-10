"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeEmail = normalizeEmail;
exports.extractEmails = extractEmails;
exports.getEmailDomain = getEmailDomain;
exports.isGenericEmailDomain = isGenericEmailDomain;
const string_1 = require("./string");
const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const GENERIC_EMAIL_DOMAINS = new Set([
    'gmail.com',
    'googlemail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'live.com',
    'icloud.com',
]);
function normalizeEmail(value) {
    const cleaned = (0, string_1.optionalText)(value);
    return cleaned ? cleaned.toLowerCase() : null;
}
function extractEmails(value) {
    const cleaned = (0, string_1.optionalText)(value);
    if (!cleaned) {
        return [];
    }
    return Array.from(new Set((cleaned.match(EMAIL_REGEX) ?? []).map((match) => match.toLowerCase())));
}
function getEmailDomain(email) {
    const normalized = normalizeEmail(email);
    return normalized?.split('@')[1] ?? null;
}
function isGenericEmailDomain(email) {
    const domain = getEmailDomain(email);
    return domain ? GENERIC_EMAIL_DOMAINS.has(domain) : false;
}
//# sourceMappingURL=email.js.map