"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRfqCreateInput = buildRfqCreateInput;
exports.buildRfqFieldSpecInputs = buildRfqFieldSpecInputs;
exports.buildPromptTemplateMeta = buildPromptTemplateMeta;
exports.buildRfqSubjectLine = buildRfqSubjectLine;
function buildRfqCreateInput(dto, userId) {
    return {
        inquiryId: dto.inquiryId,
        inquiryNumber: dto.inquiryNumber,
        departmentId: dto.departmentId,
        createdByUserId: userId,
        formValues: dto.formValues,
        vendorIds: dto.vendorIds,
        sent: !!dto.sendNow,
        subjectLine: dto.mailSubject?.trim() ||
            buildRfqSubjectLine(dto.inquiryNumber, dto.departmentId),
        promptTemplateMeta: buildPromptTemplateMeta(dto),
        sentAt: dto.sendNow ? new Date() : null,
    };
}
function buildRfqFieldSpecInputs(rfqId, dto) {
    return dto.responseFields.map((field) => ({
        rfqId,
        fieldKey: field.fieldKey,
        fieldLabel: field.fieldLabel,
        isCustom: field.isCustom,
    }));
}
function buildPromptTemplateMeta(dto) {
    return {
        selectedFields: dto.responseFields.map((field) => field.fieldLabel),
    };
}
function getDepartmentLabel(departmentId) {
    const labelMap = {
        air_freight: 'Air Freight',
        ocean_freight: 'Ocean Freight',
        road_freight: 'Transport',
        cha_services: 'CHA',
        local_port_charges: 'Local Port Charges',
        destination_charges: 'Destination Charges',
        overseas_agents: 'Overseas Agents',
    };
    return labelMap[departmentId] ?? departmentId.replaceAll('_', ' ');
}
function buildRfqSubjectLine(inquiryNumber, departmentId) {
    return `RFQ ${inquiryNumber} - ${getDepartmentLabel(departmentId)}`;
}
//# sourceMappingURL=rfq-builders.js.map