import { optionalText } from './string';

export function normalizePhone(value: unknown): string | null {
  const cleaned = optionalText(value);
  if (!cleaned) {
    return null;
  }

  const hasLeadingPlus = cleaned.startsWith('+');
  const digits = cleaned.replace(/\D/g, '');
  if (!digits) {
    return null;
  }

  return `${hasLeadingPlus ? '+' : ''}${digits}`;
}

export function extractPhoneNumbers(value: unknown) {
  const cleaned = optionalText(value);
  if (!cleaned) {
    return [];
  }

  return Array.from(
    new Set(
      cleaned
        .split(/[;,/]/)
        .map((part) => normalizePhone(part))
        .filter((part): part is string => Boolean(part)),
    ),
  );
}
