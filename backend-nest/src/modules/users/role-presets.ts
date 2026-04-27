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
  'vendors',
  'rate-sheets',
  'profile',
  'admin-users',
  'admin-roles',
  'admin-ports',
] as const;

export const OPERATOR_MODULES = [
  'dashboard',
  'inquiries',
  'rfq',
  'comparison',
  'customer-quote',
  'vendors',
  'rate-sheets',
  'profile',
] as const;
