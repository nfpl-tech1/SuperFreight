import { User } from '../users/entities/user.entity';
import { RfqsService } from './rfqs.service';
export declare class RfqsController {
    private readonly rfqsService;
    constructor(rfqsService: RfqsService);
    list(): Promise<import("./entities/rfq.entity").Rfq[]>;
    create(rawBody: Record<string, unknown>, files: Express.Multer.File[], user: User): Promise<import("./entities/rfq.entity").Rfq | null>;
    private parseCreateRfqDto;
}
