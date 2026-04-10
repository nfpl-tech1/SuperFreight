import { optionalText } from './string';

const TRUE_TOKENS = new Set(['1', 'y', 'yes', 'true']);
const FALSE_TOKENS = new Set(['0', 'n', 'no', 'false']);

export function parseBooleanLike(value: unknown): boolean | null {
  const cleaned = optionalText(value)?.toLowerCase();
  if (!cleaned) {
    return null;
  }
  if (TRUE_TOKENS.has(cleaned)) {
    return true;
  }
  if (FALSE_TOKENS.has(cleaned)) {
    return false;
  }
  return null;
}

export function parseYesFlag(value: unknown) {
  return parseBooleanLike(value) === true;
}
