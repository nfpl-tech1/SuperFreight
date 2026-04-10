import { User } from '../users/entities/user.entity';
import { CreateRfqDto } from './dto/create-rfq.dto';
import { RfqsService } from './rfqs.service';
export declare class RfqsController {
    private readonly rfqsService;
    constructor(rfqsService: RfqsService);
    list(): Promise<import("./entities/rfq.entity").Rfq[]>;
    create(dto: CreateRfqDto, user: User): Promise<import("./entities/rfq.entity").Rfq | null>;
}
