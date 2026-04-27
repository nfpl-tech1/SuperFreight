import { Inquiry } from '../../inquiries/entities/inquiry.entity';
import { GraphMessageAttachment, GraphMessageDetail } from '../../outlook/outlook.types';
import { Rfq } from '../../rfqs/entities/rfq.entity';
import { RfqFieldSpec } from '../../rfqs/entities/rfq-field-spec.entity';
type QuoteExtractionContext = {
    inquiry: Inquiry;
    rfq: Rfq;
    fieldSpecs: RfqFieldSpec[];
    message: GraphMessageDetail;
    attachments: GraphMessageAttachment[];
};
export declare function buildQuoteExtractionPrompt({ inquiry, rfq, fieldSpecs, message, attachments, }: QuoteExtractionContext): string;
export declare function buildQuoteExtractionResponseSchema(fieldSpecs: RfqFieldSpec[]): {
    type: string;
    properties: {
        currency: {
            type: string[];
        };
        totalRate: {
            type: string[];
        };
        freightRate: {
            type: string[];
        };
        localCharges: {
            type: string[];
        };
        documentation: {
            type: string[];
        };
        transitDays: {
            type: string[];
        };
        validUntil: {
            type: string[];
            format: string;
        };
        remarks: {
            type: string[];
        };
        confidence: {
            type: string[];
            minimum: number;
            maximum: number;
        };
        comparisonFields: {
            type: string;
            properties: {
                [k: string]: {
                    type: string[];
                    description: string;
                };
            };
            additionalProperties: boolean;
        };
    };
    required: string[];
    additionalProperties: boolean;
};
export {};
