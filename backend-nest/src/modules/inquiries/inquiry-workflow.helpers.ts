import { DeepPartial } from 'typeorm';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { UpdateInquiryDto } from './dto/update-inquiry.dto';
import { Inquiry, InquiryStatus } from './entities/inquiry.entity';
import { Job } from './entities/job.entity';
import {
  JobServicePart,
  JobServicePartType,
} from './entities/job-service-part.entity';
import { OwnershipAssignment } from './entities/ownership-assignment.entity';

export function buildInquiryCreateInput(
  dto: CreateInquiryDto,
  currentUserId: string,
  inquiryNumber: string,
): DeepPartial<Inquiry> {
  return {
    inquiryNumber: dto.inquiryNumber?.trim() || inquiryNumber,
    inquiryType: dto.inquiryType,
    status: InquiryStatus.PENDING,
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

export function buildInquiryUpdateInput(
  dto: UpdateInquiryDto,
): DeepPartial<Inquiry> {
  const patch: DeepPartial<Inquiry> = {};

  if ('inquiryNumber' in dto) {
    patch.inquiryNumber = dto.inquiryNumber?.trim() || '';
  }
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

export function buildJobCreateInput(inquiry: Inquiry): DeepPartial<Job> {
  return {
    inquiryId: inquiry.id,
    customerName: inquiry.customerName,
    tradeLane: inquiry.tradeLane,
    currentStage: inquiry.status,
  };
}

export function buildJobUpdateInput(inquiry: Inquiry): DeepPartial<Job> {
  return {
    customerName: inquiry.customerName,
    tradeLane: inquiry.tradeLane,
  };
}

export function buildFreightServicePartCreateInput(
  jobId: string,
  inquiry: Inquiry,
  applicationSlug: string,
): DeepPartial<JobServicePart> {
  return {
    jobId,
    partType: JobServicePartType.FREIGHT,
    ownerUserId: inquiry.ownerUserId,
    status: inquiry.status,
    applicationSlug,
  };
}

export function buildOwnershipTransferInput(
  inquiryId: string,
  previousOwnerUserId: string | null,
  newOwnerUserId: string,
  changedByUserId: string,
  reason?: string,
): DeepPartial<OwnershipAssignment> {
  return {
    inquiryId,
    previousOwnerUserId: previousOwnerUserId ?? '',
    newOwnerUserId,
    changedByUserId,
    reason: reason ?? null,
  };
}
