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
exports.ShipmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const freight_quote_entity_1 = require("./entities/freight-quote.entity");
const rate_sheet_entity_1 = require("./entities/rate-sheet.entity");
const quote_intake_service_1 = require("./services/quote-intake.service");
let ShipmentsService = class ShipmentsService {
    rateSheetRepo;
    quoteRepo;
    quoteIntakeService;
    constructor(rateSheetRepo, quoteRepo, quoteIntakeService) {
        this.rateSheetRepo = rateSheetRepo;
        this.quoteRepo = quoteRepo;
        this.quoteIntakeService = quoteIntakeService;
    }
    listRateSheets() {
        return this.rateSheetRepo.find({
            order: { effectiveMonth: 'DESC', shippingLine: 'ASC' },
        });
    }
    createRateSheet(dto) {
        return this.rateSheetRepo.save(this.rateSheetRepo.create(dto));
    }
    listQuotes(query = {}) {
        return this.quoteRepo.find({
            where: {
                ...(query.inquiryId ? { inquiryId: query.inquiryId } : {}),
                ...(query.rfqId ? { rfqId: query.rfqId } : {}),
                ...(query.includeHistory ? {} : { isLatestVersion: true }),
            },
            order: { vendorName: 'ASC', receivedAt: 'DESC', createdAt: 'DESC' },
        });
    }
    listQuoteInbox(query = {}) {
        return this.quoteIntakeService.listInboundMessages(query);
    }
    triggerQuoteInboxScan() {
        return this.quoteIntakeService.scanNow();
    }
    reprocessQuoteInboxMessage(id) {
        return this.quoteIntakeService.reprocessInboundMessage(id);
    }
    ignoreQuoteInboxMessage(id) {
        return this.quoteIntakeService.ignoreInboundMessage(id);
    }
    linkQuoteInboxMessage(id, dto) {
        return this.quoteIntakeService.linkInboundMessage(id, dto);
    }
    createQuote(dto) {
        return this.quoteRepo.save(this.quoteRepo.create({
            ...dto,
            currency: dto.currency ?? 'USD',
            extractedFields: dto.extractedFields ?? null,
            comparisonFields: null,
            inboundMessageId: null,
            receivedAt: null,
            reviewStatus: 'manual',
            versionNumber: 1,
            isLatestVersion: true,
            extractionConfidence: null,
            reviewedByUserId: null,
            reviewedAt: null,
        }));
    }
    async updateQuote(id, dto, user) {
        const quote = await this.quoteRepo.findOne({ where: { id } });
        if (!quote) {
            throw new common_1.NotFoundException('Quote not found.');
        }
        Object.assign(quote, dto);
        quote.reviewStatus = dto.reviewStatus ?? quote.reviewStatus ?? 'reviewed';
        quote.reviewedByUserId = user.id;
        quote.reviewedAt = new Date();
        return this.quoteRepo.save(quote);
    }
};
exports.ShipmentsService = ShipmentsService;
exports.ShipmentsService = ShipmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(rate_sheet_entity_1.RateSheet, 'business')),
    __param(1, (0, typeorm_1.InjectRepository)(freight_quote_entity_1.FreightQuote)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        quote_intake_service_1.QuoteIntakeService])
], ShipmentsService);
//# sourceMappingURL=shipments.service.js.map