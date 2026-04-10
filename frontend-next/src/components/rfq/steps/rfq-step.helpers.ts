"use client";

import type {
  FilterableVendor,
  ResponseField,
  VendorAdvancedFilterKey,
  VendorFilterCriteria,
  VendorSelectionProfile,
} from "@/types/rfq";

export function splitResponseFields(fields: ResponseField[]) {
  return {
    predefined: fields.filter((field) => !field.isCustom),
    custom: fields.filter((field) => field.isCustom),
  };
}

export function countSelectedResponseFields(fields: ResponseField[]) {
  return fields.filter((field) => field.selected).length;
}

function isFilterKeyVisible(
  visibleFilterKeys: Set<VendorAdvancedFilterKey> | null,
  key: VendorAdvancedFilterKey,
) {
  return visibleFilterKeys ? visibleFilterKeys.has(key) : true;
}

export function countActiveVendorFilters(
  criteria: VendorFilterCriteria,
  profile?: VendorSelectionProfile,
) {
  const visibleFilterKeys = profile
    ? new Set<VendorAdvancedFilterKey>([
        "status",
        ...profile.qualificationFilters,
        ...profile.operationalFilters,
      ])
    : null;
  const visibleCategories = profile
    ? new Set(profile.scopedCategories)
    : null;
  const selectedVisibleCategoryCount = visibleCategories
    ? criteria.categories.filter((category) => visibleCategories.has(category)).length
    : criteria.categories.length;

  return (
    criteria.tradeDirections.length +
    (profile ? 0 : selectedVisibleCategoryCount) +
    (isFilterKeyVisible(visibleFilterKeys, "status") && criteria.status !== "Any" ? 1 : 0) +
    (!visibleFilterKeys && criteria.minWcaYears > 0 ? 1 : 0) +
    (isFilterKeyVisible(visibleFilterKeys, "iataCertified") && criteria.iataCertified !== "Any" ? 1 : 0) +
    (isFilterKeyVisible(visibleFilterKeys, "seaFreight") && criteria.seaFreight !== "Any" ? 1 : 0) +
    (isFilterKeyVisible(visibleFilterKeys, "projectCargo") && criteria.projectCargo !== "Any" ? 1 : 0) +
    (isFilterKeyVisible(visibleFilterKeys, "ownConsolidation") && criteria.ownConsolidation !== "Any" ? 1 : 0) +
    (isFilterKeyVisible(visibleFilterKeys, "ownTransport") && criteria.ownTransport !== "Any" ? 1 : 0) +
    (isFilterKeyVisible(visibleFilterKeys, "ownWarehouse") && criteria.ownWarehouse !== "Any" ? 1 : 0) +
    (isFilterKeyVisible(visibleFilterKeys, "ownCustoms") && criteria.ownCustoms !== "Any" ? 1 : 0)
  );
}

export function getSelectedVendors(
  vendors: FilterableVendor[],
  selectedVendorIds: Set<string>,
) {
  return vendors.filter((vendor) => selectedVendorIds.has(vendor.id));
}

export function formatSelectedCount(count: number, noun: string) {
  return `${count} ${noun}${count !== 1 ? "s" : ""}`;
}
