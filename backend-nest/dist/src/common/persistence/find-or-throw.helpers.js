"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOneOrThrow = findOneOrThrow;
exports.findByIdOrThrow = findByIdOrThrow;
const common_1 = require("@nestjs/common");
function resolveNotFoundMessage(entityNameOrMessage) {
    return /not found/i.test(entityNameOrMessage)
        ? entityNameOrMessage
        : `${entityNameOrMessage} not found`;
}
async function findOneOrThrow(repo, where, entityNameOrMessage) {
    const entity = await repo.findOne({ where });
    if (!entity) {
        throw new common_1.NotFoundException(resolveNotFoundMessage(entityNameOrMessage));
    }
    return entity;
}
async function findByIdOrThrow(repo, id, entityNameOrMessage) {
    return findOneOrThrow(repo, { id }, entityNameOrMessage);
}
//# sourceMappingURL=find-or-throw.helpers.js.map