import { User } from '../users/entities/user.entity';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { TransferInquiryDto } from './dto/transfer-inquiry.dto';
import { UpdateInquiryDto } from './dto/update-inquiry.dto';
import { InquiriesService } from './inquiries.service';
export declare class InquiriesController {
    private readonly inquiriesService;
    constructor(inquiriesService: InquiriesService);
    list(user: User): Promise<import("./entities/inquiry.entity").Inquiry[]>;
    create(dto: CreateInquiryDto, user: User): Promise<import("./entities/inquiry.entity").Inquiry>;
    update(id: string, dto: UpdateInquiryDto, user: User): Promise<import("./entities/inquiry.entity").Inquiry>;
    remove(id: string, user: User): Promise<{
        success: boolean;
        id: string;
    }>;
    transfer(id: string, dto: TransferInquiryDto, user: User): Promise<import("./entities/inquiry.entity").Inquiry>;
}
