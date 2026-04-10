"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSmartTitleCase = toSmartTitleCase;
const DEFAULT_UPPERCASE_WORDS = new Set([
    'AIR',
    'BHD',
    'BV',
    'CHA',
    'CFS',
    'DC',
    'DHL',
    'FCL',
    'IATA',
    'INC',
    'LCL',
    'LLC',
    'LLP',
    'LTD',
    'NVOCC',
    'PTE',
    'PTY',
    'PVT',
    'SEA',
    'SDN',
    'SRO',
    'UAE',
    'UK',
    'USA',
    'WCA',
]);
function toSmartTitleCase(value, uppercaseWords = DEFAULT_UPPERCASE_WORDS, options = {}) {
    const preserveGenericAcronyms = options.preserveGenericAcronyms ?? true;
    return value
        .split(/(\s+|[-/,&()])/)
        .map((token) => transformToken(token, uppercaseWords, preserveGenericAcronyms))
        .join('');
}
function transformToken(token, uppercaseWords, preserveGenericAcronyms) {
    if (!/[A-Za-z]/.test(token)) {
        return token;
    }
    const core = token.replace(/[^A-Za-z0-9]/g, '');
    if (!core) {
        return token;
    }
    const uppercaseCore = core.toUpperCase();
    if (uppercaseWords.has(uppercaseCore) ||
        (preserveGenericAcronyms && /^[A-Z]{2,4}$/.test(uppercaseCore)) ||
        /^(?:[A-Za-z]\.)+[A-Za-z]?\.?$/.test(token)) {
        return token.toUpperCase();
    }
    const lower = token.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
}
//# sourceMappingURL=case.js.map