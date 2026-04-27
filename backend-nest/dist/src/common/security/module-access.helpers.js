"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userHasModuleAccess = userHasModuleAccess;
const user_entity_1 = require("../../modules/users/entities/user.entity");
function userHasModuleAccess(user, moduleKey, action) {
    if (!user) {
        return false;
    }
    if (user.role === user_entity_1.Role.ADMIN || user.isAppAdmin) {
        return true;
    }
    return (user.roleAssignments ?? []).some((assignment) => (assignment.role?.permissions ?? []).some((permission) => {
        if (permission.moduleKey !== moduleKey) {
            return false;
        }
        return action === 'edit' ? permission.canEdit : permission.canView;
    }));
}
//# sourceMappingURL=module-access.helpers.js.map