import { BadRequestException } from '@nestjs/common';
import { VendorContactInputDto } from '../dto/vendor-contact-input.dto';
import {
  normalizeVendorExternalCode,
  normalizeVendorCompanyName,
  normalizeVendorContactName,
  normalizeVendorLocationName,
  normalizeVendorOfficeName,
} from './vendor-normalization';

export function requireVendorCompanyName(value: unknown) {
  const cleaned = normalizeVendorCompanyName(value);
  if (!cleaned) {
    throw new BadRequestException('Company name is required');
  }
  return cleaned;
}

export function requireVendorOfficeName(value: unknown) {
  const cleaned = normalizeVendorOfficeName(value);
  if (!cleaned) {
    throw new BadRequestException('Office name is required');
  }
  return cleaned;
}

export function resolveVendorOfficeName(input: {
  officeName?: unknown;
  cityName?: unknown;
  stateName?: unknown;
  countryName?: unknown;
  externalCode?: unknown;
  fallbackOfficeName?: unknown;
}) {
  const explicitOfficeName = normalizeVendorOfficeName(input.officeName);
  if (explicitOfficeName) {
    return explicitOfficeName;
  }

  const locationName =
    normalizeVendorLocationName(input.cityName) ??
    normalizeVendorLocationName(input.stateName) ??
    normalizeVendorLocationName(input.countryName);
  if (locationName) {
    return locationName;
  }

  const externalCode = normalizeVendorExternalCode(input.externalCode);
  if (externalCode) {
    return externalCode;
  }

  const fallbackOfficeName = normalizeVendorOfficeName(
    input.fallbackOfficeName,
  );
  if (fallbackOfficeName) {
    return fallbackOfficeName;
  }

  throw new BadRequestException(
    'Office name could not be derived. Add a city, state, country, or external code.',
  );
}

export function requireVendorContactName(value: unknown) {
  const cleaned = normalizeVendorContactName(value);
  if (!cleaned) {
    throw new BadRequestException('Contact name is required');
  }
  return cleaned;
}

export function assertSinglePrimaryContact(contacts?: VendorContactInputDto[]) {
  if (!contacts || contacts.length === 0) {
    return;
  }

  const primaryCount = contacts.filter((contact) => contact.isPrimary).length;
  if (primaryCount > 1) {
    throw new BadRequestException(
      'Only one primary contact is allowed per office',
    );
  }
}
