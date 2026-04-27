import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inquiry } from '../../inquiries/entities/inquiry.entity';
import { OutlookService } from '../../outlook/outlook.service';
import {
  GraphMessageAttachment,
  GraphMessageDetail,
} from '../../outlook/outlook.types';
import { RfqFieldSpec } from '../../rfqs/entities/rfq-field-spec.entity';
import { Rfq } from '../../rfqs/entities/rfq.entity';
import { FreightQuote } from '../entities/freight-quote.entity';
import {
  QuoteInboundMessage,
  QuoteInboundMessageStatus,
} from '../entities/quote-inbound-message.entity';
import {
  buildQuoteExtractionPrompt,
  buildQuoteExtractionResponseSchema,
} from '../prompts/quote-extraction.prompt';

type GeminiExtractionPayload = {
  currency: string | null;
  totalRate: number | null;
  freightRate: number | null;
  localCharges: number | null;
  documentation: number | null;
  transitDays: number | null;
  validUntil: string | null;
  remarks: string | null;
  confidence: number | null;
  comparisonFields: Record<string, unknown>;
};

@Injectable()
export class QuoteExtractionService {
  private readonly logger = new Logger(QuoteExtractionService.name);
  private readonly endpointBase =
    'https://generativelanguage.googleapis.com/v1beta/models';
  private readonly apiKey: string;
  private readonly model: string;

  constructor(
    private readonly config: ConfigService,
    private readonly outlookService: OutlookService,
    @InjectRepository(FreightQuote)
    private readonly quoteRepo: Repository<FreightQuote>,
    @InjectRepository(QuoteInboundMessage)
    private readonly inboundMessageRepo: Repository<QuoteInboundMessage>,
    @InjectRepository(Rfq)
    private readonly rfqRepo: Repository<Rfq>,
    @InjectRepository(RfqFieldSpec)
    private readonly fieldSpecRepo: Repository<RfqFieldSpec>,
    @InjectRepository(Inquiry, 'business')
    private readonly inquiryRepo: Repository<Inquiry>,
  ) {
    this.apiKey = this.config.get<string>('gemini.apiKey') ?? '';
    this.model = this.config.get<string>('gemini.model') ?? 'gemini-2.5-flash';
  }

  async processInboundMessage(inboundMessageId: string) {
    const inboundMessage = await this.inboundMessageRepo.findOne({
      where: { id: inboundMessageId },
    });

    if (!inboundMessage) {
      throw new NotFoundException('Inbound quote message not found.');
    }

    if (!inboundMessage.matchedInquiryId || !inboundMessage.matchedRfqId) {
      inboundMessage.status = QuoteInboundMessageStatus.NEEDS_REVIEW;
      inboundMessage.failureReason =
        'Inbound message could not be linked to an inquiry and RFQ for extraction.';
      await this.inboundMessageRepo.save(inboundMessage);
      return null;
    }

    if (!inboundMessage.matchedVendorId) {
      inboundMessage.status = QuoteInboundMessageStatus.NEEDS_REVIEW;
      inboundMessage.failureReason =
        'Inbound message matched the inquiry/RFQ but vendor matching needs review.';
      await this.inboundMessageRepo.save(inboundMessage);
      return null;
    }

    if (!this.apiKey) {
      throw new ServiceUnavailableException(
        'Gemini API key is not configured for quote extraction.',
      );
    }

    const [message, attachments, rfq, fieldSpecs, inquiry] = await Promise.all([
      this.outlookService.getMessageDetailsForUser(
        inboundMessage.mailboxOwnerUserId,
        inboundMessage.outlookMessageId,
      ),
      this.outlookService.listMessageAttachmentsForUser(
        inboundMessage.mailboxOwnerUserId,
        inboundMessage.outlookMessageId,
      ),
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
      throw new NotFoundException(
        'RFQ or inquiry could not be loaded for quote extraction.',
      );
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

    inboundMessage.status = QuoteInboundMessageStatus.NEEDS_REVIEW;
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

  private async extractQuote(input: {
    attachments: GraphMessageAttachment[];
    fieldSpecs: RfqFieldSpec[];
    inquiry: Inquiry;
    message: GraphMessageDetail;
    rfq: Rfq;
  }) {
    const prompt = buildQuoteExtractionPrompt(input);
    const responseSchema = buildQuoteExtractionResponseSchema(input.fieldSpecs);
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

    const response = await fetch(
      `${this.endpointBase}/${this.model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey,
        },
        body: JSON.stringify(payload),
      },
    );

    const body = (await response.json().catch(() => null)) as
      | {
          candidates?: Array<{
            content?: {
              parts?: Array<{
                text?: string;
              }>;
            };
          }>;
          error?: {
            message?: string;
          };
        }
      | null;

    if (!response.ok) {
      throw new ServiceUnavailableException(
        body?.error?.message || 'Gemini quote extraction failed.',
      );
    }

    const text = body?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) {
      throw new ServiceUnavailableException(
        'Gemini quote extraction returned an empty response.',
      );
    }

    try {
      return JSON.parse(text) as GeminiExtractionPayload;
    } catch (error) {
      this.logger.error(
        `Unable to parse Gemini extraction response: ${text}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new ServiceUnavailableException(
        'Gemini quote extraction returned invalid JSON.',
      );
    }
  }

  private buildAttachmentParts(attachments: GraphMessageAttachment[]) {
    return attachments
      .filter(
        (attachment) =>
          attachment.contentBytes &&
          attachment.contentType &&
          this.supportsInlineAttachment(attachment),
      )
      .map((attachment) => ({
        inline_data: {
          mime_type: attachment.contentType!,
          data: attachment.contentBytes!,
        },
      }));
  }

  private supportsInlineAttachment(attachment: GraphMessageAttachment) {
    const contentType = attachment.contentType?.toLowerCase() ?? '';
    return (
      contentType.startsWith('application/pdf') ||
      contentType.startsWith('image/') ||
      contentType.startsWith('text/') ||
      contentType.includes('json') ||
      contentType.includes('xml') ||
      contentType.includes('csv')
    );
  }

  private async createQuoteVersion(input: {
    extracted: GeminiExtractionPayload;
    inboundMessage: QuoteInboundMessage;
    rfq: Rfq;
  }) {
    const previousQuote = await this.quoteRepo.findOne({
      where: {
        inquiryId: input.inboundMessage.matchedInquiryId!,
        rfqId: input.inboundMessage.matchedRfqId!,
        vendorId: input.inboundMessage.matchedVendorId!,
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
      inquiryId: input.inboundMessage.matchedInquiryId!,
      rfqId: input.inboundMessage.matchedRfqId!,
      vendorId: input.inboundMessage.matchedVendorId!,
      vendorName:
        previousQuote?.vendorName ||
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
}
