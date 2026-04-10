"use client";

import { DynamicFormRenderer } from "@/components/rfq/DynamicFormRenderer";
import { RFQPreview } from "@/components/rfq/RFQPreview";
import type { Inquiry } from "@/lib/api";
import type { DepartmentDefinition, FormValues, ValidationResult } from "@/types/rfq";

interface Props {
  inquiryId: string;
  inquiryNumber?: string;
  department: DepartmentDefinition;
  formValues: FormValues;
  validation: ValidationResult;
  inquiries: Inquiry[];
  tradeLane?: string;
  incoterm?: string;
  onFieldChange: (key: string, value: string | string[]) => void;
  onCopyReady?: (fn: () => Promise<void>) => void;
}

export function Step1RFQForm({
  inquiryId,
  inquiryNumber,
  department,
  formValues,
  validation,
  inquiries,
  tradeLane,
  incoterm,
  onFieldChange,
  onCopyReady,
}: Props) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1.2fr)] xl:items-start">
      <section className="order-2 overflow-hidden rounded-[1.1rem] border border-[hsl(214_32%_88%)] bg-white shadow-[0_18px_48px_-34px_rgba(19,39,94,0.38)] xl:order-1 xl:sticky xl:top-4">
        <RFQPreview
          inquiryId={inquiryId}
          inquiryNumber={inquiryNumber}
          departmentId={department.id}
          departmentName={department.name}
          companyName={inquiries.find((inquiry) => inquiry.id === inquiryId)?.customerName || "Company Name"}
          fields={department.fields}
          values={formValues}
          tradeLane={tradeLane}
          incoterm={incoterm}
          onSendViaOutlook={() => {}}
          hideSendButton
          hideCopyButton
          onCopyReady={onCopyReady}
        />
      </section>

      <section className="order-1 rounded-[1.1rem] border border-[hsl(214_32%_88%)] bg-white px-4 py-4 shadow-[0_18px_48px_-34px_rgba(19,39,94,0.38)] xl:order-2 xl:px-5 xl:py-5">
        <DynamicFormRenderer
          fields={department.fields}
          values={formValues}
          errors={validation.errors}
          onChange={onFieldChange}
        />
      </section>
    </div>
  );
}
