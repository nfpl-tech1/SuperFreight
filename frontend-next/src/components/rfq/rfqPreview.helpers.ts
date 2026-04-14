import type { FieldDefinition, FormValues } from "@/types/rfq";
import { isFieldVisible } from "@/lib/validation";
import {
  resolveEmailTemplate,
  resolveFieldValue,
  buildRateTableHtml,
  type EmailTemplate,
  type TemplateResolverInput,
} from "@/data/emailTemplates";

export type PreviewRow = {
  label: string;
  value: string;
};

function escapeAttribute(value: string) {
  return value.replace(/"/g, "&quot;");
}

function resolvePreviewValue(values: FormValues, key: string) {
  const rawValue = values[key];
  const formattedValue = Array.isArray(rawValue)
    ? rawValue.join(", ")
    : String(rawValue ?? "");

  if (!formattedValue.trim()) {
    return "";
  }

  const unitValue = values[`${key}_unit`];
  const formattedUnit = typeof unitValue === "string" ? unitValue.trim() : "";

  return formattedUnit ? `${formattedValue} ${formattedUnit}` : formattedValue;
}

function getColumnWidth(rows: PreviewRow[]) {
  const maxLength = rows.reduce((max, row) => {
    return Math.max(max, row.label.length, row.value.length);
  }, 0);

  return Math.max(maxLength * 8 + 24, 120);
}

export function buildPreviewRows(
  fields: FieldDefinition[],
  values: FormValues,
): PreviewRow[] {
  return fields
    .filter(
      (field) => isFieldVisible(field, values) && !field.ui?.hideInPreview,
    )
    .map((field) => {
      const display = resolvePreviewValue(values, field.key);
      return { label: field.label, value: display };
    })
    .filter((row) => row.value.trim() !== "");
}

export function buildPreviewTableHtml(
  rows: PreviewRow[],
  resolveValue?: (row: PreviewRow) => string,
) {
  if (rows.length === 0) {
    return `<p style="color:#64748b;font-style:italic;margin:12px 0;">[Fill in the form to generate data table...]</p>`;
  }

  const columnWidth = getColumnWidth(rows);

  return `
<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:13px;margin:12px 0;">
  <tbody>
    ${rows
      .map((row) => {
        const displayValue = resolveValue ? resolveValue(row) : row.value;
        return `<tr><td width="${columnWidth}" style="width:${columnWidth}px;font-weight:bold;background:#f0f4f8;padding:6px 12px;border:1px solid #ccc;word-break:break-word;">${row.label}</td><td width="${columnWidth}" style="width:${columnWidth}px;padding:6px 12px;border:1px solid #ccc;word-break:break-word;" data-value-label="${escapeAttribute(row.label)}">${displayValue}</td></tr>`;
      })
      .join("\n    ")}
  </tbody>
</table>`;
}

/* ------------------------------------------------------------------ */
/*  Template-based preview builder                                     */
/* ------------------------------------------------------------------ */

export function resolveTemplate(
  input: TemplateResolverInput,
): EmailTemplate | null {
  return resolveEmailTemplate(input);
}

function buildTemplateTableHtml(
  template: EmailTemplate,
  values: FormValues,
  resolveValue?: (row: PreviewRow) => string,
): string {
  const rows = template.fieldRows.map((fieldRow) => ({
    label: fieldRow.label,
    value: resolveFieldValue(fieldRow, values),
  }));

  const columnWidth = getColumnWidth(rows);

  const tableHtml = `
<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:13px;margin:12px 0;">
  <tbody>
    ${rows
      .map((row) => {
        const displayValue = resolveValue ? resolveValue(row) : row.value;
        return `<tr><td width="${columnWidth}" style="width:${columnWidth}px;font-weight:bold;background:#f0f4f8;padding:6px 12px;border:1px solid #ccc;word-break:break-word;">${row.label}</td><td width="${columnWidth}" style="width:${columnWidth}px;padding:6px 12px;border:1px solid #ccc;word-break:break-word;" data-value-label="${escapeAttribute(row.label)}">${displayValue}</td></tr>`;
      })
      .join("\n    ")}
  </tbody>
</table>`;

  return tableHtml;
}

export function buildTemplatePreviewEmailHtml(
  template: EmailTemplate,
  values: FormValues,
  resolveValue?: (row: PreviewRow) => string,
): string {
  const tableHtml = buildTemplateTableHtml(template, values, resolveValue);
  const rateTableHtml = template.rateTable
    ? buildRateTableHtml(template.rateTable)
    : "";

  return `
<div style="font-family:Arial,sans-serif;font-size:13px;color:#333;line-height:1.5;">
<p style="margin:0;">Dear [Person Name],</p>
<br/>
<p style="margin:0;">Good day!</p>
<br/>
<p style="margin:0;">${template.preamble}</p>
<br/>
<div id="rfq-dynamic-table-container">${tableHtml}</div>
<br/>
${rateTableHtml ? `<div id="rfq-rate-table-container">${rateTableHtml}</div><br/>` : ""}
${template.postamble ? `<p style="margin:0;">${template.postamble}</p><br/>` : ""}
<p style="margin:0;">Thank you!</p>
</div>`;
}

/* ------------------------------------------------------------------ */
/*  Legacy preview builder (fallback when no template matches)         */
/* ------------------------------------------------------------------ */

export function buildPreviewEmailHtml({
  departmentId,
  tableHtml,
}: {
  departmentId: string;
  tableHtml: string;
}) {
  const isTransport = departmentId === "road_freight";
  const preamble = isTransport
    ? "Kindly share your best quotation for transportation as per the following details:"
    : "Kindly share your best quotation for freight movement as per below details:";
  const postamble = isTransport
    ? "Please include the freight charges, transit time, and any other applicable terms and conditions in your quote."
    : "Please include freight charges, transit time, and commercial terms in your quote.";

  return `
<div style="font-family:Arial,sans-serif;font-size:13px;color:#333;line-height:1.5;">
<p style="margin:0;">Dear [Person Name],</p>
<br/>
<p style="margin:0;">Good day!</p>
<br/>
<p style="margin:0;">${preamble}</p>
<br/>
<div id="rfq-dynamic-table-container">${tableHtml}</div>
<br/>
<p style="margin:0;">${postamble}</p>
<br/>
<p style="margin:0;">Thanks,<br/>[User name]</p>
</div>`;
}

export function buildPreviewSubjectLine(
  departmentId: string,
  inquiryNumber: string,
  values: FormValues,
) {
  const isTransport = departmentId === "road_freight";
  const origin = (values.source || values.origin || "[Origin]") as string;
  const destination = (values.destination || "[Destination]") as string;
  const safeInquiry = inquiryNumber || "[Inquiry Number]";

  return isTransport
    ? `${safeInquiry} || Transport Rate Request || ${origin}`
    : `${safeInquiry} // ${origin} // ${destination}`;
}
