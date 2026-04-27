import { User } from '../users/entities/user.entity';
import { CreateFreightQuoteDto } from './dto/create-freight-quote.dto';
import { LinkQuoteInboxMessageDto } from './dto/link-quote-inbox-message.dto';
import { ListQuoteInboxDto } from './dto/list-quote-inbox.dto';
import { ListQuotesDto } from './dto/list-quotes.dto';
import { UpdateFreightQuoteDto } from './dto/update-freight-quote.dto';
import { UpsertRateSheetDto } from './dto/upsert-rate-sheet.dto';
import { ShipmentsService } from './shipments.service';
export declare class ShipmentsController {
    private readonly shipmentsService;
    constructor(shipmentsService: ShipmentsService);
    listRateSheets(): Promise<import("./entities/rate-sheet.entity").RateSheet[]>;
    createRateSheet(dto: UpsertRateSheetDto): Promise<import("./entities/rate-sheet.entity").RateSheet>;
    listQuotes(query: ListQuotesDto): Promise<import("./entities/freight-quote.entity").FreightQuote[]>;
    listQuoteInbox(query: ListQuoteInboxDto): Promise<import("./entities/quote-inbound-message.entity").QuoteInboundMessage[]>;
    triggerQuoteInboxScan(): Promise<{
        started: boolean;
        reason: string;
    } | {
        started: boolean;
        reason?: undefined;
    }>;
    reprocessQuoteInboxMessage(id: string): Promise<import("./entities/freight-quote.entity").FreightQuote | null>;
    ignoreQuoteInboxMessage(id: string): Promise<import("./entities/quote-inbound-message.entity").QuoteInboundMessage>;
    linkQuoteInboxMessage(id: string, dto: LinkQuoteInboxMessageDto): Promise<import("./entities/freight-quote.entity").FreightQuote | null>;
    createQuote(dto: CreateFreightQuoteDto): Promise<import("./entities/freight-quote.entity").FreightQuote>;
    updateQuote(id: string, dto: UpdateFreightQuoteDto, user: User): Promise<import("./entities/freight-quote.entity").FreightQuote>;
}
