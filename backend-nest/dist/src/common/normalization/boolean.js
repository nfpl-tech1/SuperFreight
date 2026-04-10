"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBooleanLike = parseBooleanLike;
exports.parseYesFlag = parseYesFlag;
const string_1 = require("./string");
const TRUE_TOKENS = new Set(['1', 'y', 'yes', 'true']);
const FALSE_TOKENS = new Set(['0', 'n', 'no', 'false']);
function parseBooleanLike(value) {
    const cleaned = (0, string_1.optionalText)(value)?.toLowerCase();
    if (!cleaned) {
        return null;
    }
    if (TRUE_TOKENS.has(cleaned)) {
        return true;
    }
    if (FALSE_TOKENS.has(cleaned)) {
        return false;
    }
    return null;
}
function parseYesFlag(value) {
    return parseBooleanLike(value) === true;
}
//# sourceMappingURL=boolean.js.map