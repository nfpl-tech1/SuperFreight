"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveMailDraft = resolveMailDraft;
exports.personalizeMailBodyHtml = personalizeMailBodyHtml;
function escapeHtml(value) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}
function humanizeKey(key) {
    return key
        .replaceAll(/[_-]+/g, ' ')
        .replaceAll(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}
function formatValue(value) {
    if (Array.isArray(value)) {
        return value
            .map((item) => String(item ?? '').trim())
            .filter(Boolean)
            .join(', ');
    }
    return String(value ?? '').trim();
}
function buildFormRows(formValues) {
    return Object.entries(formValues)
        .map(([key, value]) => ({
        label: humanizeKey(key),
        value: formatValue(value),
    }))
        .filter((row) => row.value);
}
function buildFormTableHtml(formValues) {
    const rows = buildFormRows(formValues);
    if (rows.length === 0) {
        return '<p style="margin:0;color:#64748b;">Shipment details will be shared separately.</p>';
    }
    return `
<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:13px;margin:12px 0;">
  <tbody>
    ${rows
        .map((row) => `<tr>
      <td style="font-weight:bold;background:#f8fafc;padding:6px 12px;border:1px solid #cbd5e1;vertical-align:top;">${escapeHtml(row.label)}</td>
      <td style="padding:6px 12px;border:1px solid #cbd5e1;vertical-align:top;">${escapeHtml(row.value)}</td>
    </tr>`)
        .join('\n')}
  </tbody>
</table>`;
}
function buildResponseFieldListHtml(dto) {
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
function buildFallbackTemplate(dto, inquiry, senderName) {
    const tradeLaneDetails = [
        inquiry?.tradeLane ? `Trade Lane: ${inquiry.tradeLane}` : '',
        inquiry?.shipmentMode ? `Mode: ${inquiry.shipmentMode}` : '',
        inquiry?.incoterm ? `Incoterm: ${inquiry.incoterm}` : '',
        inquiry?.origin ? `Origin: ${inquiry.origin}` : '',
        inquiry?.destination ? `Destination: ${inquiry.destination}` : '',
    ].filter(Boolean);
    const contextSummary = inquiry?.cargoSummary
        ? `<p style="margin:0 0 12px 0;">Cargo Summary: ${escapeHtml(inquiry.cargoSummary)}</p>`
        : '';
    const tradeLaneSummary = tradeLaneDetails.length > 0
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
  <p style="margin:0;">Please share your best quotation for RFQ ${escapeHtml(dto.inquiryNumber)}${inquiry?.customerName ? ` for ${escapeHtml(inquiry.customerName)}` : ''}.</p>
  <br/>
  ${contextSummary}
  ${tradeLaneSummary}
  <div id="rfq-dynamic-table-container">${buildFormTableHtml(dto.formValues)}</div>
  ${buildResponseFieldListHtml(dto)}
  <p style="margin:16px 0 0 0;">Thank you!</p>
  <p style="margin:8px 0 0 0;">Regards,<br/>${escapeHtml(senderName || '[User name]')}</p>
</div>`.trim();
}
function buildContactDisplayName({ companyName, contactName, salutation, }) {
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
function resolveMailDraft(dto, inquiry, senderName) {
    return {
        subjectLine: dto.mailSubject?.trim() ||
            `RFQ ${dto.inquiryNumber} - ${humanizeKey(dto.departmentId)}`,
        bodyHtml: dto.mailBodyHtml?.trim() ||
            buildFallbackTemplate(dto, inquiry, senderName),
    };
}
function personalizeMailBodyHtml(templateHtml, personalization) {
    const personName = buildContactDisplayName(personalization);
    const senderName = personalization.senderName?.trim() || '[User name]';
    let html = templateHtml
        .replaceAll('[Person Name]', escapeHtml(personName))
        .replaceAll('[User name]', escapeHtml(senderName))
        .replaceAll('[Vendor Company]', escapeHtml(personalization.companyName));
    const signature = personalization.emailSignature?.trim();
    if (signature) {
        html += `\n<div style="margin-top:24px;border-top:1px solid #e2e8f0;padding-top:16px;">${signature}</div>`;
    }
    return html;
}
//# sourceMappingURL=rfq-mail-builder.js.map