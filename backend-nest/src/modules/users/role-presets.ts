export const ROLE_NAMES = {
  ADMIN: 'Operations Admin',
  OPERATOR: 'Freight Operator',
} as const;

export const SYSTEM_MODULES = [
  'dashboard',
  'inquiries',
  'rfq',
  'comparison',
  'customer-quote',
  'rate-sheets',
  'admin-users',
  'admin-roles',
] as const;

export const OPERATOR_MODULES = [
  'dashboard',
  'inquiries',
  'rfq',
  'comparison',
  'customer-quote',
  'rate-sheets',
] as const;
