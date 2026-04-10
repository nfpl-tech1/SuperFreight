"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeCode = normalizeCode;
const string_1 = require("./string");
function normalizeCode(value) {
    const cleaned = (0, string_1.optionalText)(value);
    return cleaned ? cleaned.toUpperCase() : null;
}
//# sourceMappingURL=code.js.map