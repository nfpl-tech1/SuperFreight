import { optionalText } from './string';

const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

const GENERIC_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'icloud.com',
]);

export function normalizeEmail(value: unknown): string | null {
  const cleaned = optionalText(value);
  return cleaned ? cleaned.toLowerCase() : null;
}

export function extractEmails(value: unknown) {
  const cleaned = optionalText(value);
  if (!cleaned) {
    return [];
  }

  return Array.from(
    new Set((cleaned.match(EMAIL_REGEX) ?? []).map((match) => match.toLowerCase())),
  );
}

export function getEmailDomain(email: string | null | undefined) {
  const normalized = normalizeEmail(email);
  return normalized?.split('@')[1] ?? null;
}

export function isGenericEmailDomain(email: string | null | undefined) {
  const domain = getEmailDomain(email);
  return domain ? GENERIC_EMAIL_DOMAINS.has(domain) : false;
}
