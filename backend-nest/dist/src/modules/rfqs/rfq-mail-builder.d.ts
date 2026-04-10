import { CreateRfqDto } from './dto/create-rfq.dto';
type InquiryMailContext = {
    customerName?: string | null;
    tradeLane?: string | null;
    shipmentMode?: string | null;
    origin?: string | null;
    destination?: string | null;
    incoterm?: string | null;
    cargoSummary?: string | null;
};
type PersonalizationInput = {
    companyName: string;
    contactName: string | null;
    salutation: string | null;
    senderName: string | null;
    emailSignature?: string | null;
};
export declare function resolveMailDraft(dto: CreateRfqDto, inquiry: InquiryMailContext | null, senderName: string | null): {
    subjectLine: string;
    bodyHtml: string;
};
export declare function personalizeMailBodyHtml(templateHtml: string, personalization: PersonalizationInput): string;
export {};
