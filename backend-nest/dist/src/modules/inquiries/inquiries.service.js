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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InquiriesService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_draft_entity_1 = require("../customer-quotes/entities/customer-draft.entity");
const rfq_entity_1 = require("../rfqs/entities/rfq.entity");
const freight_quote_entity_1 = require("../shipments/entities/freight-quote.entity");
const external_thread_ref_entity_1 = require("./entities/external-thread-ref.entity");
const inquiry_entity_1 = require("./entities/inquiry.entity");
const job_entity_1 = require("./entities/job.entity");
const job_service_part_entity_1 = require("./entities/job-service-part.entity");
const ownership_assignment_entity_1 = require("./entities/ownership-assignment.entity");
const inquiry_workflow_helpers_1 = require("./inquiry-workflow.helpers");
let InquiriesService = class InquiriesService {
    config;
    customerDraftRepo;
    freightQuoteRepo;
    rfqRepo;
    inquiryRepo;
    jobRepo;
    servicePartRepo;
    ownershipRepo;
    constructor(config, customerDraftRepo, freightQuoteRepo, rfqRepo, inquiryRepo, jobRepo, servicePartRepo, ownershipRepo) {
        this.config = config;
        this.customerDraftRepo = customerDraftRepo;
        this.freightQuoteRepo = freightQuoteRepo;
        this.rfqRepo = rfqRepo;
        this.inquiryRepo = inquiryRepo;
        this.jobRepo = jobRepo;
        this.servicePartRepo = servicePartRepo;
        this.ownershipRepo = ownershipRepo;
    }
    list(currentUser) {
        const where = currentUser.role === 'ADMIN'
            ? {}
            : [
                { ownerUserId: currentUser.id },
                { mailboxOwnerUserId: currentUser.id },
            ];
        return this.inquiryRepo.find({ where, order: { createdAt: 'DESC' } });
    }
    async create(dto, currentUser) {
        const inquiry = await this.createInquiryRecord(dto, currentUser);
        const job = await this.createJobRecord(inquiry);
        await this.createFreightServicePart(job.id, inquiry);
        return inquiry;
    }
    async update(id, dto, currentUser) {
        const inquiry = await this.findAccessibleInquiryOrThrow(id, currentUser);
        Object.assign(inquiry, (0, inquiry_workflow_helpers_1.buildInquiryUpdateInput)(dto));
        const savedInquiry = await this.inquiryRepo.save(inquiry);
        await this.syncJobFromInquiry(savedInquiry);
        return savedInquiry;
    }
    async transfer(id, dto, currentUser) {
        const inquiry = await this.findAccessibleInquiryOrThrow(id, currentUser);
        const previousOwner = inquiry.ownerUserId;
        inquiry.ownerUserId = dto.newOwnerUserId;
        await this.inquiryRepo.save(inquiry);
        await this.recordOwnershipTransfer(inquiry.id, previousOwner, dto.newOwnerUserId, currentUser.id, dto.reason);
        return inquiry;
    }
    async remove(id, currentUser) {
        const inquiry = await this.findAccessibleInquiryOrThrow(id, currentUser);
        await this.customerDraftRepo.manager.transaction(async (appManager) => {
            await appManager.getRepository(customer_draft_entity_1.CustomerDraft).delete({
                inquiryId: inquiry.id,
            });
            await appManager.getRepository(freight_quote_entity_1.FreightQuote).delete({
                inquiryId: inquiry.id,
            });
            await appManager.getRepository(rfq_entity_1.Rfq).delete({
                inquiryId: inquiry.id,
            });
        });
        await this.inquiryRepo.manager.transaction(async (businessManager) => {
            const jobRepo = businessManager.getRepository(job_entity_1.Job);
            const job = await jobRepo.findOne({ where: { inquiryId: inquiry.id } });
            if (job) {
                await businessManager.getRepository(job_service_part_entity_1.JobServicePart).delete({
                    jobId: job.id,
                });
            }
            await businessManager.getRepository(external_thread_ref_entity_1.ExternalThreadRef).delete({
                inquiryId: inquiry.id,
            });
            await businessManager.getRepository(ownership_assignment_entity_1.OwnershipAssignment).delete({
                inquiryId: inquiry.id,
            });
            await jobRepo.delete({ inquiryId: inquiry.id });
            await businessManager.getRepository(inquiry_entity_1.Inquiry).delete(inquiry.id);
        });
        return {
            success: true,
            id: inquiry.id,
        };
    }
    async createInquiryRecord(dto, currentUser) {
        return this.inquiryRepo.save(this.inquiryRepo.create((0, inquiry_workflow_helpers_1.buildInquiryCreateInput)(dto, currentUser.id, await this.generateInquiryNumber())));
    }
    async createJobRecord(inquiry) {
        return this.jobRepo.save(this.jobRepo.create((0, inquiry_workflow_helpers_1.buildJobCreateInput)(inquiry)));
    }
    async syncJobFromInquiry(inquiry) {
        const job = await this.jobRepo.findOne({ where: { inquiryId: inquiry.id } });
        if (!job) {
            return;
        }
        await this.jobRepo.save({
            ...job,
            ...(0, inquiry_workflow_helpers_1.buildJobUpdateInput)(inquiry),
        });
    }
    async createFreightServicePart(jobId, inquiry) {
        await this.servicePartRepo.save(this.servicePartRepo.create((0, inquiry_workflow_helpers_1.buildFreightServicePartCreateInput)(jobId, inquiry, this.config.get('os.appSlug') ?? 'super-freight')));
    }
    async recordOwnershipTransfer(inquiryId, previousOwnerUserId, newOwnerUserId, changedByUserId, reason) {
        await this.ownershipRepo.save(this.ownershipRepo.create((0, inquiry_workflow_helpers_1.buildOwnershipTransferInput)(inquiryId, previousOwnerUserId, newOwnerUserId, changedByUserId, reason)));
    }
    async generateInquiryNumber() {
        for (;;) {
            const suffix = Math.floor(Math.random() * 1_000_000)
                .toString()
                .padStart(6, '0');
            const inquiryNumber = `E${suffix}`;
            const exists = await this.inquiryRepo.findOne({
                where: { inquiryNumber },
            });
            if (!exists)
                return inquiryNumber;
        }
    }
    async findAccessibleInquiryOrThrow(id, currentUser) {
        const where = currentUser.role === 'ADMIN'
            ? { id }
            : [
                { id, ownerUserId: currentUser.id },
                { id, mailboxOwnerUserId: currentUser.id },
            ];
        const inquiry = await this.inquiryRepo.findOne({ where });
        if (!inquiry) {
            throw new common_1.NotFoundException('Inquiry not found');
        }
        return inquiry;
    }
};
exports.InquiriesService = InquiriesService;
exports.InquiriesService = InquiriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(customer_draft_entity_1.CustomerDraft)),
    __param(2, (0, typeorm_1.InjectRepository)(freight_quote_entity_1.FreightQuote)),
    __param(3, (0, typeorm_1.InjectRepository)(rfq_entity_1.Rfq)),
    __param(4, (0, typeorm_1.InjectRepository)(inquiry_entity_1.Inquiry, 'business')),
    __param(5, (0, typeorm_1.InjectRepository)(job_entity_1.Job, 'business')),
    __param(6, (0, typeorm_1.InjectRepository)(job_service_part_entity_1.JobServicePart, 'business')),
    __param(7, (0, typeorm_1.InjectRepository)(ownership_assignment_entity_1.OwnershipAssignment, 'business')),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], InquiriesService);
//# sourceMappingURL=inquiries.service.js.map