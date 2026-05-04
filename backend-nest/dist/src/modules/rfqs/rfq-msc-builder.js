"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMscVendorName = isMscVendorName;
exports.getMissingRequiredMscFields = getMissingRequiredMscFields;
exports.buildMscMailBodyHtml = buildMscMailBodyHtml;
const MSC_FIELD_DEFINITIONS = [
    { key: 'shipper', label: 'Shipper' },
    { key: 'forwarder', label: 'Forwarder' },
    { key: 'por', label: 'POR' },
    { key: 'pol', label: 'POL' },
    { key: 'pod', label: 'POD' },
    { key: 'commodity', label: 'Commodity' },
    { key: 'cargoWeight', label: 'Cargo Weight' },
    { key: 'volume', label: 'Volume' },
    { key: 'requestedRates', label: 'Requested Rates' },
    { key: 'freeTimeIfAny', label: 'Freetime If Any' },
    { key: 'validity', label: 'Validity' },
    { key: 'termsOfShipment', label: 'Terms Of Shipment' },
    { key: 'specificRemarks', label: 'Specific Remarks If Any' },
];
function escapeHtml(value) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}
function formatTableValue(value) {
    return escapeHtml(value.trim()).replace(/\r?\n/g, '<br/>');
}
function isMscVendorName(value) {
    const normalized = (value ?? '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
    if (!normalized) {
        return false;
    }
    return (normalized.includes('mediterranean shipping company') ||
        /(^| )msc( |$)/.test(normalized));
}
function getMissingRequiredMscFields(mscFields) {
    return MSC_FIELD_DEFINITIONS.filter((field) => !String(mscFields?.[field.key] ?? '').trim()).map((field) => field.label);
}
function buildMscMailBodyHtml(mscFields) {
    return `
<div style="font-family:Arial,sans-serif;font-size:13px;color:#334155;line-height:1.6;">
  <p style="margin:0;">Dear [Person Name],</p>
  <br/>
  <p style="margin:0;">Good day!</p>
  <br/>
  <p style="margin:0;">Please share your quotation as per the below MSC-required format.</p>
  <br/>
  <table border="1" cellpadding="0" cellspacing="0" width="560" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:13px;margin:12px 0;table-layout:fixed;max-width:100%;">
    <tbody>
      ${MSC_FIELD_DEFINITIONS.map((field) => `<tr>
        <td width="220" style="width:220px;font-weight:bold;background:#f8fafc;padding:6px 10px;border:1px solid #cbd5e1;vertical-align:top;">${escapeHtml(field.label)}</td>
        <td width="340" style="width:340px;padding:6px 10px;border:1px solid #cbd5e1;vertical-align:top;white-space:normal;">${formatTableValue(mscFields[field.key])}</td>
      </tr>`).join('\n')}
    </tbody>
  </table>
  <p style="margin:12px 0 0 0;">Regards,<br/>[User name]</p>
</div>`.trim();
}
//# sourceMappingURL=rfq-msc-builder.js.map