import { Repository } from 'typeorm';
import { CreateFreightQuoteDto } from './dto/create-freight-quote.dto';
import { LinkQuoteInboxMessageDto } from './dto/link-quote-inbox-message.dto';
import { ListQuoteInboxDto } from './dto/list-quote-inbox.dto';
import { ListQuotesDto } from './dto/list-quotes.dto';
import { UpdateFreightQuoteDto } from './dto/update-freight-quote.dto';
import { FreightQuote } from './entities/freight-quote.entity';
import { RateSheet } from './entities/rate-sheet.entity';
import { UpsertRateSheetDto } from './dto/upsert-rate-sheet.dto';
import { QuoteIntakeService } from './services/quote-intake.service';
import { User } from '../users/entities/user.entity';
export declare class ShipmentsService {
    private readonly rateSheetRepo;
    private readonly quoteRepo;
    private readonly quoteIntakeService;
    constructor(rateSheetRepo: Repository<RateSheet>, quoteRepo: Repository<FreightQuote>, quoteIntakeService: QuoteIntakeService);
    listRateSheets(): Promise<RateSheet[]>;
    createRateSheet(dto: UpsertRateSheetDto): Promise<RateSheet>;
    listQuotes(query?: ListQuotesDto): Promise<FreightQuote[]>;
    listQuoteInbox(query?: ListQuoteInboxDto): Promise<import("./entities/quote-inbound-message.entity").QuoteInboundMessage[]>;
    triggerQuoteInboxScan(): Promise<{
        started: boolean;
        reason: string;
    } | {
        started: boolean;
        reason?: undefined;
    }>;
    reprocessQuoteInboxMessage(id: string): Promise<FreightQuote | null>;
    ignoreQuoteInboxMessage(id: string): Promise<import("./entities/quote-inbound-message.entity").QuoteInboundMessage>;
    linkQuoteInboxMessage(id: string, dto: LinkQuoteInboxMessageDto): Promise<FreightQuote | null>;
    createQuote(dto: CreateFreightQuoteDto): Promise<FreightQuote>;
    updateQuote(id: string, dto: UpdateFreightQuoteDto, user: User): Promise<FreightQuote>;
}
