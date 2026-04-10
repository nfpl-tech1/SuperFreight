"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNullishToken = isNullishToken;
const NULLISH_TOKENS = new Set([
    '',
    '-',
    '--',
    'n/a',
    'na',
    'n.a.',
    'nil',
    'null',
    'none',
]);
function isNullishToken(value) {
    return NULLISH_TOKENS.has(value.trim().toLowerCase());
}
//# sourceMappingURL=nullish.js.map