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
exports.CustomerQuotesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_draft_entity_1 = require("./entities/customer-draft.entity");
const freight_quote_entity_1 = require("../shipments/entities/freight-quote.entity");
const inquiry_entity_1 = require("../inquiries/entities/inquiry.entity");
const DEFAULT_MARGIN_PERCENT = 10;
const DEFAULT_CURRENCY = 'USD';
const UNKNOWN_VALUE_LABEL = 'TBC';
const DEFAULT_SHIPMENT_MODE = 'FREIGHT';
let CustomerQuotesService = class CustomerQuotesService {
    draftRepo;
    quoteRepo;
    inquiryRepo;
    constructor(draftRepo, quoteRepo, inquiryRepo) {
        this.draftRepo = draftRepo;
        this.quoteRepo = quoteRepo;
        this.inquiryRepo = inquiryRepo;
    }
    list() {
        return this.draftRepo.find({ order: { createdAt: 'DESC' } });
    }
    async generate(dto, user) {
        const { quote, inquiry } = await this.loadDraftContextOrThrow(dto);
        const marginPercent = this.resolveMarginPercent(dto);
        const sellRate = this.calculateSellRate(quote, marginPercent);
        const draftBody = this.buildDraftBody(inquiry, quote, sellRate);
        return this.draftRepo.save(this.draftRepo.create({
            inquiryId: dto.inquiryId,
            quoteId: dto.quoteId,
            generatedByUserId: user.id,
            marginPercent,
            subjectLine: this.buildSubjectLine(inquiry),
            draftBody,
            isSelected: true,
        }));
    }
    async loadDraftContextOrThrow(dto) {
        const [quote, inquiry] = await Promise.all([
            this.quoteRepo.findOne({ where: { id: dto.quoteId } }),
            this.inquiryRepo.findOne({
                where: { id: dto.inquiryId },
            }),
        ]);
        if (!quote || !inquiry) {
            throw new common_1.NotFoundException('Inquiry or quote not found');
        }
        return { quote, inquiry };
    }
    resolveMarginPercent(dto) {
        return dto.marginPercent ?? DEFAULT_MARGIN_PERCENT;
    }
    calculateSellRate(quote, marginPercent) {
        const baseRate = Number(quote.totalRate ?? 0);
        return Math.round(baseRate * (1 + marginPercent / 100));
    }
    buildSubjectLine(inquiry) {
        return `Quotation for ${inquiry.inquiryNumber}`;
    }
    buildDraftBody(inquiry, quote, sellRate) {
        return [
            'Dear Customer,',
            '',
            `Thank you for your inquiry ${inquiry.inquiryNumber}.`,
            '',
            `Trade Lane: ${this.formatTradeLane(inquiry)}`,
            `Mode: ${inquiry.shipmentMode ?? DEFAULT_SHIPMENT_MODE}`,
            `Cargo: ${inquiry.cargoSummary ?? UNKNOWN_VALUE_LABEL}`,
            '',
            `Our offer: ${sellRate} ${quote.currency ?? DEFAULT_CURRENCY}`,
            `Transit: ${quote.transitDays ?? UNKNOWN_VALUE_LABEL} days`,
            `Validity: ${quote.validUntil ?? UNKNOWN_VALUE_LABEL}`,
            '',
            'Best regards,',
            'Nagarkot Forwarders Pvt. Ltd.',
        ].join('\n');
    }
    formatTradeLane(inquiry) {
        return `${inquiry.origin ?? UNKNOWN_VALUE_LABEL} -> ${inquiry.destination ?? UNKNOWN_VALUE_LABEL}`;
    }
};
exports.CustomerQuotesService = CustomerQuotesService;
exports.CustomerQuotesService = CustomerQuotesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_draft_entity_1.CustomerDraft)),
    __param(1, (0, typeorm_1.InjectRepository)(freight_quote_entity_1.FreightQuote)),
    __param(2, (0, typeorm_1.InjectRepository)(inquiry_entity_1.Inquiry, 'business')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CustomerQuotesService);
//# sourceMappingURL=customer-quotes.service.js.map