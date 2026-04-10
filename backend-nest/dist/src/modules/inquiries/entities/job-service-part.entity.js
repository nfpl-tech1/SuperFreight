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
exports.JobServicePart = exports.JobServicePartType = void 0;
const typeorm_1 = require("typeorm");
var JobServicePartType;
(function (JobServicePartType) {
    JobServicePartType["FREIGHT"] = "FREIGHT";
    JobServicePartType["CHA"] = "CHA";
    JobServicePartType["TRANSPORTATION"] = "TRANSPORTATION";
})(JobServicePartType || (exports.JobServicePartType = JobServicePartType = {}));
let JobServicePart = class JobServicePart {
    id;
    jobId;
    partType;
    ownerUserId;
    status;
    applicationSlug;
    meta;
    createdAt;
    updatedAt;
};
exports.JobServicePart = JobServicePart;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], JobServicePart.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], JobServicePart.prototype, "jobId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: JobServicePartType }),
    __metadata("design:type", String)
], JobServicePart.prototype, "partType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], JobServicePart.prototype, "ownerUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], JobServicePart.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], JobServicePart.prototype, "applicationSlug", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], JobServicePart.prototype, "meta", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], JobServicePart.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], JobServicePart.prototype, "updatedAt", void 0);
exports.JobServicePart = JobServicePart = __decorate([
    (0, typeorm_1.Index)('IDX_job_service_parts_jobId', ['jobId']),
    (0, typeorm_1.Entity)('job_service_parts')
], JobServicePart);
//# sourceMappingURL=job-service-part.entity.js.map