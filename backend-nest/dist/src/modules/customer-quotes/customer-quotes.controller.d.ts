import { User } from '../users/entities/user.entity';
import { CustomerQuotesService } from './customer-quotes.service';
import { GenerateCustomerDraftDto } from './dto/generate-customer-draft.dto';
export declare class CustomerQuotesController {
    private readonly customerQuotesService;
    constructor(customerQuotesService: CustomerQuotesService);
    list(): Promise<import("./entities/customer-draft.entity").CustomerDraft[]>;
    generate(dto: GenerateCustomerDraftDto, user: User): Promise<import("./entities/customer-draft.entity").CustomerDraft>;
}
