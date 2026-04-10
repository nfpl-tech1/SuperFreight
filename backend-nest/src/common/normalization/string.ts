import { isNullishToken } from './nullish';

export function normalizeWhitespace(value: string) {
  return value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

export function optionalText(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const cleaned = normalizeWhitespace(String(value));
  if (!cleaned || isNullishToken(cleaned)) {
    return null;
  }

  return cleaned;
}

export function normalizeTextKey(value: unknown) {
  return (
    optionalText(value)
      ?.toUpperCase()
      .replace(/&/g, ' AND ')
      .replace(/[^A-Z0-9]+/g, ' ')
      .trim() ?? ''
  );
}
