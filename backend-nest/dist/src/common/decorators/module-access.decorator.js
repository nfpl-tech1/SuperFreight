"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnyModuleAccess = exports.ModuleAccess = exports.ANY_MODULE_ACCESS_KEY = exports.MODULE_ACCESS_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.MODULE_ACCESS_KEY = 'moduleAccess';
exports.ANY_MODULE_ACCESS_KEY = 'anyModuleAccess';
const ModuleAccess = (moduleKey, action = 'view') => (0, common_1.SetMetadata)(exports.MODULE_ACCESS_KEY, { moduleKey, action });
exports.ModuleAccess = ModuleAccess;
const AnyModuleAccess = (requirements) => (0, common_1.SetMetadata)(exports.ANY_MODULE_ACCESS_KEY, requirements);
exports.AnyModuleAccess = AnyModuleAccess;
//# sourceMappingURL=module-access.decorator.js.map