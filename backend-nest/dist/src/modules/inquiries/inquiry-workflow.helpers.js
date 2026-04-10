"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildInquiryCreateInput = buildInquiryCreateInput;
exports.buildInquiryUpdateInput = buildInquiryUpdateInput;
exports.buildJobCreateInput = buildJobCreateInput;
exports.buildJobUpdateInput = buildJobUpdateInput;
exports.buildFreightServicePartCreateInput = buildFreightServicePartCreateInput;
exports.buildOwnershipTransferInput = buildOwnershipTransferInput;
const inquiry_entity_1 = require("./entities/inquiry.entity");
const job_service_part_entity_1 = require("./entities/job-service-part.entity");
function buildInquiryCreateInput(dto, currentUserId, inquiryNumber) {
    return {
        inquiryNumber,
        inquiryType: dto.inquiryType,
        status: inquiry_entity_1.InquiryStatus.PENDING,
        customerName: dto.customerName,
        customerRole: dto.customerRole ?? null,
        tradeLane: dto.tradeLane ?? null,
        origin: dto.origin ?? null,
        destination: dto.destination ?? null,
        shipmentMode: dto.shipmentMode ?? null,
        incoterm: dto.incoterm?.trim() || null,
        cargoSummary: dto.cargoSummary ?? null,
        mailboxOwnerUserId: dto.mailboxOwnerUserId ?? currentUserId,
        ownerUserId: dto.ownerUserId ?? dto.mailboxOwnerUserId ?? currentUserId,
    };
}
function buildInquiryUpdateInput(dto) {
    const patch = {};
    if ('customerName' in dto) {
        patch.customerName = dto.customerName?.trim() || '';
    }
    if ('customerRole' in dto) {
        patch.customerRole = dto.customerRole ?? null;
    }
    if ('inquiryType' in dto) {
        patch.inquiryType = dto.inquiryType;
    }
    if ('tradeLane' in dto) {
        patch.tradeLane = dto.tradeLane ?? null;
    }
    if ('origin' in dto) {
        patch.origin = dto.origin?.trim() || null;
    }
    if ('destination' in dto) {
        patch.destination = dto.destination?.trim() || null;
    }
    if ('shipmentMode' in dto) {
        patch.shipmentMode = dto.shipmentMode ?? null;
    }
    if ('incoterm' in dto) {
        patch.incoterm = dto.incoterm?.trim() || null;
    }
    if ('cargoSummary' in dto) {
        patch.cargoSummary = dto.cargoSummary?.trim() || null;
    }
    return patch;
}
function buildJobCreateInput(inquiry) {
    return {
        inquiryId: inquiry.id,
        customerName: inquiry.customerName,
        tradeLane: inquiry.tradeLane,
        currentStage: inquiry.status,
    };
}
function buildJobUpdateInput(inquiry) {
    return {
        customerName: inquiry.customerName,
        tradeLane: inquiry.tradeLane,
    };
}
function buildFreightServicePartCreateInput(jobId, inquiry, applicationSlug) {
    return {
        jobId,
        partType: job_service_part_entity_1.JobServicePartType.FREIGHT,
        ownerUserId: inquiry.ownerUserId,
        status: inquiry.status,
        applicationSlug,
    };
}
function buildOwnershipTransferInput(inquiryId, previousOwnerUserId, newOwnerUserId, changedByUserId, reason) {
    return {
        inquiryId,
        previousOwnerUserId: previousOwnerUserId ?? '',
        newOwnerUserId,
        changedByUserId,
        reason: reason ?? null,
    };
}
//# sourceMappingURL=inquiry-workflow.helpers.js.map