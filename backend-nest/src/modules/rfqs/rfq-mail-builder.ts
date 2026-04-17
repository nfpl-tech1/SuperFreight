import { CreateRfqDto } from './dto/create-rfq.dto';

type InquiryMailContext = {
  customerName?: string | null;
  tradeLane?: string | null;
  shipmentMode?: string | null;
  origin?: string | null;
  destination?: string | null;
  incoterm?: string | null;
  cargoSummary?: string | null;
};

type PersonalizationInput = {
  companyName: string;
  contactName: string | null;
  salutation: string | null;
  senderName: string | null;
  emailSignature?: string | null;
};

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function humanizeKey(key: string) {
  return key
    .replaceAll(/[_-]+/g, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatValue(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item ?? '').trim())
      .filter(Boolean)
      .join(', ');
  }

  return String(value ?? '').trim();
}

function resolveValueWithUnit(
  formValues: Record<string, unknown>,
  key: string,
  value: unknown,
) {
  const formattedValue = formatValue(value);
  if (!formattedValue) {
    return '';
  }

  const unit = formatValue(formValues[`${key}_unit`]);
  return unit ? `${formattedValue} ${unit}` : formattedValue;
}

function buildFormRows(formValues: Record<string, unknown>) {
  return Object.entries(formValues)
    .filter(([key]) => !key.endsWith('_unit'))
    .map(([key, value]) => ({
      label: humanizeKey(key),
      value: resolveValueWithUnit(formValues, key, value),
    }))
    .filter((row) => row.value);
}

function getFormTableColumnWidth(rows: ReturnType<typeof buildFormRows>) {
  const maxLabelLength = rows.reduce((max, row) => {
    return Math.max(max, row.label.length);
  }, 0);

  // Keep both columns compact and consistent in Outlook.
  return Math.min(Math.max(maxLabelLength * 8 + 24, 150), 260);
}

function buildFormTableHtml(formValues: Record<string, unknown>) {
  const rows = buildFormRows(formValues);

  if (rows.length === 0) {
    return '<p style="margin:0;color:#64748b;">Shipment details will be shared separately.</p>';
  }

  const columnWidth = getFormTableColumnWidth(rows);
  const tableWidth = columnWidth * 2;

  return `
<table border="1" cellpadding="0" cellspacing="0" width="${tableWidth}" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:13px;margin:12px 0;table-layout:fixed;max-width:100%;">
  <tbody>
    ${rows
      .map(
        (row) => `<tr>
      <td width="${columnWidth}" style="width:${columnWidth}px;font-weight:bold;background:#f8fafc;padding:6px 10px;border:1px solid #cbd5e1;vertical-align:top;word-break:break-word;">${escapeHtml(row.label)}</td>
      <td width="${columnWidth}" style="width:${columnWidth}px;padding:6px 10px;border:1px solid #cbd5e1;vertical-align:top;word-break:break-word;white-space:normal;">${escapeHtml(row.value)}</td>
    </tr>`,
      )
      .join('\n')}
  </tbody>
</table>`;
}

function buildResponseFieldListHtml(dto: CreateRfqDto) {
  if (dto.responseFields.length === 0) {
    return '';
  }

  return `
<p style="margin:16px 0 8px 0;"><strong>Please share your quotation with the following response points:</strong></p>
<ul style="margin:0 0 16px 20px;padding:0;">
  ${dto.responseFields
    .map((field) => `<li>${escapeHtml(field.fieldLabel)}</li>`)
    .join('\n')}
</ul>`;
}

function buildFallbackTemplate(
  dto: CreateRfqDto,
  inquiry: InquiryMailContext | null,
  senderName: string | null,
) {
  const tradeLaneDetails = [
    inquiry?.tradeLane ? `Trade Lane: ${inquiry.tradeLane}` : '',
    inquiry?.shipmentMode ? `Mode: ${inquiry.shipmentMode}` : '',
    inquiry?.incoterm ? `Incoterm: ${inquiry.incoterm}` : '',
    inquiry?.origin ? `Origin: ${inquiry.origin}` : '',
    inquiry?.destination ? `Destination: ${inquiry.destination}` : '',
  ].filter(Boolean);

  const contextSummary = inquiry?.cargoSummary
    ? `<p style="margin:0 0 12px 0;">Cargo Summary: ${escapeHtml(
        inquiry.cargoSummary,
      )}</p>`
    : '';

  const tradeLaneSummary =
    tradeLaneDetails.length > 0
      ? `<p style="margin:0 0 12px 0;">${tradeLaneDetails
          .map((line) => escapeHtml(line))
          .join(' | ')}</p>`
      : '';

  return `
<div style="font-family:Arial,sans-serif;font-size:13px;color:#334155;line-height:1.6;">
  <p style="margin:0;">Dear [Person Name],</p>
  <br/>
  <p style="margin:0;">Good day!</p>
  <br/>
  <p style="margin:0;">Please share your best quotation for RFQ ${escapeHtml(
    dto.inquiryNumber,
  )}${inquiry?.customerName ? ` for ${escapeHtml(inquiry.customerName)}` : ''}.</p>
  <br/>
  ${contextSummary}
  ${tradeLaneSummary}
  <div id="rfq-dynamic-table-container">${buildFormTableHtml(dto.formValues)}</div>
  ${buildResponseFieldListHtml(dto)}
  <p style="margin:12px 0 0 0;">Regards,<br/>${escapeHtml(
    senderName || '[User name]',
  )}</p>
</div>`.trim();
}

function buildContactDisplayName({
  companyName,
  contactName,
  salutation,
}: PersonalizationInput) {
  const trimmedContact = contactName?.trim() ?? '';
  const trimmedSalutation = salutation?.trim() ?? '';

  if (trimmedContact && trimmedSalutation) {
    const normalizedContact = trimmedContact.toLowerCase();
    const normalizedSalutation = trimmedSalutation.toLowerCase();
    if (normalizedContact.startsWith(normalizedSalutation)) {
      return trimmedContact;
    }
    return `${trimmedSalutation} ${trimmedContact}`.trim();
  }

  if (trimmedContact) {
    return trimmedContact;
  }

  return companyName ? `${companyName} Team` : 'Team';
}

function normalizeSignatureHtml(signature: string) {
  return signature
    .replace(/^(?:\s|<p[^>]*>(?:\s|&nbsp;|<br\s*\/?\s*>)*<\/p>|<div[^>]*>(?:\s|&nbsp;|<br\s*\/?\s*>)*<\/div>|<br\s*\/?\s*>)+/gi, '')
    .replace(/(?:\s|<p[^>]*>(?:\s|&nbsp;|<br\s*\/?\s*>)*<\/p>|<div[^>]*>(?:\s|&nbsp;|<br\s*\/?\s*>)*<\/div>|<br\s*\/?\s*>)+$/gi, '')
    .replace(/(<br\s*\/?\s*>\s*){3,}/gi, '<br/><br/>');
}

function tightenSignatureBlockSpacing(signatureHtml: string) {
  const compactParagraphStyle = 'margin:0 0 6px 0;line-height:1.35;';
  const compactBlockStyle = 'margin:0;line-height:1.35;';

  return signatureHtml
    .replace(/<(p)([^>]*)>/gi, (_match, tag: string, attrs: string) => {
      if (/\sstyle\s*=\s*/i.test(attrs)) {
        return `<${tag}${attrs.replace(
          /\sstyle\s*=\s*(["'])(.*?)\1/i,
          (_s, quote: string, styleValue: string) => {
            const cleaned = styleValue
              .replace(/(^|;)\s*margin(?:-[a-z]+)?\s*:[^;]*/gi, '')
              .replace(/(^|;)\s*line-height\s*:[^;]*/gi, '')
              .replace(/;{2,}/g, ';')
              .trim();
            const normalized = `${compactParagraphStyle}${cleaned ? ` ${cleaned.replace(/^;+/, '')}` : ''}`.trim();
            return ` style=${quote}${normalized}${quote}`;
          },
        )}>`;
      }

      return `<${tag}${attrs} style="${compactParagraphStyle}">`;
    })
    .replace(/<(div)([^>]*)>/gi, (_match, tag: string, attrs: string) => {
      if (/\sstyle\s*=\s*/i.test(attrs)) {
        return `<${tag}${attrs.replace(
          /\sstyle\s*=\s*(["'])(.*?)\1/i,
          (_s, quote: string, styleValue: string) => {
            const cleaned = styleValue
              .replace(/(^|;)\s*margin(?:-[a-z]+)?\s*:[^;]*/gi, '')
              .replace(/(^|;)\s*line-height\s*:[^;]*/gi, '')
              .replace(/;{2,}/g, ';')
              .trim();
            const normalized = `${compactBlockStyle}${cleaned ? ` ${cleaned.replace(/^;+/, '')}` : ''}`.trim();
            return ` style=${quote}${normalized}${quote}`;
          },
        )}>`;
      }

      return `<${tag}${attrs} style="${compactBlockStyle}">`;
    })
    .replace(/(<br\s*\/?\s*>\s*){3,}/gi, '<br/><br/>');
}

export function resolveMailDraft(
  dto: CreateRfqDto,
  inquiry: InquiryMailContext | null,
  senderName: string | null,
) {
  return {
    subjectLine:
      dto.mailSubject?.trim() ||
      `RFQ ${dto.inquiryNumber} - ${humanizeKey(dto.departmentId)}`,
    bodyHtml:
      dto.mailBodyHtml?.trim() ||
      buildFallbackTemplate(dto, inquiry, senderName),
  };
}

export function personalizeMailBodyHtml(
  templateHtml: string,
  personalization: PersonalizationInput,
) {
  const personName = buildContactDisplayName(personalization);
  const senderName = personalization.senderName?.trim() || '[User name]';

  let html = templateHtml
    .replaceAll('[Person Name]', escapeHtml(personName))
    .replaceAll('[User name]', escapeHtml(senderName))
    .replaceAll('[Vendor Company]', escapeHtml(personalization.companyName));

  const signature = personalization.emailSignature?.trim();
  if (signature) {
    html += `\n<div style="margin-top:6px;padding-top:0;">${tightenSignatureBlockSpacing(normalizeSignatureHtml(signature))}</div>`;
  }

  return html;
}
