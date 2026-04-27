import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Inquiry } from '../../inquiries/entities/inquiry.entity';
import { OutlookService } from '../../outlook/outlook.service';
import { RfqFieldSpec } from '../../rfqs/entities/rfq-field-spec.entity';
import { Rfq } from '../../rfqs/entities/rfq.entity';
import { FreightQuote } from '../entities/freight-quote.entity';
import { QuoteInboundMessage } from '../entities/quote-inbound-message.entity';
export declare class QuoteExtractionService {
    private readonly config;
    private readonly outlookService;
    private readonly quoteRepo;
    private readonly inboundMessageRepo;
    private readonly rfqRepo;
    private readonly fieldSpecRepo;
    private readonly inquiryRepo;
    private readonly logger;
    private readonly endpointBase;
    private readonly apiKey;
    private readonly model;
    constructor(config: ConfigService, outlookService: OutlookService, quoteRepo: Repository<FreightQuote>, inboundMessageRepo: Repository<QuoteInboundMessage>, rfqRepo: Repository<Rfq>, fieldSpecRepo: Repository<RfqFieldSpec>, inquiryRepo: Repository<Inquiry>);
    processInboundMessage(inboundMessageId: string): Promise<FreightQuote | null>;
    private extractQuote;
    private buildAttachmentParts;
    private supportsInlineAttachment;
    private createQuoteVersion;
}
