"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultRoleName = getDefaultRoleName;
exports.applyOsUserPayload = applyOsUserPayload;
const user_entity_1 = require("./entities/user.entity");
const role_presets_1 = require("./role-presets");
function getDefaultRoleName(isAppAdmin) {
    return isAppAdmin ? role_presets_1.ROLE_NAMES.ADMIN : role_presets_1.ROLE_NAMES.OPERATOR;
}
function applyOsUserPayload(user, osUser) {
    user.osUserId = osUser.os_user_id;
    user.email = osUser.email ?? user.email;
    user.name = osUser.name ?? user.name;
    user.role = osUser.is_app_admin ? user_entity_1.Role.ADMIN : user_entity_1.Role.USER;
    user.isAppAdmin = !!osUser.is_app_admin;
    user.isTeamLead = !!osUser.is_team_lead;
    user.isActive = user.isActive ?? true;
    user.userType = osUser.user_type ?? user.userType;
    user.departmentSlug = osUser.department_slug ?? null;
    user.departmentName = osUser.department_name ?? null;
    user.orgId = osUser.org_id ?? null;
    user.orgName = osUser.org_name ?? null;
    user.lastLoginContext = osUser;
}
//# sourceMappingURL=os-user-sync.helpers.js.map