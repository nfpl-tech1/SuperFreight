import { optionalText } from './string';

export function normalizeCode(value: unknown): string | null {
  const cleaned = optionalText(value);
  return cleaned ? cleaned.toUpperCase() : null;
}
