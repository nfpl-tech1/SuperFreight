"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InquiriesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const audit_module_1 = require("../audit/audit.module");
const customer_draft_entity_1 = require("../customer-quotes/entities/customer-draft.entity");
const rfq_entity_1 = require("../rfqs/entities/rfq.entity");
const freight_quote_entity_1 = require("../shipments/entities/freight-quote.entity");
const external_thread_ref_entity_1 = require("./entities/external-thread-ref.entity");
const inquiry_entity_1 = require("./entities/inquiry.entity");
const job_service_part_entity_1 = require("./entities/job-service-part.entity");
const job_entity_1 = require("./entities/job.entity");
const ownership_assignment_entity_1 = require("./entities/ownership-assignment.entity");
const inquiries_controller_1 = require("./inquiries.controller");
const inquiries_service_1 = require("./inquiries.service");
let InquiriesModule = class InquiriesModule {
};
exports.InquiriesModule = InquiriesModule;
exports.InquiriesModule = InquiriesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([customer_draft_entity_1.CustomerDraft, freight_quote_entity_1.FreightQuote, rfq_entity_1.Rfq]),
            typeorm_1.TypeOrmModule.forFeature([external_thread_ref_entity_1.ExternalThreadRef, inquiry_entity_1.Inquiry, job_entity_1.Job, job_service_part_entity_1.JobServicePart, ownership_assignment_entity_1.OwnershipAssignment], 'business'),
            audit_module_1.AuditModule,
        ],
        controllers: [inquiries_controller_1.InquiriesController],
        providers: [inquiries_service_1.InquiriesService],
        exports: [inquiries_service_1.InquiriesService],
    })
], InquiriesModule);
//# sourceMappingURL=inquiries.module.js.map