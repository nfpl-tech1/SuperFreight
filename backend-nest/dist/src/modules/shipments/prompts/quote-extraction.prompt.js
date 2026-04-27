"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildQuoteExtractionPrompt = buildQuoteExtractionPrompt;
exports.buildQuoteExtractionResponseSchema = buildQuoteExtractionResponseSchema;
function buildQuoteExtractionPrompt({ inquiry, rfq, fieldSpecs, message, attachments, }) {
    return [
        'You extract vendor quotation details from logistics RFQ reply emails.',
        'Return only JSON that matches the requested schema.',
        'Use null for values that are missing or uncertain.',
        'Do not invent numbers, dates, or currencies.',
        '',
        `Inquiry Number: ${inquiry.inquiryNumber}`,
        `RFQ Id: ${rfq.id}`,
        `Department: ${rfq.departmentId}`,
        `RFQ Subject: ${rfq.subjectLine ?? ''}`,
        `Sender: ${message.from?.emailAddress?.address ?? ''}`,
        `Mail Subject: ${message.subject ?? ''}`,
        '',
        'Inquiry Context:',
        JSON.stringify({
            customerName: inquiry.customerName,
            tradeLane: inquiry.tradeLane,
            shipmentMode: inquiry.shipmentMode,
            origin: inquiry.origin,
            destination: inquiry.destination,
            incoterm: inquiry.incoterm,
            cargoSummary: inquiry.cargoSummary,
        }, null, 2),
        '',
        'RFQ Form Values:',
        JSON.stringify(rfq.formValues ?? {}, null, 2),
        '',
        'Requested Quote Fields:',
        JSON.stringify(fieldSpecs.map((field) => ({
            fieldKey: field.fieldKey,
            fieldLabel: field.fieldLabel,
        })), null, 2),
        '',
        'Email Body:',
        message.body?.content?.trim() || message.bodyPreview || '',
        '',
        'Attachment Summary:',
        JSON.stringify(attachments.map((attachment) => ({
            name: attachment.name ?? null,
            contentType: attachment.contentType ?? null,
            size: attachment.size ?? null,
        })), null, 2),
        '',
        'Extraction Instructions:',
        '- Populate comparisonFields only for requested RFQ fields.',
        '- Populate top-level commercial fields only when they are directly visible.',
        '- Use ISO date format YYYY-MM-DD for validity when clear.',
        '- Use integer days for transitDays when clear.',
        '- Use a confidence number between 0 and 1.',
    ].join('\n');
}
function buildQuoteExtractionResponseSchema(fieldSpecs) {
    const comparisonFieldProperties = Object.fromEntries(fieldSpecs.map((field) => [
        field.fieldKey,
        {
            type: ['string', 'number', 'integer', 'boolean', 'null'],
            description: field.fieldLabel,
        },
    ]));
    return {
        type: 'object',
        properties: {
            currency: {
                type: ['string', 'null'],
            },
            totalRate: {
                type: ['number', 'null'],
            },
            freightRate: {
                type: ['number', 'null'],
            },
            localCharges: {
                type: ['number', 'null'],
            },
            documentation: {
                type: ['number', 'null'],
            },
            transitDays: {
                type: ['integer', 'null'],
            },
            validUntil: {
                type: ['string', 'null'],
                format: 'date',
            },
            remarks: {
                type: ['string', 'null'],
            },
            confidence: {
                type: ['number', 'null'],
                minimum: 0,
                maximum: 1,
            },
            comparisonFields: {
                type: 'object',
                properties: comparisonFieldProperties,
                additionalProperties: false,
            },
        },
        required: [
            'currency',
            'totalRate',
            'freightRate',
            'localCharges',
            'documentation',
            'transitDays',
            'validUntil',
            'remarks',
            'confidence',
            'comparisonFields',
        ],
        additionalProperties: false,
    };
}
//# sourceMappingURL=quote-extraction.prompt.js.map