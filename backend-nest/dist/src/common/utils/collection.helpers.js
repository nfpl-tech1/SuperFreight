"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupBy = groupBy;
exports.groupMappedBy = groupMappedBy;
exports.isNonEmpty = isNonEmpty;
function groupBy(items, keySelector) {
    const groups = new Map();
    for (const item of items) {
        const key = keySelector(item);
        const existing = groups.get(key);
        if (existing) {
            existing.push(item);
            continue;
        }
        groups.set(key, [item]);
    }
    return groups;
}
function groupMappedBy(items, keySelector, valueSelector) {
    const groups = new Map();
    for (const item of items) {
        const value = valueSelector(item);
        if (!value) {
            continue;
        }
        const key = keySelector(item);
        const existing = groups.get(key);
        if (existing) {
            existing.push(value);
            continue;
        }
        groups.set(key, [value]);
    }
    return groups;
}
function isNonEmpty(value) {
    return Boolean(value && value.trim());
}
//# sourceMappingURL=collection.helpers.js.map