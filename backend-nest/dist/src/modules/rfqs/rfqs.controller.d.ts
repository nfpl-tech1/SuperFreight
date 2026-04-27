import { User } from '../users/entities/user.entity';
import { RfqsService } from './rfqs.service';
export declare class RfqsController {
    private readonly rfqsService;
    constructor(rfqsService: RfqsService);
    list(inquiryId?: string): Promise<{
        fieldSpecs: import("./entities/rfq-field-spec.entity").RfqFieldSpec[];
        id: string;
        inquiryId: string;
        inquiryNumber: string;
        departmentId: string;
        createdByUserId: string | null;
        formValues: Record<string, unknown>;
        vendorIds: string[];
        sent: boolean;
        subjectLine: string | null;
        promptTemplateMeta: Record<string, unknown> | null;
        sentAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    create(rawBody: Record<string, unknown>, files: Express.Multer.File[], user: User): Promise<import("./entities/rfq.entity").Rfq | null>;
    private parseCreateRfqDto;
}
