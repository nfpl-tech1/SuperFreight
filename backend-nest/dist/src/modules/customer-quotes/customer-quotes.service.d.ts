import { Repository } from 'typeorm';
import { CustomerDraft } from './entities/customer-draft.entity';
import { GenerateCustomerDraftDto } from './dto/generate-customer-draft.dto';
import { FreightQuote } from '../shipments/entities/freight-quote.entity';
import { Inquiry } from '../inquiries/entities/inquiry.entity';
import { User } from '../users/entities/user.entity';
export declare class CustomerQuotesService {
    private readonly draftRepo;
    private readonly quoteRepo;
    private readonly inquiryRepo;
    constructor(draftRepo: Repository<CustomerDraft>, quoteRepo: Repository<FreightQuote>, inquiryRepo: Repository<Inquiry>);
    list(): Promise<CustomerDraft[]>;
    generate(dto: GenerateCustomerDraftDto, user: User): Promise<CustomerDraft>;
}
