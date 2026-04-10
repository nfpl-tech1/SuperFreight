"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchFromOs = fetchFromOs;
exports.postToOs = postToOs;
const os_auth_helpers_1 = require("./os-auth.helpers");
function fetchFromOs(config, path) {
    return fetch(`${(0, os_auth_helpers_1.getOsBackendUrl)(config)}${path}`).catch(() => null);
}
function postToOs(config, path, payload) {
    return fetch(`${(0, os_auth_helpers_1.getOsBackendUrl)(config)}${path}`, {
        method: 'POST',
        headers: (0, os_auth_helpers_1.getOsInternalHeaders)(config),
        body: JSON.stringify(payload),
    }).catch(() => null);
}
//# sourceMappingURL=os-auth-http.helpers.js.map