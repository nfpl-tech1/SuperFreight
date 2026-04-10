import type { FilterableVendor, VendorFilterCriteria, YesNoAny } from "@/types/rfq";

function matchesYesNo(actual: boolean, filter: YesNoAny): boolean {
    if (filter === "Any") return true;
    return filter === "Yes" ? actual : !actual;
}

export function filterVendors(
    vendors: FilterableVendor[],
    criteria: VendorFilterCriteria,
): FilterableVendor[] {
    return vendors.filter((v) => {
        const normalizedLocationQuery = criteria.locationQuery.trim().toLowerCase();

        if (criteria.tradeDirections.length > 0) {
            const hasMatch = criteria.tradeDirections.some((dir) =>
                v.tradeDirections.includes(dir),
            );
            if (!hasMatch) return false;
        }

        if (criteria.categories.length > 0) {
            const hasMatch = criteria.categories.some((cat) => v.categories.includes(cat));
            if (!hasMatch) return false;
        }

        if (normalizedLocationQuery) {
            const searchableLocation = `${v.locationMaster} ${v.country ?? ""}`.toLowerCase();
            if (!searchableLocation.includes(normalizedLocationQuery)) {
                return false;
            }
        }

        if (criteria.status !== "Any" && v.status !== criteria.status) return false;

        if (v.wcaYears < criteria.minWcaYears) return false;

        if (!matchesYesNo(v.iataCertified, criteria.iataCertified)) return false;
        if (!matchesYesNo(v.seaFreight, criteria.seaFreight)) return false;
        if (!matchesYesNo(v.projectCargo, criteria.projectCargo)) return false;
        if (!matchesYesNo(v.ownConsolidation, criteria.ownConsolidation)) return false;
        if (!matchesYesNo(v.ownTransport, criteria.ownTransport)) return false;
        if (!matchesYesNo(v.ownWarehouse, criteria.ownWarehouse)) return false;
        if (!matchesYesNo(v.ownCustoms, criteria.ownCustoms)) return false;

        return true;
    });
}

export function defaultFilterCriteria(): VendorFilterCriteria {
    return {
        tradeDirections: [],
        categories: [],
        vendorTypeMode: "relevant",
        searchMode: "all",
        locationFocus: "Any",
        locationQuery: "",
        selectedLocationId: "",
        selectedLocationKind: "",
        selectedLocationLabel: "",
        selectedLocationCountryName: "",
        locationScope: "EXACT",
        status: "Any",
        minWcaYears: 0,
        iataCertified: "Any",
        seaFreight: "Any",
        projectCargo: "Any",
        ownConsolidation: "Any",
        ownTransport: "Any",
        ownWarehouse: "Any",
        ownCustoms: "Any",
    };
}

export function isLegacyDefaultVendorFilter(criteria: VendorFilterCriteria): boolean {
    return (
        criteria.tradeDirections.length === 0 &&
        criteria.categories.length === 0 &&
        (criteria.vendorTypeMode === "relevant" || criteria.vendorTypeMode === "") &&
        (criteria.searchMode === "all" || criteria.searchMode === "") &&
        criteria.locationFocus === "Any" &&
        criteria.locationQuery.trim() === "" &&
        criteria.selectedLocationId === "" &&
        criteria.selectedLocationKind === "" &&
        criteria.selectedLocationLabel === "" &&
        criteria.selectedLocationCountryName === "" &&
        criteria.locationScope === "EXACT" &&
        criteria.status === "Active" &&
        criteria.minWcaYears === 0 &&
        criteria.iataCertified === "Any" &&
        criteria.seaFreight === "Any" &&
        criteria.projectCargo === "Any" &&
        criteria.ownConsolidation === "Any" &&
        criteria.ownTransport === "Any" &&
        criteria.ownWarehouse === "Any" &&
        criteria.ownCustoms === "Any"
    );
}

export function normalizeVendorFilterCriteria(criteria: VendorFilterCriteria): VendorFilterCriteria {
    return isLegacyDefaultVendorFilter(criteria) ? defaultFilterCriteria() : criteria;
}
