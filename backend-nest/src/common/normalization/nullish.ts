const NULLISH_TOKENS = new Set([
  '',
  '-',
  '--',
  'n/a',
  'na',
  'n.a.',
  'nil',
  'null',
  'none',
]);

export function isNullishToken(value: string) {
  return NULLISH_TOKENS.has(value.trim().toLowerCase());
}
