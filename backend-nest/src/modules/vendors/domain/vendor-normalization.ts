import {
  normalizeCode,
  normalizeEmail,
  normalizePhone,
  normalizeTextKey,
  optionalText,
  toSmartTitleCase,
} from '../../../common/normalization';

function shouldApplySmartCase(value: string) {
  const lettersOnly = value.replace(/[^A-Za-z]/g, '');
  if (!lettersOnly) {
    return false;
  }
  return lettersOnly === lettersOnly.toUpperCase() || lettersOnly === lettersOnly.toLowerCase();
}

export function normalizeVendorCompanyName(value: unknown) {
  const cleaned = optionalText(value);
  if (!cleaned) {
    return null;
  }
  return shouldApplySmartCase(cleaned) ? toSmartTitleCase(cleaned) : cleaned;
}

export function normalizeVendorNameKey(value: unknown) {
  return normalizeTextKey(value);
}

export function normalizeVendorOfficeName(value: unknown) {
  const cleaned = optionalText(value);
  if (!cleaned) {
    return null;
  }
  return shouldApplySmartCase(cleaned) ? toSmartTitleCase(cleaned) : cleaned;
}

export function normalizeVendorLocationName(value: unknown) {
  const cleaned = optionalText(value);
  return cleaned ? toSmartTitleCase(cleaned) : null;
}

export function normalizeVendorContactName(value: unknown) {
  const cleaned = optionalText(value);
  return cleaned ? toSmartTitleCase(cleaned) : null;
}

export function normalizeVendorDesignation(value: unknown) {
  const cleaned = optionalText(value);
  return cleaned ? toSmartTitleCase(cleaned) : null;
}

export function normalizeVendorSalutation(value: unknown) {
  const cleaned = optionalText(value);
  return cleaned ? toSmartTitleCase(cleaned) : null;
}

export function normalizeVendorFreeText(value: unknown) {
  return optionalText(value);
}

export function normalizeVendorAddress(value: unknown) {
  return optionalText(value);
}

export function normalizeVendorNotes(value: unknown) {
  return optionalText(value);
}

export function normalizeVendorExternalCode(value: unknown) {
  return normalizeCode(value);
}

export function normalizeVendorEmail(value: unknown) {
  return normalizeEmail(value);
}

export function normalizeVendorPhone(value: unknown) {
  return normalizePhone(value);
}

export function normalizeVendorSheetTitle(value: unknown) {
  const cleaned = optionalText(value);
  return cleaned?.replace(/\s+Above\s+\d+\s*years/i, '') ?? null;
}
