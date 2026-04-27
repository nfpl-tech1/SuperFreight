import { Repository } from 'typeorm';
import { Inquiry } from '../../inquiries/entities/inquiry.entity';
import { Rfq } from '../../rfqs/entities/rfq.entity';
import { VendorCcRecipient } from '../../vendors/entities/vendor-cc-recipient.entity';
import { VendorContact } from '../../vendors/entities/vendor-contact.entity';
import { VendorOffice } from '../../vendors/entities/vendor-office.entity';
type MatchCandidate = {
    fromEmail: string | null;
    subject: string | null;
};
export type QuoteMessageMatch = {
    inquiryNumber: string | null;
    matchedInquiryId: string | null;
    matchedRfqId: string | null;
    matchedVendorId: string | null;
    matchConfidence: 'none' | 'low' | 'medium' | 'high';
    matchReason: string;
    matchedBy: string[];
    suggestedVendorIds: string[];
    suggestedRfqIds: string[];
};
export declare class QuoteMatchingService {
    private readonly rfqRepo;
    private readonly inquiryRepo;
    private readonly contactRepo;
    private readonly ccRepo;
    private readonly officeRepo;
    private static readonly INQUIRY_NUMBER_REGEX;
    constructor(rfqRepo: Repository<Rfq>, inquiryRepo: Repository<Inquiry>, contactRepo: Repository<VendorContact>, ccRepo: Repository<VendorCcRecipient>, officeRepo: Repository<VendorOffice>);
    extractInquiryNumber(subject?: string | null): string | null;
    matchMessage(candidate: MatchCandidate): Promise<QuoteMessageMatch>;
    private findRfqsForInquiry;
    private findRfqMatch;
    private findVendorMatchBySenderEmail;
    private findOfficeIdsByExactEmail;
    private findOfficeIdsByEmailDomain;
    private findVendorIdsForOfficeIds;
    private buildMatchResult;
}
export {};
