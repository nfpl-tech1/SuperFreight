"use client";

import { departments } from "@/data/departments";
import type {
  Inquiry,
  Rfq,
  VendorDetail,
  VendorListItem,
  VendorListQuery,
  VendorLocationOptionsQuery,
} from "@/lib/api";
import {
  planQuoteTypesForInquiry,
  type QuoteTypeRecommendation,
} from "@/lib/inquiryQuotePlanning";
import {
  createQuoteDraftState,
  type QuoteDraftState,
} from "@/components/rfq/lib/rfq-wizard.helpers";
import {
  getEffectiveVendorCategoryNames,
  getVisibleVendorFilterKeys,
} from "@/components/rfq/vendor-selection-profile";
import type {
  FilterableVendor,
  FormValues,
  ResponseField,
  VendorDispatchOfficeOption,
  VendorDispatchResolution,
  VendorDispatchTarget,
  VendorFilterCriteria,
  VendorLookupBundle,
  VendorSelectionProfile,
  WizardStep,
  YesNoAny,
} from "@/types/rfq";
import type {
  VendorCcRecipient,
  VendorContact,
  VendorOfficeDetail,
} from "@/lib/api";

function resolveSearchMode(criteria: VendorFilterCriteria) {
  return criteria.searchMode?.trim() || "all";
}

function resolveVendorTypeMode(criteria: VendorFilterCriteria) {
  return criteria.vendorTypeMode?.trim() || "relevant";
}

function isCategoryVendorTypeMode(vendorTypeMode: string) {
  return vendorTypeMode.startsWith("category:");
}

function getCategoryNamesForVendorTypeMode(
  vendorTypeMode: string,
  criteria: VendorFilterCriteria,
  selectionProfile?: VendorSelectionProfile,
) {
  if (isCategoryVendorTypeMode(vendorTypeMode)) {
    return [vendorTypeMode.slice("category:".length)].filter(Boolean);
  }

  if (vendorTypeMode === "relevant" || vendorTypeMode === "all") {
    return selectionProfile
      ? getEffectiveVendorCategoryNames(criteria.categories, selectionProfile)
      : criteria.categories;
  }

  if (vendorTypeMode === "shipping_line_nvocc") {
    return ["Shipping Line", "Carrier"];
  }

  return [];
}

export function usesLocationLookupMode(criteria: VendorFilterCriteria) {
  const searchMode = resolveSearchMode(criteria);
  return searchMode === "port" || searchMode === "origin" || searchMode === "destination";
}

export type RfqDepartmentSummary = {
  draftCount: number;
  sentCount: number;
};

export type RecommendedQuoteType = QuoteTypeRecommendation & {
  draftedCount: number;
  draftCount: number;
  sentCount: number;
  isReady: boolean;
};

export function buildVendorLookups(
  vendors: FilterableVendor[],
  categories: string[] = [],
): VendorLookupBundle {
  return {
    tradeDirections: Array.from(
      new Set(vendors.flatMap((vendor) => vendor.tradeDirections)),
    ),
    categories:
      categories.length > 0
        ? categories
        : Array.from(new Set(vendors.flatMap((vendor) => vendor.categories))),
    showWcaYears: vendors.some((vendor) => vendor.wcaYears > 0),
  };
}

function mapYesNoAnyToBoolean(value: YesNoAny) {
  if (value === "Any") {
    return undefined;
  }

  return value === "Yes";
}

export function buildVendorListQuery(
  criteria: VendorFilterCriteria,
  vendorTypeCodeByName: Record<string, string>,
  page: number,
  pageSize: number,
  selectionProfile?: VendorSelectionProfile,
): VendorListQuery {
  const searchMode = resolveSearchMode(criteria);
  const vendorTypeMode = resolveVendorTypeMode(criteria);
  const visibleFilterKeys = new Set(
    selectionProfile ? getVisibleVendorFilterKeys(selectionProfile) : [],
  );
  const effectiveCategoryNames = getCategoryNamesForVendorTypeMode(
    vendorTypeMode,
    criteria,
    selectionProfile,
  );
  const typeCodes = Array.from(
    new Set(
      effectiveCategoryNames
        .map((category) => vendorTypeCodeByName[category])
        .filter((typeCode): typeCode is string => Boolean(typeCode)),
    ),
  );
  const usesLocationLookup = usesLocationLookupMode(criteria);
  const locationRole =
    searchMode === "origin"
      ? "ORIGIN"
      : searchMode === "destination"
        ? "DESTINATION"
        : selectionProfile?.locationRole;

  return {
    page,
    pageSize,
    search:
      !usesLocationLookup && criteria.locationQuery.trim()
        ? criteria.locationQuery.trim()
        : undefined,
    quoteTypeContext: selectionProfile?.quoteTypeContext,
    locationKind: usesLocationLookup
      ? criteria.selectedLocationKind || selectionProfile?.locationKind || undefined
      : undefined,
    locationId: usesLocationLookup ? criteria.selectedLocationId || undefined : undefined,
    locationCountryName: usesLocationLookup
      ? criteria.selectedLocationCountryName || undefined
      : undefined,
    locationRole,
    locationScope:
      usesLocationLookup &&
      (criteria.selectedLocationId || criteria.selectedLocationCountryName)
        ? criteria.locationScope
        : undefined,
    isActive:
      !selectionProfile || visibleFilterKeys.has("status")
        ? criteria.status === "Any"
          ? undefined
          : criteria.status === "Active"
        : undefined,
    typeCodes: typeCodes.length > 0 ? typeCodes : undefined,
    isIataCertified:
      !selectionProfile || visibleFilterKeys.has("iataCertified")
        ? mapYesNoAnyToBoolean(criteria.iataCertified)
        : undefined,
    doesSeaFreight:
      !selectionProfile || visibleFilterKeys.has("seaFreight")
        ? mapYesNoAnyToBoolean(criteria.seaFreight)
        : undefined,
    doesProjectCargo:
      !selectionProfile || visibleFilterKeys.has("projectCargo")
        ? mapYesNoAnyToBoolean(criteria.projectCargo)
        : undefined,
    doesOwnConsolidation:
      !selectionProfile || visibleFilterKeys.has("ownConsolidation")
        ? mapYesNoAnyToBoolean(criteria.ownConsolidation)
        : undefined,
    doesOwnTransportation:
      !selectionProfile || visibleFilterKeys.has("ownTransport")
        ? mapYesNoAnyToBoolean(criteria.ownTransport)
        : undefined,
    doesOwnWarehousing:
      !selectionProfile || visibleFilterKeys.has("ownWarehouse")
        ? mapYesNoAnyToBoolean(criteria.ownWarehouse)
        : undefined,
    doesOwnCustomClearance:
      !selectionProfile || visibleFilterKeys.has("ownCustoms")
        ? mapYesNoAnyToBoolean(criteria.ownCustoms)
        : undefined,
  };
}

export function buildVendorLocationOptionsQuery(
  criteria: VendorFilterCriteria,
  vendorTypeCodeByName: Record<string, string>,
  selectionProfile: VendorSelectionProfile,
  page = 1,
  pageSize = 20,
): VendorLocationOptionsQuery {
  const searchMode = resolveSearchMode(criteria);
  const vendorTypeMode = resolveVendorTypeMode(criteria);
  const effectiveCategoryNames = getCategoryNamesForVendorTypeMode(
    vendorTypeMode,
    criteria,
    selectionProfile,
  );
  const typeCodes = Array.from(
    new Set(
      effectiveCategoryNames
        .map((category) => vendorTypeCodeByName[category])
        .filter((typeCode): typeCode is string => Boolean(typeCode)),
    ),
  );

  return {
    page,
    pageSize,
    quoteTypeContext: selectionProfile.quoteTypeContext,
    locationKind: selectionProfile.locationKind,
    locationRole:
      searchMode === "origin"
        ? "ORIGIN"
        : searchMode === "destination"
          ? "DESTINATION"
          : selectionProfile.locationRole,
    portMode: selectionProfile.portMode ?? undefined,
    search: criteria.locationQuery.trim() || undefined,
    typeCodes: typeCodes.length > 0 ? typeCodes : undefined,
  };
}

export function getSuggestedLocationSearch(
  selectionProfile: VendorSelectionProfile,
  formValues: FormValues,
  inquiry?: Pick<Inquiry, "origin" | "destination"> | null,
) {
  const primaryValue =
    selectionProfile.locationRole === "DESTINATION"
      ? formValues.destination
      : formValues.source;

  if (typeof primaryValue === "string" && primaryValue.trim()) {
    return primaryValue.trim();
  }

  const inquiryValue =
    selectionProfile.locationRole === "DESTINATION"
      ? inquiry?.destination
      : inquiry?.origin;

  return inquiryValue?.trim() ?? "";
}

export function shouldLoadVendorResults(criteria: VendorFilterCriteria) {
  void criteria;
  return true;
}

export function mergeVendorDirectoryEntries(
  currentDirectory: Record<string, FilterableVendor>,
  vendors: FilterableVendor[],
) {
  if (vendors.length === 0) {
    return currentDirectory;
  }

  let changed = false;
  const nextDirectory = { ...currentDirectory };

  for (const vendor of vendors) {
    if (nextDirectory[vendor.id] !== vendor) {
      nextDirectory[vendor.id] = vendor;
      changed = true;
    }
  }

  return changed ? nextDirectory : currentDirectory;
}

function buildVendorLocation(vendor: VendorListItem) {
  const parts = [
    vendor.primaryOffice?.cityName,
    vendor.primaryOffice?.stateName,
    vendor.primaryOffice?.countryName,
  ]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));

  const seen = new Set<string>();
  const dedupedParts = parts.filter((part) => {
    const normalized = part.toLowerCase();
    if (seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });

  if (dedupedParts.length > 0) {
    return dedupedParts.join(", ");
  }

  return vendor.countries.join(", ") || "Location not set";
}

export function mapVendorListItemToFilterableVendor(
  vendor: VendorListItem,
): FilterableVendor {
  return {
    id: vendor.id,
    name: vendor.companyName,
    locationMaster: buildVendorLocation(vendor),
    country: vendor.primaryOffice?.countryName ?? vendor.countries[0] ?? null,
    primaryContactName:
      vendor.primaryContact?.contactName ?? "Primary contact not set",
    primaryContactEmail:
      vendor.primaryContact?.emailPrimary ?? "Email not available",
    tradeDirections: [],
    categories: vendor.vendorTypes.map((vendorType) => vendorType.typeName),
    status: vendor.isActive ? "Active" : "Inactive",
    wcaYears: 0,
    iataCertified: vendor.capabilities.isIataCertified,
    seaFreight: vendor.capabilities.doesSeaFreight,
    projectCargo: vendor.capabilities.doesProjectCargo,
    ownConsolidation: vendor.capabilities.doesOwnConsolidation,
    ownTransport: vendor.capabilities.doesOwnTransportation,
    ownWarehouse: vendor.capabilities.doesOwnWarehousing,
    ownCustoms: vendor.capabilities.doesOwnCustomClearance,
  };
}

function pickPrimaryOfficeFromDetail(vendor: VendorDetail) {
  return (
    vendor.offices.find((office) => office.isPrimary) ??
    vendor.offices[0] ??
    null
  );
}

function pickPrimaryContactFromDetail(vendor: VendorDetail) {
  const offices = vendor.offices;

  for (const office of offices) {
    const primaryContact = office.contacts.find((contact) => contact.isPrimary);
    if (primaryContact) {
      return primaryContact;
    }
  }

  for (const office of offices) {
    if (office.contacts[0]) {
      return office.contacts[0];
    }
  }

  return null;
}

export function mapVendorDetailToFilterableVendor(
  vendor: VendorDetail,
): FilterableVendor {
  const primaryOffice = pickPrimaryOfficeFromDetail(vendor);
  const primaryContact = pickPrimaryContactFromDetail(vendor);

  return {
    id: vendor.id,
    name: vendor.companyName,
    locationMaster: primaryOffice
      ? [
          primaryOffice.cityName,
          primaryOffice.stateName,
          primaryOffice.countryName,
        ]
          .map((part) => part?.trim())
          .filter((part): part is string => Boolean(part))
          .filter((part, index, parts) =>
            parts.findIndex((candidate) => candidate.toLowerCase() === part.toLowerCase()) === index,
          )
          .join(", ")
      : vendor.countries.join(", ") || "Location not set",
    country: primaryOffice?.countryName ?? vendor.countries[0] ?? null,
    primaryContactName:
      primaryContact?.contactName ?? "Primary contact not set",
    primaryContactEmail:
      primaryContact?.emailPrimary ?? "Email not available",
    tradeDirections: [],
    categories: Array.from(
      new Set(
        vendor.offices.flatMap((office) =>
          office.vendorTypes.map((vendorType) => vendorType.typeName),
        ),
      ),
    ),
    status: vendor.isActive ? "Active" : "Inactive",
    wcaYears: 0,
    iataCertified: vendor.offices.some((office) => office.capabilities.isIataCertified),
    seaFreight: vendor.offices.some((office) => office.capabilities.doesSeaFreight),
    projectCargo: vendor.offices.some((office) => office.capabilities.doesProjectCargo),
    ownConsolidation: vendor.offices.some((office) => office.capabilities.doesOwnConsolidation),
    ownTransport: vendor.offices.some((office) => office.capabilities.doesOwnTransportation),
    ownWarehouse: vendor.offices.some((office) => office.capabilities.doesOwnWarehousing),
    ownCustoms: vendor.offices.some((office) => office.capabilities.doesOwnCustomClearance),
  };
}

function normalizeMatchText(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function buildOfficeLocationLabel(office: VendorOfficeDetail) {
  const parts = [office.cityName, office.stateName, office.countryName]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));

  const seen = new Set<string>();
  const deduped = parts.filter((part) => {
    const normalized = part.toLowerCase();
    if (seen.has(normalized)) {
      return false;
    }
    seen.add(normalized);
    return true;
  });

  return deduped.join(", ") || office.officeName;
}

function pickSendableContact(
  office: VendorOfficeDetail,
): { contact: VendorContact; email: string } | null {
  const activeContacts = office.contacts.filter((contact) => contact.isActive);

  for (const contact of activeContacts) {
    const email = contact.emailPrimary?.trim() || contact.emailSecondary?.trim();
    if (email) {
      return { contact, email };
    }
  }

  return null;
}

function collectCcEmails(office: VendorOfficeDetail, primaryEmail: string) {
  return Array.from(
    new Set(
      office.ccRecipients
        .filter((recipient) => recipient.isActive)
        .map((recipient: VendorCcRecipient) => recipient.email?.trim() ?? "")
        .filter((email) => Boolean(email) && email.toLowerCase() !== primaryEmail.toLowerCase()),
    ),
  );
}

type DispatchCandidate = {
  office: VendorOfficeDetail;
  contact: VendorContact;
  email: string;
  ccEmails: string[];
  resolution: VendorDispatchResolution;
  resolutionLabel: string;
  score: number;
};

function rankOfficeCandidate(
  office: VendorOfficeDetail,
  criteria: VendorFilterCriteria,
  selectionProfile: VendorSelectionProfile,
  contact: VendorContact,
  email: string,
): DispatchCandidate {
  const selectedLocationId = criteria.selectedLocationId;
  const selectedLocationCountry = normalizeMatchText(criteria.selectedLocationCountryName);
  const officeCountry = normalizeMatchText(office.countryName);
  const locationKind = criteria.selectedLocationKind || selectionProfile.locationKind;
  const hasExactPortMatch =
    locationKind === "PORT" &&
    Boolean(selectedLocationId) &&
    office.ports.some((port) => port.id === selectedLocationId);
  const hasExactServiceMatch =
    locationKind === "SERVICE_LOCATION" &&
    Boolean(selectedLocationId) &&
    office.serviceLocations.some((location) => location.id === selectedLocationId);

  if (hasExactPortMatch || hasExactServiceMatch) {
    return {
      office,
      contact,
      email,
      ccEmails: collectCcEmails(office, email),
      resolution: "EXACT_LOCATION",
      resolutionLabel: "Exact location match",
      score: 500,
    };
  }

  if (selectedLocationCountry && officeCountry && selectedLocationCountry === officeCountry) {
    return {
      office,
      contact,
      email,
      ccEmails: collectCcEmails(office, email),
      resolution: "COUNTRY_MATCH",
      resolutionLabel: "Country match",
      score: office.isPrimary ? 320 : 300,
    };
  }

  if (office.isPrimary) {
    return {
      office,
      contact,
      email,
      ccEmails: collectCcEmails(office, email),
      resolution: "PRIMARY_OFFICE",
      resolutionLabel: "Primary office fallback",
      score: 200,
    };
  }

  return {
    office,
    contact,
    email,
    ccEmails: collectCcEmails(office, email),
    resolution: "FIRST_AVAILABLE",
    resolutionLabel: "First sendable office",
    score: 100,
  };
}

export function buildVendorDispatchTarget(
  vendor: VendorDetail,
  criteria: VendorFilterCriteria,
  selectionProfile: VendorSelectionProfile,
  selectedOfficeIds?: string[],
): VendorDispatchTarget {
  const activeOffices = vendor.offices.filter((office) => office.isActive);
  const candidates = activeOffices
    .map((office) => {
      const sendable = pickSendableContact(office);
      if (!sendable) {
        return null;
      }

      return rankOfficeCandidate(
        office,
        criteria,
        selectionProfile,
        sendable.contact,
        sendable.email,
      );
    })
    .filter((candidate): candidate is DispatchCandidate => Boolean(candidate))
    .sort((left, right) => right.score - left.score);

  const availableOffices: VendorDispatchOfficeOption[] = candidates.map((candidate) => ({
    officeId: candidate.office.id,
    officeName: candidate.office.officeName,
    locationLabel: buildOfficeLocationLabel(candidate.office),
    contactName: candidate.contact.contactName,
    contactEmail: candidate.email,
    ccEmails: candidate.ccEmails,
    resolutionLabel: candidate.resolutionLabel,
    isPrimary: candidate.office.isPrimary,
  }));

  const hasExplicitSelection = Array.isArray(selectedOfficeIds);
  const normalizedSelectedOfficeIds = Array.from(
    new Set((selectedOfficeIds ?? []).filter(Boolean)),
  );

  if (hasExplicitSelection) {
    const selectedCandidates = candidates.filter((candidate) =>
      normalizedSelectedOfficeIds.includes(candidate.office.id),
    );

    if (selectedCandidates.length > 0) {
      const primarySelectedCandidate = selectedCandidates[0];

      return {
        vendorId: vendor.id,
        vendorName: vendor.companyName,
        officeId: primarySelectedCandidate.office.id,
        selectedOfficeIds: selectedCandidates.map((candidate) => candidate.office.id),
        officeName: primarySelectedCandidate.office.officeName,
        officeLocation: buildOfficeLocationLabel(primarySelectedCandidate.office),
        contactName: primarySelectedCandidate.contact.contactName,
        contactEmail: primarySelectedCandidate.email,
        ccEmails: primarySelectedCandidate.ccEmails,
        selectedOffices: selectedCandidates.map((candidate) => ({
          officeId: candidate.office.id,
          officeName: candidate.office.officeName,
          locationLabel: buildOfficeLocationLabel(candidate.office),
          contactName: candidate.contact.contactName,
          contactEmail: candidate.email,
          ccEmails: candidate.ccEmails,
          resolutionLabel: candidate.resolutionLabel,
          isPrimary: candidate.office.isPrimary,
        })),
        resolution: "MANUAL",
        resolutionLabel:
          selectedCandidates.length > 1 ? "Multiple offices selected" : "Manually selected",
        needsAttention: false,
        isLoading: false,
        availableOffices,
      };
    }

    return {
      vendorId: vendor.id,
      vendorName: vendor.companyName,
      officeId: null,
      selectedOfficeIds: [],
      officeName: "No office selected",
      officeLocation: "Select at least one office before sending the RFQ.",
      contactName: "Office selection required",
      contactEmail: "",
      ccEmails: [],
      selectedOffices: [],
      resolution: "UNRESOLVED",
      resolutionLabel: "Select sending offices",
      needsAttention: true,
      isLoading: false,
      availableOffices,
    };
  }

  const chosenCandidate = candidates[0];

  if (!chosenCandidate) {
    return {
      vendorId: vendor.id,
      vendorName: vendor.companyName,
      officeId: null,
      selectedOfficeIds: [],
      officeName: "No sendable office found",
      officeLocation: "Add an active contact email to at least one office.",
      contactName: "Contact email required",
      contactEmail: "",
      ccEmails: [],
      selectedOffices: [],
      resolution: "UNRESOLVED",
      resolutionLabel: "Needs office selection",
      needsAttention: true,
      isLoading: false,
      availableOffices,
    };
  }

  return {
    vendorId: vendor.id,
    vendorName: vendor.companyName,
    officeId: chosenCandidate.office.id,
    selectedOfficeIds: [chosenCandidate.office.id],
    officeName: chosenCandidate.office.officeName,
    officeLocation: buildOfficeLocationLabel(chosenCandidate.office),
    contactName: chosenCandidate.contact.contactName,
    contactEmail: chosenCandidate.email,
    ccEmails: chosenCandidate.ccEmails,
    selectedOffices: [
      {
        officeId: chosenCandidate.office.id,
        officeName: chosenCandidate.office.officeName,
        locationLabel: buildOfficeLocationLabel(chosenCandidate.office),
        contactName: chosenCandidate.contact.contactName,
        contactEmail: chosenCandidate.email,
        ccEmails: chosenCandidate.ccEmails,
        resolutionLabel: chosenCandidate.resolutionLabel,
        isPrimary: chosenCandidate.office.isPrimary,
      },
    ],
    resolution: chosenCandidate.resolution,
    resolutionLabel: chosenCandidate.resolutionLabel,
    needsAttention: false,
    isLoading: false,
    availableOffices,
  };
}

export function buildLoadingVendorDispatchTarget(
  vendorId: string,
  vendorName?: string,
): VendorDispatchTarget {
  return {
    vendorId,
    vendorName: vendorName ?? "Loading vendor...",
    officeId: null,
    selectedOfficeIds: [],
    officeName: "Loading office options",
    officeLocation: "Fetching vendor office details...",
    contactName: "Loading",
    contactEmail: "",
    ccEmails: [],
    selectedOffices: [],
    resolution: "UNRESOLVED",
    resolutionLabel: "Loading office options",
    needsAttention: true,
    isLoading: true,
    availableOffices: [],
  };
}

export function countRfqsByDepartment(rfqs: Rfq[]) {
  return rfqs.reduce<Record<string, RfqDepartmentSummary>>((accumulator, rfq) => {
    const currentSummary = accumulator[rfq.departmentId] ?? {
      draftCount: 0,
      sentCount: 0,
    };

    accumulator[rfq.departmentId] = {
      draftCount: currentSummary.draftCount + (rfq.sent ? 0 : 1),
      sentCount: currentSummary.sentCount + (rfq.sent ? 1 : 0),
    };

    return accumulator;
  }, {});
}

export function getDepartment(departmentId: string) {
  return departments.find((item) => item.id === departmentId) ?? departments[0];
}

export function isQuoteReady(summary?: RfqDepartmentSummary) {
  return ((summary?.draftCount ?? 0) + (summary?.sentCount ?? 0)) > 0;
}

export function getLatestInquiryRfqsByDepartment(rfqs: Rfq[]) {
  return rfqs.reduce<Record<string, Rfq>>((accumulator, rfq) => {
    if (!accumulator[rfq.departmentId]) {
      accumulator[rfq.departmentId] = rfq;
    }
    return accumulator;
  }, {});
}

export function buildResponseFieldsFromRfq(
  departmentId: string,
  rfq: Rfq,
): ResponseField[] {
  const defaults = createQuoteDraftState(getDepartment(departmentId)).responseFields;
  const selectedFieldLabels = new Set(rfq.promptTemplateMeta?.selectedFields ?? []);
  const matchedLabels = new Set<string>();

  const nextFields = defaults.map((field) => {
    const isSelected = selectedFieldLabels.has(field.label);
    if (isSelected) {
      matchedLabels.add(field.label);
    }

    return {
      ...field,
      selected: isSelected,
    };
  });

  const customFields = Array.from(selectedFieldLabels)
    .filter((label) => !matchedLabels.has(label))
    .map((label) => ({
      id: `saved_${departmentId}_${label.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
      label,
      isCustom: true,
      selected: true,
    }));

  return [...nextFields, ...customFields];
}

export function createQuoteDraftFromRfq(
  departmentId: string,
  inquiry: Inquiry | undefined,
  rfq: Rfq,
): QuoteDraftState {
  const department = getDepartment(departmentId);
  const baseDraft = createQuoteDraftState(department, inquiry);

  return {
    formValues: {
      ...baseDraft.formValues,
      ...(rfq.formValues as FormValues),
    },
    responseFields: buildResponseFieldsFromRfq(departmentId, rfq),
    filterCriteria: baseDraft.filterCriteria,
    customCcEmail: baseDraft.customCcEmail,
    mscFields: rfq.promptTemplateMeta?.mscFields ?? baseDraft.mscFields,
    selectedVendorIds: new Set<string>(rfq.vendorIds),
    selectedVendorOfficeIds: {},
    completedSteps: new Set<WizardStep>([
      1,
      ...(rfq.promptTemplateMeta?.selectedFields?.length ? [2 as WizardStep] : []),
      ...(rfq.vendorIds.length > 0 ? [3 as WizardStep] : []),
      ...(rfq.sent ? [4 as WizardStep] : []),
    ]),
  };
}

export function buildInitialQuoteDraftsForInquiry(
  inquiry: Inquiry | undefined,
  primaryDepartmentId: string,
  rfqs: Rfq[],
) {
  const recommendationIds = planQuoteTypesForInquiry(inquiry).recommendations.map(
    (recommendation) => recommendation.departmentId,
  );
  const departmentIds = Array.from(
    new Set([primaryDepartmentId, ...recommendationIds]),
  );

  return departmentIds.reduce<Record<string, QuoteDraftState>>(
    (accumulator, departmentId) => {
      const latestRfq = rfqs.find((rfq) => rfq.departmentId === departmentId);
      accumulator[departmentId] = latestRfq
        ? createQuoteDraftFromRfq(departmentId, inquiry, latestRfq)
        : createQuoteDraftState(getDepartment(departmentId), inquiry);
      return accumulator;
    },
    {},
  );
}

export function resolveQuoteDraft(
  departmentId: string,
  quoteDrafts: Record<string, QuoteDraftState>,
  latestInquiryRfqsByDepartment: Record<string, Rfq>,
  currentInquiry?: Inquiry,
) {
  return (
    quoteDrafts[departmentId] ??
    (latestInquiryRfqsByDepartment[departmentId]
      ? createQuoteDraftFromRfq(
          departmentId,
          currentInquiry,
          latestInquiryRfqsByDepartment[departmentId],
        )
      : createQuoteDraftState(getDepartment(departmentId), currentInquiry))
  );
}

type WizardStepValidationContext = {
  inquiryId: string;
  isFormValid: boolean;
  selectedResponseFieldCount: number;
  selectedVendorCount: number;
};

export function getWizardStepError(
  step: WizardStep,
  validationContext: WizardStepValidationContext,
): string | null {
  switch (step) {
    case 1:
      if (!validationContext.inquiryId) {
        return "Please select an inquiry number.";
      }

      if (!validationContext.isFormValid) {
        return "Please fix form errors before proceeding.";
      }

      return null;
    case 2:
      return validationContext.selectedResponseFieldCount === 0
        ? "Please select at least one response field."
        : null;
    case 3:
      return validationContext.selectedVendorCount === 0
        ? "Please select at least one vendor."
        : null;
    default:
      return null;
  }
}

export function getUnresolvedDispatchTargets(
  dispatchTargets: VendorDispatchTarget[],
): VendorDispatchTarget[] {
  return dispatchTargets.filter(
    (target) =>
      target.isLoading || target.needsAttention || target.selectedOfficeIds.length === 0,
  );
}

export function buildRfqOfficeSelections(
  dispatchTargets: VendorDispatchTarget[],
) {
  return dispatchTargets.flatMap((target) =>
    target.selectedOfficeIds.map((officeId) => ({
      vendorId: target.vendorId,
      officeId,
    })),
  );
}

export function getNextRecommendedDepartmentIdAfterSend(
  inquiry: Inquiry,
  latestRfqs: Rfq[],
  fallbackDepartmentId: string,
): string {
  const latestDraftedCounts = countRfqsByDepartment(
    latestRfqs.filter((rfq) => rfq.inquiryId === inquiry.id),
  );

  return (
    planQuoteTypesForInquiry(inquiry).recommendations.find((recommendation) => {
      const summary = latestDraftedCounts[recommendation.departmentId];
      return ((summary?.draftCount ?? 0) + (summary?.sentCount ?? 0)) === 0;
    })?.departmentId ?? fallbackDepartmentId
  );
}

export function mapRecommendedQuoteTypes(
  recommendations: QuoteTypeRecommendation[],
  draftedRfqCounts: Record<string, RfqDepartmentSummary>,
): RecommendedQuoteType[] {
  return recommendations.map((recommendation) => {
    const summary = draftedRfqCounts[recommendation.departmentId];

    return {
      ...recommendation,
      draftedCount: (summary?.draftCount ?? 0) + (summary?.sentCount ?? 0),
      draftCount: summary?.draftCount ?? 0,
      sentCount: summary?.sentCount ?? 0,
      isReady: isQuoteReady(summary),
    };
  });
}
