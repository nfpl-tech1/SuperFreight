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
var QuoteExtractionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuoteExtractionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const inquiry_entity_1 = require("../../inquiries/entities/inquiry.entity");
const outlook_service_1 = require("../../outlook/outlook.service");
const rfq_field_spec_entity_1 = require("../../rfqs/entities/rfq-field-spec.entity");
const rfq_entity_1 = require("../../rfqs/entities/rfq.entity");
const freight_quote_entity_1 = require("../entities/freight-quote.entity");
const quote_inbound_message_entity_1 = require("../entities/quote-inbound-message.entity");
const quote_extraction_prompt_1 = require("../prompts/quote-extraction.prompt");
let QuoteExtractionService = QuoteExtractionService_1 = class QuoteExtractionService {
    config;
    outlookService;
    quoteRepo;
    inboundMessageRepo;
    rfqRepo;
    fieldSpecRepo;
    inquiryRepo;
    logger = new common_1.Logger(QuoteExtractionService_1.name);
    endpointBase = 'https://generativelanguage.googleapis.com/v1beta/models';
    apiKey;
    model;
    constructor(config, outlookService, quoteRepo, inboundMessageRepo, rfqRepo, fieldSpecRepo, inquiryRepo) {
        this.config = config;
        this.outlookService = outlookService;
        this.quoteRepo = quoteRepo;
        this.inboundMessageRepo = inboundMessageRepo;
        this.rfqRepo = rfqRepo;
        this.fieldSpecRepo = fieldSpecRepo;
        this.inquiryRepo = inquiryRepo;
        this.apiKey = this.config.get('gemini.apiKey') ?? '';
        this.model = this.config.get('gemini.model') ?? 'gemini-2.5-flash';
    }
    async processInboundMessage(inboundMessageId) {
        const inboundMessage = await this.inboundMessageRepo.findOne({
            where: { id: inboundMessageId },
        });
        if (!inboundMessage) {
            throw new common_1.NotFoundException('Inbound quote message not found.');
        }
        if (!inboundMessage.matchedInquiryId || !inboundMessage.matchedRfqId) {
            inboundMessage.status = quote_inbound_message_entity_1.QuoteInboundMessageStatus.NEEDS_REVIEW;
            inboundMessage.failureReason =
                'Inbound message could not be linked to an inquiry and RFQ for extraction.';
            await this.inboundMessageRepo.save(inboundMessage);
            return null;
        }
        if (!inboundMessage.matchedVendorId) {
            inboundMessage.status = quote_inbound_message_entity_1.QuoteInboundMessageStatus.NEEDS_REVIEW;
            inboundMessage.failureReason =
                'Inbound message matched the inquiry/RFQ but vendor matching needs review.';
            await this.inboundMessageRepo.save(inboundMessage);
            return null;
        }
        if (!this.apiKey) {
            throw new common_1.ServiceUnavailableException('Gemini API key is not configured for quote extraction.');
        }
        const [message, attachments, rfq, fieldSpecs, inquiry] = await Promise.all([
            this.outlookService.getMessageDetailsForUser(inboundMessage.mailboxOwnerUserId, inboundMessage.outlookMessageId),
            this.outlookService.listMessageAttachmentsForUser(inboundMessage.mailboxOwnerUserId, inboundMessage.outlookMessageId),
            this.rfqRepo.findOne({ where: { id: inboundMessage.matchedRfqId } }),
            this.fieldSpecRepo.find({
                where: { rfqId: inboundMessage.matchedRfqId },
                order: { id: 'ASC' },
            }),
            this.inquiryRepo.findOne({
                where: { id: inboundMessage.matchedInquiryId },
            }),
        ]);
        if (!rfq || !inquiry) {
            throw new common_1.NotFoundException('RFQ or inquiry could not be loaded for quote extraction.');
        }
        const extracted = await this.extractQuote({
            attachments,
            fieldSpecs,
            inquiry,
            message,
            rfq,
        });
        const quote = await this.createQuoteVersion({
            extracted,
            inboundMessage,
            rfq,
        });
        inboundMessage.status = quote_inbound_message_entity_1.QuoteInboundMessageStatus.NEEDS_REVIEW;
        inboundMessage.failureReason = null;
        inboundMessage.attachmentMetadata = attachments.map((attachment) => ({
            id: attachment.id,
            name: attachment.name ?? null,
            contentType: attachment.contentType ?? null,
            size: attachment.size ?? null,
            isInline: attachment.isInline ?? false,
            type: attachment['@odata.type'] ?? null,
        }));
        inboundMessage.rawMetadata = {
            ...(inboundMessage.rawMetadata ?? {}),
            extraction: extracted,
            quoteId: quote.id,
        };
        inboundMessage.processedAt = new Date();
        await this.inboundMessageRepo.save(inboundMessage);
        return quote;
    }
    async extractQuote(input) {
        const prompt = (0, quote_extraction_prompt_1.buildQuoteExtractionPrompt)(input);
        const responseSchema = (0, quote_extraction_prompt_1.buildQuoteExtractionResponseSchema)(input.fieldSpecs);
        const payload = {
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: prompt },
                        ...this.buildAttachmentParts(input.attachments),
                    ],
                },
            ],
            generationConfig: {
                responseMimeType: 'application/json',
                responseJsonSchema: responseSchema,
            },
        };
        const response = await fetch(`${this.endpointBase}/${this.model}:generateContent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': this.apiKey,
            },
            body: JSON.stringify(payload),
        });
        const body = (await response.json().catch(() => null));
        if (!response.ok) {
            throw new common_1.ServiceUnavailableException(body?.error?.message || 'Gemini quote extraction failed.');
        }
        const text = body?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!text) {
            throw new common_1.ServiceUnavailableException('Gemini quote extraction returned an empty response.');
        }
        try {
            return JSON.parse(text);
        }
        catch (error) {
            this.logger.error(`Unable to parse Gemini extraction response: ${text}`, error instanceof Error ? error.stack : undefined);
            throw new common_1.ServiceUnavailableException('Gemini quote extraction returned invalid JSON.');
        }
    }
    buildAttachmentParts(attachments) {
        return attachments
            .filter((attachment) => attachment.contentBytes &&
            attachment.contentType &&
            this.supportsInlineAttachment(attachment))
            .map((attachment) => ({
            inline_data: {
                mime_type: attachment.contentType,
                data: attachment.contentBytes,
            },
        }));
    }
    supportsInlineAttachment(attachment) {
        const contentType = attachment.contentType?.toLowerCase() ?? '';
        return (contentType.startsWith('application/pdf') ||
            contentType.startsWith('image/') ||
            contentType.startsWith('text/') ||
            contentType.includes('json') ||
            contentType.includes('xml') ||
            contentType.includes('csv'));
    }
    async createQuoteVersion(input) {
        const previousQuote = await this.quoteRepo.findOne({
            where: {
                inquiryId: input.inboundMessage.matchedInquiryId,
                rfqId: input.inboundMessage.matchedRfqId,
                vendorId: input.inboundMessage.matchedVendorId,
                isLatestVersion: true,
            },
            order: {
                versionNumber: 'DESC',
            },
        });
        if (previousQuote) {
            previousQuote.isLatestVersion = false;
            await this.quoteRepo.save(previousQuote);
        }
        const nextVersionNumber = (previousQuote?.versionNumber ?? 0) + 1;
        const quote = this.quoteRepo.create({
            inquiryId: input.inboundMessage.matchedInquiryId,
            rfqId: input.inboundMessage.matchedRfqId,
            vendorId: input.inboundMessage.matchedVendorId,
            vendorName: previousQuote?.vendorName ||
                input.inboundMessage.fromName ||
                input.inboundMessage.fromEmail ||
                'Unknown Vendor',
            currency: input.extracted.currency ?? previousQuote?.currency ?? 'USD',
            totalRate: input.extracted.totalRate,
            freightRate: input.extracted.freightRate,
            localCharges: input.extracted.localCharges,
            documentation: input.extracted.documentation,
            transitDays: input.extracted.transitDays,
            validUntil: input.extracted.validUntil,
            sourceThreadRefId: null,
            inboundMessageId: input.inboundMessage.id,
            receivedAt: input.inboundMessage.receivedAt,
            extractedFields: input.extracted.comparisonFields,
            comparisonFields: input.extracted.comparisonFields,
            quotePromptSnapshot: {
                rfqPromptTemplateMeta: input.rfq.promptTemplateMeta ?? null,
                inboundMessageId: input.inboundMessage.id,
            },
            reviewStatus: 'needs_review',
            versionNumber: nextVersionNumber,
            isLatestVersion: true,
            extractionConfidence: input.extracted.confidence,
            reviewedByUserId: null,
            reviewedAt: null,
            remarks: input.extracted.remarks,
            isSelected: false,
        });
        return this.quoteRepo.save(quote);
    }
};
exports.QuoteExtractionService = QuoteExtractionService;
exports.QuoteExtractionService = QuoteExtractionService = QuoteExtractionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(freight_quote_entity_1.FreightQuote)),
    __param(3, (0, typeorm_1.InjectRepository)(quote_inbound_message_entity_1.QuoteInboundMessage)),
    __param(4, (0, typeorm_1.InjectRepository)(rfq_entity_1.Rfq)),
    __param(5, (0, typeorm_1.InjectRepository)(rfq_field_spec_entity_1.RfqFieldSpec)),
    __param(6, (0, typeorm_1.InjectRepository)(inquiry_entity_1.Inquiry, 'business')),
    __metadata("design:paramtypes", [config_1.ConfigService,
        outlook_service_1.OutlookService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], QuoteExtractionService);
//# sourceMappingURL=quote-extraction.service.js.map