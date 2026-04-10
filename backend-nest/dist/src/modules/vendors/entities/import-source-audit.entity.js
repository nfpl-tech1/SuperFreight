"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportSourceAudit = exports.ImportSourceAuditAction = exports.ImportSourceAuditEntityKind = void 0;
const typeorm_1 = require("typeorm");
var ImportSourceAuditEntityKind;
(function (ImportSourceAuditEntityKind) {
    ImportSourceAuditEntityKind["VENDOR"] = "VENDOR";
    ImportSourceAuditEntityKind["OFFICE"] = "OFFICE";
    ImportSourceAuditEntityKind["PORT"] = "PORT";
    ImportSourceAuditEntityKind["SERVICE_LOCATION"] = "SERVICE_LOCATION";
    ImportSourceAuditEntityKind["PORT_LINK"] = "PORT_LINK";
    ImportSourceAuditEntityKind["SERVICE_LOCATION_LINK"] = "SERVICE_LOCATION_LINK";
    ImportSourceAuditEntityKind["CONTACT"] = "CONTACT";
})(ImportSourceAuditEntityKind || (exports.ImportSourceAuditEntityKind = ImportSourceAuditEntityKind = {}));
var ImportSourceAuditAction;
(function (ImportSourceAuditAction) {
    ImportSourceAuditAction["CREATED"] = "CREATED";
    ImportSourceAuditAction["UPDATED"] = "UPDATED";
    ImportSourceAuditAction["SKIPPED"] = "SKIPPED";
    ImportSourceAuditAction["REVIEW_REQUIRED"] = "REVIEW_REQUIRED";
})(ImportSourceAuditAction || (exports.ImportSourceAuditAction = ImportSourceAuditAction = {}));
let ImportSourceAudit = class ImportSourceAudit {
    id;
    sourceWorkbook;
    sourceSheet;
    sourceRowNumber;
    entityKind;
    action;
    confidence;
    normalizedKey;
    vendorId;
    officeId;
    portId;
    serviceLocationId;
    reason;
    rawPayloadJson;
    createdAt;
};
exports.ImportSourceAudit = ImportSourceAudit;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ImportSourceAudit.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ImportSourceAudit.prototype, "sourceWorkbook", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ImportSourceAudit.prototype, "sourceSheet", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], ImportSourceAudit.prototype, "sourceRowNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ImportSourceAuditEntityKind }),
    __metadata("design:type", String)
], ImportSourceAudit.prototype, "entityKind", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ImportSourceAuditAction }),
    __metadata("design:type", String)
], ImportSourceAudit.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], ImportSourceAudit.prototype, "confidence", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], ImportSourceAudit.prototype, "normalizedKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], ImportSourceAudit.prototype, "vendorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], ImportSourceAudit.prototype, "officeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], ImportSourceAudit.prototype, "portId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], ImportSourceAudit.prototype, "serviceLocationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], ImportSourceAudit.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ImportSourceAudit.prototype, "rawPayloadJson", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ImportSourceAudit.prototype, "createdAt", void 0);
exports.ImportSourceAudit = ImportSourceAudit = __decorate([
    (0, typeorm_1.Index)('IDX_import_source_audit_source', [
        'sourceWorkbook',
        'sourceSheet',
        'sourceRowNumber',
    ]),
    (0, typeorm_1.Index)('IDX_import_source_audit_entity', ['entityKind', 'action']),
    (0, typeorm_1.Entity)('import_source_audit')
], ImportSourceAudit);
//# sourceMappingURL=import-source-audit.entity.js.map