"use client";

import { ApiError } from "@/lib/api/request";
import type {
  UpsertVendorCcRecipientPayload,
  UpsertVendorContactPayload,
  UpsertVendorOfficePayload,
  VendorCapabilityFlags,
  VendorCatalogPage,
  VendorContact,
  VendorDetail,
  VendorOfficeDetail,
  VendorTypeDefinition,
} from "@/lib/api";

export type VendorFilters = {
  search: string;
  typeCode: string;
  portId: string;
};

export type VendorCatalogItem = VendorCatalogPage["items"][number];

export type VendorDraft = {
  companyName: string;
  notes: string;
  isActive: boolean;
};

export type ContactDraft = {
  contactName: string;
  salutation: string;
  designation: string;
  emailPrimary: string;
  emailSecondary: string;
  mobile1: string;
  mobile2: string;
  landline: string;
  whatsappNumber: string;
  isPrimary: boolean;
  isActive: boolean;
  notes: string;
};

export type CcDraft = {
  email: string;
  isActive: boolean;
};

export type OfficeDraft = {
  officeName: string;
  cityName: string;
  stateName: string;
  countryName: string;
  addressRaw: string;
  externalCode: string;
  specializationRaw: string;
  isActive: boolean;
  isPrimary: boolean;
  capabilities: VendorCapabilityFlags;
  typeIds: string[];
  portIds: string[];
  contacts: ContactDraft[];
  ccRecipients: CcDraft[];
};

export const PAGE_SIZE = 10;
export const ALL_FILTER = "ALL";

export const capabilityConfig: Array<{
  key: keyof VendorCapabilityFlags;
  label: string;
}> = [
  { key: "doesProjectCargo", label: "Project Cargo" },
  { key: "doesOwnConsolidation", label: "Own Consolidation" },
  { key: "doesOwnTransportation", label: "Own Transportation" },
  { key: "doesOwnWarehousing", label: "Own Warehousing" },
  { key: "doesOwnCustomClearance", label: "Own Custom Clearance" },
];

export function isVisibleVendorType(
  vendorType: Pick<VendorTypeDefinition, "typeCode">,
) {
  return vendorType.typeCode !== "CARRIER";
}

export function getVisibleVendorTypes(vendorTypes: VendorTypeDefinition[]) {
  return vendorTypes.filter(isVisibleVendorType);
}

export function capabilityLabels(capabilities: VendorCapabilityFlags) {
  return capabilityConfig
    .filter((capability) => capabilities[capability.key])
    .map((capability) => capability.label);
}

export function emptyContactDraft(): ContactDraft {
  return {
    contactName: "",
    salutation: "",
    designation: "",
    emailPrimary: "",
    emailSecondary: "",
    mobile1: "",
    mobile2: "",
    landline: "",
    whatsappNumber: "",
    isPrimary: false,
    isActive: true,
    notes: "",
  };
}

export function emptyOfficeDraft(): OfficeDraft {
  return {
    officeName: "",
    cityName: "",
    stateName: "",
    countryName: "",
    addressRaw: "",
    externalCode: "",
    specializationRaw: "",
    isActive: true,
    isPrimary: false,
    capabilities: {
      isIataCertified: false,
      doesSeaFreight: false,
      doesProjectCargo: false,
      doesOwnConsolidation: false,
      doesOwnTransportation: false,
      doesOwnWarehousing: false,
      doesOwnCustomClearance: false,
    },
    typeIds: [],
    portIds: [],
    contacts: [emptyContactDraft()],
    ccRecipients: [],
  };
}

export function vendorDraftFromDetail(vendor: VendorDetail): VendorDraft {
  return {
    companyName: vendor.companyName,
    notes: vendor.notes ?? "",
    isActive: vendor.isActive,
  };
}

export function contactDraftFromApi(contact: VendorContact): ContactDraft {
  return {
    contactName: contact.contactName,
    salutation: contact.salutation ?? "",
    designation: contact.designation ?? "",
    emailPrimary: contact.emailPrimary ?? "",
    emailSecondary: contact.emailSecondary ?? "",
    mobile1: contact.mobile1 ?? "",
    mobile2: contact.mobile2 ?? "",
    landline: contact.landline ?? "",
    whatsappNumber: contact.whatsappNumber ?? "",
    isPrimary: contact.isPrimary,
    isActive: contact.isActive,
    notes: contact.notes ?? "",
  };
}

export function officeDraftFromDetail(office: VendorOfficeDetail): OfficeDraft {
  return {
    officeName: office.officeName,
    cityName: office.cityName ?? "",
    stateName: office.stateName ?? "",
    countryName: office.countryName ?? "",
    addressRaw: office.addressRaw ?? "",
    externalCode: office.externalCode ?? "",
    specializationRaw: office.specializationRaw ?? "",
    isActive: office.isActive,
    isPrimary: office.isPrimary,
    capabilities: office.capabilities,
    typeIds: office.vendorTypes.map((type) => type.id),
    portIds: office.ports.map((port) => port.id),
    contacts:
      office.contacts.length > 0
        ? office.contacts.map((contact) => contactDraftFromApi(contact))
        : [emptyContactDraft()],
    ccRecipients: office.ccRecipients.map((recipient) => ({
      email: recipient.email,
      isActive: recipient.isActive,
    })),
  };
}

export function toVendorPayload(draft: VendorDraft) {
  return {
    companyName: draft.companyName.trim(),
    isActive: draft.isActive,
    notes: emptyToUndefined(draft.notes),
  };
}

export function buildOfficeNameCandidate(
  draft: Pick<
    OfficeDraft,
    "officeName" | "cityName" | "stateName" | "countryName" | "externalCode"
  >,
) {
  const locationName = [draft.cityName, draft.stateName, draft.countryName]
    .map((value) => value.trim())
    .find((value) => value.length > 0);

  if (locationName) {
    return locationName;
  }

  const externalCode = draft.externalCode.trim();
  if (externalCode) {
    return externalCode;
  }

  const officeName = draft.officeName.trim();
  return officeName || undefined;
}

export function toOfficePayload(draft: OfficeDraft): UpsertVendorOfficePayload {
  const contacts = draft.contacts
    .filter((contact) => hasAnyContactValue(contact))
    .map<UpsertVendorContactPayload>((contact) => ({
      contactName: contact.contactName.trim(),
      salutation: emptyToUndefined(contact.salutation),
      designation: emptyToUndefined(contact.designation),
      emailPrimary: emptyToUndefined(contact.emailPrimary),
      emailSecondary: emptyToUndefined(contact.emailSecondary),
      mobile1: emptyToUndefined(contact.mobile1),
      mobile2: emptyToUndefined(contact.mobile2),
      landline: emptyToUndefined(contact.landline),
      whatsappNumber: emptyToUndefined(contact.whatsappNumber),
      isPrimary: contact.isPrimary,
      isActive: contact.isActive,
      notes: emptyToUndefined(contact.notes),
    }));

  const ccRecipients = draft.ccRecipients
    .filter((recipient) => recipient.email.trim())
    .map<UpsertVendorCcRecipientPayload>((recipient) => ({
      email: recipient.email.trim(),
      isActive: recipient.isActive,
    }));

  return {
    officeName: buildOfficeNameCandidate(draft),
    cityName: emptyToUndefined(draft.cityName),
    stateName: emptyToUndefined(draft.stateName),
    countryName: emptyToUndefined(draft.countryName),
    addressRaw: emptyToUndefined(draft.addressRaw),
    externalCode: emptyToUndefined(draft.externalCode),
    specializationRaw: emptyToUndefined(draft.specializationRaw),
    isActive: draft.isActive,
    isPrimary: draft.isPrimary,
    isIataCertified: draft.capabilities.isIataCertified,
    doesSeaFreight: draft.capabilities.doesSeaFreight,
    doesProjectCargo: draft.capabilities.doesProjectCargo,
    doesOwnConsolidation: draft.capabilities.doesOwnConsolidation,
    doesOwnTransportation: draft.capabilities.doesOwnTransportation,
    doesOwnWarehousing: draft.capabilities.doesOwnWarehousing,
    doesOwnCustomClearance: draft.capabilities.doesOwnCustomClearance,
    typeIds: draft.typeIds,
    portIds: draft.portIds,
    contacts,
    ccRecipients,
  };
}

export function emptyToUndefined(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function hasAnyContactValue(contact: ContactDraft) {
  return [
    contact.contactName,
    contact.emailPrimary,
    contact.emailSecondary,
    contact.mobile1,
    contact.mobile2,
    contact.landline,
    contact.whatsappNumber,
    contact.designation,
    contact.notes,
  ].some((value) => value.trim().length > 0);
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError || error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export function getVendorCountsLabel(vendor: VendorCatalogItem) {
  return `${vendor.officeCount} offices / ${vendor.contactCount} contacts`;
}

export function getPrimaryOfficeLabel(vendor: VendorCatalogItem) {
  const officeName = vendor.primaryOffice?.officeName ?? "Not set";
  const countryName = vendor.primaryOffice?.countryName;

  return countryName ? `${officeName}, ${countryName}` : officeName;
}

export function getCountriesLabel(vendor: VendorCatalogItem) {
  return vendor.countries.length > 0 ? vendor.countries.join(", ") : "Unassigned";
}

export function getPrimaryContactLabel(vendor: VendorCatalogItem) {
  return vendor.primaryContact?.contactName ?? "No primary contact";
}
