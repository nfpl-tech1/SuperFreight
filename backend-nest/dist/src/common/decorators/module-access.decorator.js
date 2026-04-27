"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleAccess = exports.MODULE_ACCESS_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.MODULE_ACCESS_KEY = 'moduleAccess';
const ModuleAccess = (moduleKey, action = 'view') => (0, common_1.SetMetadata)(exports.MODULE_ACCESS_KEY, { moduleKey, action });
exports.ModuleAccess = ModuleAccess;
//# sourceMappingURL=module-access.decorator.js.map