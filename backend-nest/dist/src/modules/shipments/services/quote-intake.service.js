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
var QuoteIntakeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuoteIntakeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const inquiry_entity_1 = require("../../inquiries/entities/inquiry.entity");
const outlook_connection_entity_1 = require("../../outlook/entities/outlook-connection.entity");
const outlook_service_1 = require("../../outlook/outlook.service");
const rfq_entity_1 = require("../../rfqs/entities/rfq.entity");
const vendor_master_entity_1 = require("../../vendors/entities/vendor-master.entity");
const quote_inbound_message_entity_1 = require("../entities/quote-inbound-message.entity");
const quote_ignore_rule_entity_1 = require("../entities/quote-ignore-rule.entity");
const quote_mailbox_scan_state_entity_1 = require("../entities/quote-mailbox-scan-state.entity");
const quote_extraction_service_1 = require("./quote-extraction.service");
const quote_ignore_service_1 = require("./quote-ignore.service");
const quote_matching_service_1 = require("./quote-matching.service");
let QuoteIntakeService = QuoteIntakeService_1 = class QuoteIntakeService {
    config;
    outlookService;
    quoteExtractionService;
    quoteIgnoreService;
    quoteMatchingService;
    appDataSource;
    connectionRepo;
    inboundMessageRepo;
    ignoreRuleRepo;
    scanStateRepo;
    rfqRepo;
    inquiryRepo;
    vendorRepo;
    logger = new common_1.Logger(QuoteIntakeService_1.name);
    pollIntervalMs;
    overlapSeconds;
    initialLookbackHours;
    batchSize;
    enabled;
    timer = null;
    isRunning = false;
    schemaReady = false;
    schemaWarningLogged = false;
    constructor(config, outlookService, quoteExtractionService, quoteIgnoreService, quoteMatchingService, appDataSource, connectionRepo, inboundMessageRepo, ignoreRuleRepo, scanStateRepo, rfqRepo, inquiryRepo, vendorRepo) {
        this.config = config;
        this.outlookService = outlookService;
        this.quoteExtractionService = quoteExtractionService;
        this.quoteIgnoreService = quoteIgnoreService;
        this.quoteMatchingService = quoteMatchingService;
        this.appDataSource = appDataSource;
        this.connectionRepo = connectionRepo;
        this.inboundMessageRepo = inboundMessageRepo;
        this.ignoreRuleRepo = ignoreRuleRepo;
        this.scanStateRepo = scanStateRepo;
        this.rfqRepo = rfqRepo;
        this.inquiryRepo = inquiryRepo;
        this.vendorRepo = vendorRepo;
        this.enabled = this.config.get('quoteIntake.enabled') ?? true;
        this.pollIntervalMs =
            this.config.get('quoteIntake.pollIntervalMs') ?? 60_000;
        this.overlapSeconds =
            this.config.get('quoteIntake.overlapSeconds') ?? 120;
        this.initialLookbackHours =
            this.config.get('quoteIntake.initialLookbackHours') ?? 24;
        this.batchSize = this.config.get('quoteIntake.batchSize') ?? 50;
    }
    async onModuleInit() {
        if (!this.enabled) {
            this.logger.log('Quote intake scheduler is disabled.');
            return;
        }
        this.schemaReady = await this.ensureSchemaReady();
        if (!this.schemaReady) {
            this.logSchemaNotReadyWarning();
            return;
        }
        void this.scanNow().catch((error) => {
            this.logger.error('Initial quote intake scan failed.', error instanceof Error ? error.stack : undefined);
        });
        this.timer = setInterval(() => {
            void this.scanNow().catch((error) => {
                this.logger.error('Scheduled quote intake scan failed.', error instanceof Error ? error.stack : undefined);
            });
        }, this.pollIntervalMs);
    }
    onModuleDestroy() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    async listInboundMessages(filters = {}) {
        await this.assertSchemaReady();
        return this.inboundMessageRepo.find({
            where: {
                ...(filters.inquiryId ? { matchedInquiryId: filters.inquiryId } : {}),
                ...(filters.rfqId ? { matchedRfqId: filters.rfqId } : {}),
                ...(filters.status ? { status: filters.status } : {}),
            },
            order: {
                receivedAt: 'DESC',
            },
        });
    }
    async scanNow() {
        if (!(await this.ensureSchemaReady())) {
            this.logSchemaNotReadyWarning();
            return { started: false, reason: 'schema_not_ready' };
        }
        if (this.isRunning) {
            return { started: false, reason: 'scan_already_running' };
        }
        this.isRunning = true;
        try {
            await this.scanConnectedMailboxes();
            return { started: true };
        }
        finally {
            this.isRunning = false;
        }
    }
    async reprocessInboundMessage(inboundMessageId) {
        await this.assertSchemaReady();
        const inboundMessage = await this.inboundMessageRepo.findOne({
            where: { id: inboundMessageId },
        });
        if (!inboundMessage) {
            throw new common_1.NotFoundException('Inbound quote message not found.');
        }
        inboundMessage.status = quote_inbound_message_entity_1.QuoteInboundMessageStatus.EXTRACTION_PENDING;
        inboundMessage.failureReason = null;
        await this.inboundMessageRepo.save(inboundMessage);
        return this.processForExtraction(inboundMessage);
    }
    async ignoreInboundMessage(inboundMessageId, reason = 'manual_ignore') {
        await this.assertSchemaReady();
        const inboundMessage = await this.inboundMessageRepo.findOne({
            where: { id: inboundMessageId },
        });
        if (!inboundMessage) {
            throw new common_1.NotFoundException('Inbound quote message not found.');
        }
        inboundMessage.status = quote_inbound_message_entity_1.QuoteInboundMessageStatus.IGNORED;
        inboundMessage.ignoreReason = reason;
        inboundMessage.processedAt = new Date();
        return this.inboundMessageRepo.save(inboundMessage);
    }
    async linkInboundMessage(inboundMessageId, input) {
        await this.assertSchemaReady();
        const [inboundMessage, rfq, vendor] = await Promise.all([
            this.inboundMessageRepo.findOne({
                where: { id: inboundMessageId },
            }),
            this.rfqRepo.findOne({
                where: { id: input.rfqId },
            }),
            this.vendorRepo.findOne({
                where: { id: input.vendorId },
            }),
        ]);
        if (!inboundMessage) {
            throw new common_1.NotFoundException('Inbound quote message not found.');
        }
        if (!rfq) {
            throw new common_1.NotFoundException('RFQ not found.');
        }
        if (!vendor) {
            throw new common_1.NotFoundException('Vendor not found.');
        }
        const inquiry = await this.inquiryRepo.findOne({
            where: { id: rfq.inquiryId },
        });
        if (!inquiry) {
            throw new common_1.NotFoundException('Inquiry not found for the selected RFQ.');
        }
        inboundMessage.matchedInquiryId = inquiry.id;
        inboundMessage.matchedRfqId = rfq.id;
        inboundMessage.matchedVendorId = vendor.id;
        inboundMessage.status = quote_inbound_message_entity_1.QuoteInboundMessageStatus.EXTRACTION_PENDING;
        inboundMessage.ignoreReason = null;
        inboundMessage.failureReason = null;
        inboundMessage.rawMetadata = {
            ...(inboundMessage.rawMetadata ?? {}),
            inquiryNumber: inquiry.inquiryNumber,
            manuallyLinked: true,
            manualLinkRfqId: rfq.id,
            manualLinkVendorId: vendor.id,
            manualLinkVendorName: vendor.companyName,
        };
        await this.inboundMessageRepo.save(inboundMessage);
        return this.processForExtraction(inboundMessage);
    }
    async scanConnectedMailboxes() {
        const connections = await this.connectionRepo.find({
            where: { isConnected: true },
            order: { updatedAt: 'ASC' },
        });
        for (const connection of connections) {
            await this.scanMailbox(connection);
        }
    }
    async scanMailbox(connection) {
        const state = await this.findOrCreateScanState(connection.userId);
        const startedAt = new Date();
        state.lastScanStartedAt = startedAt;
        state.lastScanStatus = 'running';
        state.lastError = null;
        await this.scanStateRepo.save(state);
        try {
            const messages = await this.outlookService.listInboxMessagesForUser(connection.userId, {
                receivedAfter: this.getScanStartTime(state.lastReceivedAt),
                top: this.batchSize,
            });
            const highestMessage = await this.recordMessagesForMailbox(connection, messages);
            if (highestMessage) {
                state.lastReceivedAt = new Date(highestMessage.receivedDateTime);
                state.lastMessageId = highestMessage.id;
            }
            state.lastScanStatus = 'completed';
            state.lastScanCompletedAt = new Date();
            state.lastError = null;
        }
        catch (error) {
            state.lastScanStatus = 'failed';
            state.lastScanCompletedAt = new Date();
            state.lastError =
                error instanceof Error ? error.message : 'Unknown scan failure';
            this.logger.error(`Quote intake scan failed for mailbox owner ${connection.userId}`, error instanceof Error ? error.stack : undefined);
        }
        await this.scanStateRepo.save(state);
    }
    async recordMessagesForMailbox(connection, messages) {
        if (messages.length === 0) {
            return null;
        }
        const sortedMessages = messages
            .filter((message) => Boolean(message.id && message.receivedDateTime))
            .sort((left, right) => left.receivedDateTime.localeCompare(right.receivedDateTime));
        const existingMessages = await this.inboundMessageRepo.find({
            where: {
                outlookMessageId: (0, typeorm_2.In)(sortedMessages.map((message) => message.id)),
            },
            select: {
                outlookMessageId: true,
            },
        });
        const existingIds = new Set(existingMessages.map((message) => message.outlookMessageId));
        const ignoreRules = await this.ignoreRuleRepo.find({
            where: [
                { isActive: true, mailboxOwnerUserId: connection.userId },
                { isActive: true, mailboxOwnerUserId: (0, typeorm_2.IsNull)() },
            ],
            order: { priority: 'ASC', createdAt: 'ASC' },
        });
        let highestMessage = null;
        for (const message of sortedMessages) {
            highestMessage = message;
            if (existingIds.has(message.id)) {
                continue;
            }
            const match = await this.quoteMatchingService.matchMessage({
                fromEmail: message.from?.emailAddress?.address ?? null,
                subject: message.subject ?? null,
            });
            const isUnmatched = !match.matchedInquiryId;
            const ignoreReason = this.quoteIgnoreService.getIgnoreReason({
                fromEmail: message.from?.emailAddress?.address ?? null,
                subject: message.subject ?? null,
                bodyPreview: message.bodyPreview ?? null,
                hasAttachments: !!message.hasAttachments,
            }, {
                mailboxAddress: connection.email,
                rules: ignoreRules,
                isUnmatched,
            });
            const canExtract = !!match.matchedInquiryId &&
                !!match.matchedRfqId &&
                !!match.matchedVendorId;
            const status = ignoreReason
                ? quote_inbound_message_entity_1.QuoteInboundMessageStatus.IGNORED
                : canExtract
                    ? quote_inbound_message_entity_1.QuoteInboundMessageStatus.EXTRACTION_PENDING
                    : match.matchedInquiryId
                        ? quote_inbound_message_entity_1.QuoteInboundMessageStatus.NEEDS_REVIEW
                        : quote_inbound_message_entity_1.QuoteInboundMessageStatus.UNMATCHED;
            const storedMessage = await this.inboundMessageRepo.save(this.inboundMessageRepo.create({
                mailboxOwnerUserId: connection.userId,
                outlookMessageId: message.id,
                internetMessageId: message.internetMessageId ?? null,
                conversationId: message.conversationId ?? null,
                receivedAt: new Date(message.receivedDateTime),
                fromEmail: message.from?.emailAddress?.address ?? null,
                fromName: message.from?.emailAddress?.name ?? null,
                subject: message.subject ?? null,
                bodyPreview: message.bodyPreview ?? null,
                webLink: message.webLink ?? null,
                hasAttachments: !!message.hasAttachments,
                matchedInquiryId: match.matchedInquiryId,
                matchedRfqId: match.matchedRfqId,
                matchedVendorId: match.matchedVendorId,
                status,
                ignoreReason,
                failureReason: null,
                rawMetadata: {
                    inquiryNumber: match.inquiryNumber,
                    matchConfidence: match.matchConfidence,
                    matchReason: match.matchReason,
                    matchedBy: match.matchedBy,
                    suggestedVendorIds: match.suggestedVendorIds,
                    suggestedRfqIds: match.suggestedRfqIds,
                },
                attachmentMetadata: null,
                processedAt: new Date(),
            }));
            await this.processForExtraction(storedMessage);
        }
        return highestMessage;
    }
    getScanStartTime(lastReceivedAt) {
        if (lastReceivedAt) {
            return new Date(lastReceivedAt.getTime() - this.overlapSeconds * 1000);
        }
        return new Date(Date.now() - this.initialLookbackHours * 60 * 60 * 1000);
    }
    async findOrCreateScanState(mailboxOwnerUserId) {
        const existingState = await this.scanStateRepo.findOne({
            where: { mailboxOwnerUserId },
        });
        if (existingState) {
            return existingState;
        }
        return this.scanStateRepo.save(this.scanStateRepo.create({
            mailboxOwnerUserId,
            lastReceivedAt: null,
            lastMessageId: null,
            lastScanStartedAt: null,
            lastScanCompletedAt: null,
            lastScanStatus: null,
            lastError: null,
        }));
    }
    async processForExtraction(inboundMessage) {
        if (inboundMessage.status !== quote_inbound_message_entity_1.QuoteInboundMessageStatus.EXTRACTION_PENDING ||
            !inboundMessage.matchedRfqId ||
            !inboundMessage.matchedVendorId) {
            return null;
        }
        try {
            return await this.quoteExtractionService.processInboundMessage(inboundMessage.id);
        }
        catch (error) {
            inboundMessage.status = quote_inbound_message_entity_1.QuoteInboundMessageStatus.FAILED;
            inboundMessage.failureReason =
                error instanceof Error ? error.message : 'Unknown extraction failure';
            inboundMessage.processedAt = new Date();
            await this.inboundMessageRepo.save(inboundMessage);
            this.logger.error(`Quote extraction failed for inbound message ${inboundMessage.id}`, error instanceof Error ? error.stack : undefined);
            return null;
        }
    }
    async ensureSchemaReady() {
        if (this.schemaReady) {
            return true;
        }
        const queryRunner = this.appDataSource.createQueryRunner();
        try {
            const requiredTables = [
                'quote_mailbox_scan_states',
                'quote_inbound_messages',
                'quote_ignore_rules',
            ];
            const tableChecks = await Promise.all(requiredTables.map((tableName) => queryRunner.hasTable(tableName)));
            this.schemaReady = tableChecks.every(Boolean);
            return this.schemaReady;
        }
        finally {
            await queryRunner.release();
        }
    }
    async assertSchemaReady() {
        if (await this.ensureSchemaReady()) {
            return;
        }
        this.logSchemaNotReadyWarning();
        throw new common_1.ServiceUnavailableException('Quote intake tables are not ready. Run the app database migrations first.');
    }
    logSchemaNotReadyWarning() {
        if (this.schemaWarningLogged) {
            return;
        }
        this.logger.warn('Quote intake schema is not ready. Run `npm run migration:run:app` in backend-nest before using quote inbox scanning.');
        this.schemaWarningLogged = true;
    }
};
exports.QuoteIntakeService = QuoteIntakeService;
exports.QuoteIntakeService = QuoteIntakeService = QuoteIntakeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(5, (0, typeorm_1.InjectDataSource)()),
    __param(6, (0, typeorm_1.InjectRepository)(outlook_connection_entity_1.OutlookConnection)),
    __param(7, (0, typeorm_1.InjectRepository)(quote_inbound_message_entity_1.QuoteInboundMessage)),
    __param(8, (0, typeorm_1.InjectRepository)(quote_ignore_rule_entity_1.QuoteIgnoreRule)),
    __param(9, (0, typeorm_1.InjectRepository)(quote_mailbox_scan_state_entity_1.QuoteMailboxScanState)),
    __param(10, (0, typeorm_1.InjectRepository)(rfq_entity_1.Rfq)),
    __param(11, (0, typeorm_1.InjectRepository)(inquiry_entity_1.Inquiry, 'business')),
    __param(12, (0, typeorm_1.InjectRepository)(vendor_master_entity_1.VendorMaster, 'business')),
    __metadata("design:paramtypes", [config_1.ConfigService,
        outlook_service_1.OutlookService,
        quote_extraction_service_1.QuoteExtractionService,
        quote_ignore_service_1.QuoteIgnoreService,
        quote_matching_service_1.QuoteMatchingService,
        typeorm_2.DataSource,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], QuoteIntakeService);
//# sourceMappingURL=quote-intake.service.js.map