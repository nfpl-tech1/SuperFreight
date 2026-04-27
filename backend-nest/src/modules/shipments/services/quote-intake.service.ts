import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, IsNull, Repository } from 'typeorm';
import { Inquiry } from '../../inquiries/entities/inquiry.entity';
import { OutlookConnection } from '../../outlook/entities/outlook-connection.entity';
import { OutlookService } from '../../outlook/outlook.service';
import { Rfq } from '../../rfqs/entities/rfq.entity';
import { VendorMaster } from '../../vendors/entities/vendor-master.entity';
import { GraphMessageSummary } from '../../outlook/outlook.types';
import { QuoteInboundMessage, QuoteInboundMessageStatus } from '../entities/quote-inbound-message.entity';
import { QuoteIgnoreRule } from '../entities/quote-ignore-rule.entity';
import { QuoteMailboxScanState } from '../entities/quote-mailbox-scan-state.entity';
import { QuoteExtractionService } from './quote-extraction.service';
import { QuoteIgnoreService } from './quote-ignore.service';
import { QuoteMatchingService } from './quote-matching.service';

type ListQuoteInboxFilters = {
  inquiryId?: string;
  rfqId?: string;
  status?: string;
};

@Injectable()
export class QuoteIntakeService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QuoteIntakeService.name);
  private readonly pollIntervalMs: number;
  private readonly overlapSeconds: number;
  private readonly initialLookbackHours: number;
  private readonly batchSize: number;
  private readonly enabled: boolean;
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;
  private schemaReady = false;
  private schemaWarningLogged = false;

  constructor(
    private readonly config: ConfigService,
    private readonly outlookService: OutlookService,
    private readonly quoteExtractionService: QuoteExtractionService,
    private readonly quoteIgnoreService: QuoteIgnoreService,
    private readonly quoteMatchingService: QuoteMatchingService,
    @InjectDataSource()
    private readonly appDataSource: DataSource,
    @InjectRepository(OutlookConnection)
    private readonly connectionRepo: Repository<OutlookConnection>,
    @InjectRepository(QuoteInboundMessage)
    private readonly inboundMessageRepo: Repository<QuoteInboundMessage>,
    @InjectRepository(QuoteIgnoreRule)
    private readonly ignoreRuleRepo: Repository<QuoteIgnoreRule>,
    @InjectRepository(QuoteMailboxScanState)
    private readonly scanStateRepo: Repository<QuoteMailboxScanState>,
    @InjectRepository(Rfq)
    private readonly rfqRepo: Repository<Rfq>,
    @InjectRepository(Inquiry, 'business')
    private readonly inquiryRepo: Repository<Inquiry>,
    @InjectRepository(VendorMaster, 'business')
    private readonly vendorRepo: Repository<VendorMaster>,
  ) {
    this.enabled = this.config.get<boolean>('quoteIntake.enabled') ?? true;
    this.pollIntervalMs =
      this.config.get<number>('quoteIntake.pollIntervalMs') ?? 60_000;
    this.overlapSeconds =
      this.config.get<number>('quoteIntake.overlapSeconds') ?? 120;
    this.initialLookbackHours =
      this.config.get<number>('quoteIntake.initialLookbackHours') ?? 24;
    this.batchSize = this.config.get<number>('quoteIntake.batchSize') ?? 50;
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
      this.logger.error(
        'Initial quote intake scan failed.',
        error instanceof Error ? error.stack : undefined,
      );
    });
    this.timer = setInterval(() => {
      void this.scanNow().catch((error) => {
        this.logger.error(
          'Scheduled quote intake scan failed.',
          error instanceof Error ? error.stack : undefined,
        );
      });
    }, this.pollIntervalMs);
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async listInboundMessages(filters: ListQuoteInboxFilters = {}) {
    await this.assertSchemaReady();
    return this.inboundMessageRepo.find({
      where: {
        ...(filters.inquiryId ? { matchedInquiryId: filters.inquiryId } : {}),
        ...(filters.rfqId ? { matchedRfqId: filters.rfqId } : {}),
        ...(filters.status ? { status: filters.status as QuoteInboundMessageStatus } : {}),
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
    } finally {
      this.isRunning = false;
    }
  }

  async reprocessInboundMessage(inboundMessageId: string) {
    await this.assertSchemaReady();
    const inboundMessage = await this.inboundMessageRepo.findOne({
      where: { id: inboundMessageId },
    });

    if (!inboundMessage) {
      throw new NotFoundException('Inbound quote message not found.');
    }

    inboundMessage.status = QuoteInboundMessageStatus.EXTRACTION_PENDING;
    inboundMessage.failureReason = null;
    await this.inboundMessageRepo.save(inboundMessage);

    return this.processForExtraction(inboundMessage);
  }

  async ignoreInboundMessage(inboundMessageId: string, reason = 'manual_ignore') {
    await this.assertSchemaReady();
    const inboundMessage = await this.inboundMessageRepo.findOne({
      where: { id: inboundMessageId },
    });

    if (!inboundMessage) {
      throw new NotFoundException('Inbound quote message not found.');
    }

    inboundMessage.status = QuoteInboundMessageStatus.IGNORED;
    inboundMessage.ignoreReason = reason;
    inboundMessage.processedAt = new Date();
    return this.inboundMessageRepo.save(inboundMessage);
  }

  async linkInboundMessage(
    inboundMessageId: string,
    input: { rfqId: string; vendorId: string },
  ) {
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
      throw new NotFoundException('Inbound quote message not found.');
    }
    if (!rfq) {
      throw new NotFoundException('RFQ not found.');
    }
    if (!vendor) {
      throw new NotFoundException('Vendor not found.');
    }

    const inquiry = await this.inquiryRepo.findOne({
      where: { id: rfq.inquiryId },
    });
    if (!inquiry) {
      throw new NotFoundException('Inquiry not found for the selected RFQ.');
    }

    inboundMessage.matchedInquiryId = inquiry.id;
    inboundMessage.matchedRfqId = rfq.id;
    inboundMessage.matchedVendorId = vendor.id;
    inboundMessage.status = QuoteInboundMessageStatus.EXTRACTION_PENDING;
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

  private async scanConnectedMailboxes() {
    const connections = await this.connectionRepo.find({
      where: { isConnected: true },
      order: { updatedAt: 'ASC' },
    });

    for (const connection of connections) {
      await this.scanMailbox(connection);
    }
  }

  private async scanMailbox(connection: OutlookConnection) {
    const state = await this.findOrCreateScanState(connection.userId);
    const startedAt = new Date();

    state.lastScanStartedAt = startedAt;
    state.lastScanStatus = 'running';
    state.lastError = null;
    await this.scanStateRepo.save(state);

    try {
      const messages = await this.outlookService.listInboxMessagesForUser(
        connection.userId,
        {
          receivedAfter: this.getScanStartTime(state.lastReceivedAt),
          top: this.batchSize,
        },
      );
      const highestMessage = await this.recordMessagesForMailbox(
        connection,
        messages,
      );

      if (highestMessage) {
        state.lastReceivedAt = new Date(highestMessage.receivedDateTime);
        state.lastMessageId = highestMessage.id;
      }

      state.lastScanStatus = 'completed';
      state.lastScanCompletedAt = new Date();
      state.lastError = null;
    } catch (error) {
      state.lastScanStatus = 'failed';
      state.lastScanCompletedAt = new Date();
      state.lastError =
        error instanceof Error ? error.message : 'Unknown scan failure';
      this.logger.error(
        `Quote intake scan failed for mailbox owner ${connection.userId}`,
        error instanceof Error ? error.stack : undefined,
      );
    }

    await this.scanStateRepo.save(state);
  }

  private async recordMessagesForMailbox(
    connection: OutlookConnection,
    messages: GraphMessageSummary[],
  ) {
    if (messages.length === 0) {
      return null;
    }

    const sortedMessages = messages
      .filter((message) => Boolean(message.id && message.receivedDateTime))
      .sort((left, right) =>
        left.receivedDateTime.localeCompare(right.receivedDateTime),
      );

    const existingMessages = await this.inboundMessageRepo.find({
      where: {
        outlookMessageId: In(sortedMessages.map((message) => message.id)),
      },
      select: {
        outlookMessageId: true,
      },
    });
    const existingIds = new Set(
      existingMessages.map((message) => message.outlookMessageId),
    );
    const ignoreRules = await this.ignoreRuleRepo.find({
      where: [
        { isActive: true, mailboxOwnerUserId: connection.userId },
        { isActive: true, mailboxOwnerUserId: IsNull() },
      ],
      order: { priority: 'ASC', createdAt: 'ASC' },
    });

    let highestMessage: GraphMessageSummary | null = null;

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
      const ignoreReason = this.quoteIgnoreService.getIgnoreReason(
        {
          fromEmail: message.from?.emailAddress?.address ?? null,
          subject: message.subject ?? null,
          bodyPreview: message.bodyPreview ?? null,
          hasAttachments: !!message.hasAttachments,
        },
        {
          mailboxAddress: connection.email,
          rules: ignoreRules,
          isUnmatched,
        },
      );

      const canExtract =
        !!match.matchedInquiryId &&
        !!match.matchedRfqId &&
        !!match.matchedVendorId;
      const status = ignoreReason
        ? QuoteInboundMessageStatus.IGNORED
        : canExtract
          ? QuoteInboundMessageStatus.EXTRACTION_PENDING
          : match.matchedInquiryId
            ? QuoteInboundMessageStatus.NEEDS_REVIEW
            : QuoteInboundMessageStatus.UNMATCHED;

      const storedMessage = await this.inboundMessageRepo.save(
        this.inboundMessageRepo.create({
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
        }),
      );

      await this.processForExtraction(storedMessage);
    }

    return highestMessage;
  }

  private getScanStartTime(lastReceivedAt: Date | null) {
    if (lastReceivedAt) {
      return new Date(lastReceivedAt.getTime() - this.overlapSeconds * 1000);
    }

    return new Date(
      Date.now() - this.initialLookbackHours * 60 * 60 * 1000,
    );
  }

  private async findOrCreateScanState(mailboxOwnerUserId: string) {
    const existingState = await this.scanStateRepo.findOne({
      where: { mailboxOwnerUserId },
    });

    if (existingState) {
      return existingState;
    }

    return this.scanStateRepo.save(
      this.scanStateRepo.create({
        mailboxOwnerUserId,
        lastReceivedAt: null,
        lastMessageId: null,
        lastScanStartedAt: null,
        lastScanCompletedAt: null,
        lastScanStatus: null,
        lastError: null,
      }),
    );
  }

  private async processForExtraction(inboundMessage: QuoteInboundMessage) {
    if (
      inboundMessage.status !== QuoteInboundMessageStatus.EXTRACTION_PENDING ||
      !inboundMessage.matchedRfqId ||
      !inboundMessage.matchedVendorId
    ) {
      return null;
    }

    try {
      return await this.quoteExtractionService.processInboundMessage(
        inboundMessage.id,
      );
    } catch (error) {
      inboundMessage.status = QuoteInboundMessageStatus.FAILED;
      inboundMessage.failureReason =
        error instanceof Error ? error.message : 'Unknown extraction failure';
      inboundMessage.processedAt = new Date();
      await this.inboundMessageRepo.save(inboundMessage);
      this.logger.error(
        `Quote extraction failed for inbound message ${inboundMessage.id}`,
        error instanceof Error ? error.stack : undefined,
      );
      return null;
    }
  }

  private async ensureSchemaReady() {
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
      const tableChecks = await Promise.all(
        requiredTables.map((tableName) => queryRunner.hasTable(tableName)),
      );
      this.schemaReady = tableChecks.every(Boolean);
      return this.schemaReady;
    } finally {
      await queryRunner.release();
    }
  }

  private async assertSchemaReady() {
    if (await this.ensureSchemaReady()) {
      return;
    }

    this.logSchemaNotReadyWarning();
    throw new ServiceUnavailableException(
      'Quote intake tables are not ready. Run the app database migrations first.',
    );
  }

  private logSchemaNotReadyWarning() {
    if (this.schemaWarningLogged) {
      return;
    }

    this.logger.warn(
      'Quote intake schema is not ready. Run `npm run migration:run:app` in backend-nest before using quote inbox scanning.',
    );
    this.schemaWarningLogged = true;
  }
}
