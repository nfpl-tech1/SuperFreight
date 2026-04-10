import { CreateFreightQuoteDto } from './dto/create-freight-quote.dto';
import { UpsertRateSheetDto } from './dto/upsert-rate-sheet.dto';
import { ShipmentsService } from './shipments.service';
export declare class ShipmentsController {
    private readonly shipmentsService;
    constructor(shipmentsService: ShipmentsService);
    listRateSheets(): Promise<import("./entities/rate-sheet.entity").RateSheet[]>;
    createRateSheet(dto: UpsertRateSheetDto): Promise<import("./entities/rate-sheet.entity").RateSheet>;
    listQuotes(inquiryId?: string): Promise<import("./entities/freight-quote.entity").FreightQuote[]>;
    createQuote(dto: CreateFreightQuoteDto): Promise<import("./entities/freight-quote.entity").FreightQuote>;
}
