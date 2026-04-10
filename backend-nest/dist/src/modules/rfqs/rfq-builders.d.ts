import { DeepPartial } from 'typeorm';
import { CreateRfqDto } from './dto/create-rfq.dto';
import { RfqFieldSpec } from './entities/rfq-field-spec.entity';
import { Rfq } from './entities/rfq.entity';
export declare function buildRfqCreateInput(dto: CreateRfqDto, userId: string): DeepPartial<Rfq>;
export declare function buildRfqFieldSpecInputs(rfqId: string, dto: CreateRfqDto): DeepPartial<RfqFieldSpec>[];
export declare function buildPromptTemplateMeta(dto: CreateRfqDto): {
    selectedFields: string[];
};
export declare function buildRfqSubjectLine(inquiryNumber: string, departmentId: string): string;
