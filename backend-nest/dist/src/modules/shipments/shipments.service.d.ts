import { Repository } from 'typeorm';
import { CreateFreightQuoteDto } from './dto/create-freight-quote.dto';
import { FreightQuote } from './entities/freight-quote.entity';
import { RateSheet } from './entities/rate-sheet.entity';
import { UpsertRateSheetDto } from './dto/upsert-rate-sheet.dto';
export declare class ShipmentsService {
    private readonly rateSheetRepo;
    private readonly quoteRepo;
    constructor(rateSheetRepo: Repository<RateSheet>, quoteRepo: Repository<FreightQuote>);
    listRateSheets(): Promise<RateSheet[]>;
    createRateSheet(dto: UpsertRateSheetDto): Promise<RateSheet>;
    listQuotes(inquiryId?: string): Promise<FreightQuote[]>;
    createQuote(dto: CreateFreightQuoteDto): Promise<FreightQuote>;
}
