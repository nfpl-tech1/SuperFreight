import { DeepPartial } from 'typeorm';
import { CreateRfqDto } from './dto/create-rfq.dto';
import { RfqFieldSpec } from './entities/rfq-field-spec.entity';
import { Rfq } from './entities/rfq.entity';

export function buildRfqCreateInput(
  dto: CreateRfqDto,
  userId: string,
): DeepPartial<Rfq> {
  return {
    inquiryId: dto.inquiryId,
    inquiryNumber: dto.inquiryNumber,
    departmentId: dto.departmentId,
    createdByUserId: userId,
    formValues: dto.formValues,
    vendorIds: dto.vendorIds,
    sent: !!dto.sendNow,
    subjectLine:
      dto.mailSubject?.trim() ||
      buildRfqSubjectLine(dto.inquiryNumber, dto.departmentId),
    promptTemplateMeta: buildPromptTemplateMeta(dto),
    sentAt: dto.sendNow ? new Date() : null,
  };
}

export function buildRfqFieldSpecInputs(
  rfqId: string,
  dto: CreateRfqDto,
): DeepPartial<RfqFieldSpec>[] {
  return dto.responseFields.map((field) => ({
    rfqId,
    fieldKey: field.fieldKey,
    fieldLabel: field.fieldLabel,
    isCustom: field.isCustom,
  }));
}

export function buildPromptTemplateMeta(dto: CreateRfqDto) {
  return {
    selectedFields: dto.responseFields.map((field) => field.fieldLabel),
    mscFields: dto.mscFields,
  };
}

function getDepartmentLabel(departmentId: string) {
  const labelMap: Record<string, string> = {
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

export function buildRfqSubjectLine(
  inquiryNumber: string,
  departmentId: string,
) {
  return `RFQ ${inquiryNumber} - ${getDepartmentLabel(departmentId)}`;
}
