import { MscFieldsDto } from './dto/create-rfq.dto';

type MscFieldDefinition = {
  key: keyof MscFieldsDto;
  label: string;
};

const MSC_FIELD_DEFINITIONS: MscFieldDefinition[] = [
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

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatTableValue(value: string) {
  return escapeHtml(value.trim()).replace(/\r?\n/g, '<br/>');
}

export function isMscVendorName(value: string | null | undefined) {
  const normalized = (value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  if (!normalized) {
    return false;
  }

  return (
    normalized.includes('mediterranean shipping company') ||
    /(^| )msc( |$)/.test(normalized)
  );
}

export function getMissingRequiredMscFields(
  mscFields?: Partial<MscFieldsDto> | null,
) {
  return MSC_FIELD_DEFINITIONS.filter(
    (field) => !String(mscFields?.[field.key] ?? '').trim(),
  ).map((field) => field.label);
}

export function buildMscMailBodyHtml(mscFields: MscFieldsDto) {
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
      ${MSC_FIELD_DEFINITIONS.map(
        (field) => `<tr>
        <td width="220" style="width:220px;font-weight:bold;background:#f8fafc;padding:6px 10px;border:1px solid #cbd5e1;vertical-align:top;">${escapeHtml(field.label)}</td>
        <td width="340" style="width:340px;padding:6px 10px;border:1px solid #cbd5e1;vertical-align:top;white-space:normal;">${formatTableValue(mscFields[field.key])}</td>
      </tr>`,
      ).join('\n')}
    </tbody>
  </table>
  <p style="margin:12px 0 0 0;">Regards,<br/>[User name]</p>
</div>`.trim();
}
