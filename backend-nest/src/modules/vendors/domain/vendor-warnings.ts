import { getEmailDomain, isGenericEmailDomain } from '../../../common/normalization';
import { normalizeVendorCompanyName } from './vendor-normalization';

export function inferVendorCompanyNameFromEmail(email: string | null | undefined) {
  const normalizedEmail = email?.toLowerCase() ?? '';
  const domain = getEmailDomain(normalizedEmail);
  if (!domain || isGenericEmailDomain(normalizedEmail)) {
    return null;
  }

  const companyToken = domain.includes('.com')
    ? domain.split('.com')[0]
    : domain.split('.')[0];

  if (!companyToken) {
    return null;
  }

  return normalizeVendorCompanyName(
    companyToken
      .split(/[-_.]+/)
      .filter(Boolean)
      .join(' '),
  );
}
