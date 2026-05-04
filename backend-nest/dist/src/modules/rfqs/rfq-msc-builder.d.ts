import { MscFieldsDto } from './dto/create-rfq.dto';
export declare function isMscVendorName(value: string | null | undefined): boolean;
export declare function getMissingRequiredMscFields(mscFields?: Partial<MscFieldsDto> | null): string[];
export declare function buildMscMailBodyHtml(mscFields: MscFieldsDto): string;
