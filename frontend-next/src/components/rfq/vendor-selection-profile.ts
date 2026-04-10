"use client";

import type { Inquiry } from "@/lib/api";
import type {
    FormValues,
    VendorAdvancedFilterKey,
    VendorLocationFocus,
    VendorLocationKind,
    VendorLocationRole,
    VendorQuoteTypeContext,
    VendorSelectionProfile,
} from "@/types/rfq";

type VendorSelectionProfileInput = {
    departmentId: string;
    inquiry?: Inquiry;
    formValues: FormValues;
    availableCategories: string[];
};

const CATEGORY_LABELS = {
    transporter: "Transporter",
    cfs: "CFS / Buffer Yard",
    cha: "CHA",
    iata: "IATA",
    coLoader: "Co-Loader",
    carrier: "Carrier",
    shippingLine: "Shipping Line",
    packer: "Packer",
    licensing: "Licensing",
    wca: "WCA Agent",
} as const;

function normalizeText(value: string | null | undefined) {
    return value?.trim().toUpperCase() ?? "";
}

function getTradeLane(formValues: FormValues, inquiry?: Inquiry) {
    const formTradeLane = typeof formValues.trade_lane === "string" ? formValues.trade_lane : null;
    return normalizeText(formTradeLane ?? inquiry?.tradeLane);
}

function getQuoteMode(departmentId: string, formValues: FormValues, inquiry?: Inquiry) {
    if (departmentId === "air_freight") {
        return "AIR";
    }

    if (departmentId === "ocean_freight") {
        return normalizeText(
            typeof formValues.mode === "string" ? formValues.mode : inquiry?.shipmentMode ?? "FCL",
        );
    }

    return normalizeText(
        typeof formValues.mode === "string" ? formValues.mode : inquiry?.shipmentMode,
    );
}

function filterScopedCategories(categoryNames: string[], availableCategories: string[]) {
    if (availableCategories.length === 0) {
        return categoryNames;
    }

    const available = new Set(availableCategories.map((category) => category.toLowerCase()));
    const scoped = categoryNames.filter((category) => available.has(category.toLowerCase()));
    return scoped.length > 0 ? scoped : categoryNames;
}

function buildProfile({
    quoteTypeContext,
    scopeLabel,
    scopeSummary,
    scopedCategories,
    quickCategoryNames = scopedCategories,
    recommendedLocationFocus,
    locationRole,
    locationKind,
    locationLabel,
    portMode,
    searchPlaceholder,
    qualificationTitle,
    qualificationDescription,
    qualificationFilters,
    operationalTitle,
    operationalDescription,
    operationalFilters,
    categoryDescription,
}: VendorSelectionProfile): VendorSelectionProfile {
    return {
        quoteTypeContext,
        scopeLabel,
        scopeSummary,
        scopedCategories,
        quickCategoryNames,
        recommendedLocationFocus,
        locationRole,
        locationKind,
        locationLabel,
        portMode,
        searchPlaceholder,
        qualificationTitle,
        qualificationDescription,
        qualificationFilters,
        operationalTitle,
        operationalDescription,
        operationalFilters,
        categoryDescription,
    };
}

export function getVendorSelectionProfile({
    departmentId,
    inquiry,
    formValues,
    availableCategories,
}: VendorSelectionProfileInput): VendorSelectionProfile {
    const tradeLane = getTradeLane(formValues, inquiry);
    const mode = getQuoteMode(departmentId, formValues, inquiry);
    const isAir = mode === "AIR";
    const recommendedLocationFocus: VendorLocationFocus =
        departmentId === "destination_charges"
            ? "Destination"
            : departmentId === "road_freight" ||
                departmentId === "local_port_charges" ||
                departmentId === "cha_services"
              ? tradeLane === "IMPORT"
                  ? "Destination"
                  : "Origin"
              : "Any";

    const scopeSummaryPrefix =
        recommendedLocationFocus === "Any"
            ? "This quote is scoped to the relevant main-carriage vendors."
            : recommendedLocationFocus === "Origin"
              ? "This quote is scoped to vendors around the origin leg."
              : "This quote is scoped to vendors around the destination leg.";

    const defaultLocationRole: VendorLocationRole =
        recommendedLocationFocus === "Destination" ? "DESTINATION" : "ORIGIN";
    const defaultLocationKind: VendorLocationKind =
        departmentId === "road_freight" || departmentId === "cha_services"
            ? "SERVICE_LOCATION"
            : "PORT";
    const defaultPortMode =
        defaultLocationKind === "PORT" ? (isAir ? "AIRPORT" : "SEAPORT") : null;
    const defaultLocationLabel =
        defaultLocationKind === "PORT"
            ? defaultLocationRole === "DESTINATION"
                ? isAir
                    ? "Airport"
                    : "Port"
                : isAir
                  ? "Airport"
                  : "Port"
            : defaultLocationRole === "DESTINATION"
              ? "Destination Service Location"
              : "Origin Service Location";

    let profile = buildProfile({
        quoteTypeContext: departmentId as VendorQuoteTypeContext,
        scopeLabel: "Relevant vendors",
        scopeSummary: scopeSummaryPrefix,
        scopedCategories: [],
        quickCategoryNames: [],
        recommendedLocationFocus,
        locationRole: defaultLocationRole,
        locationKind: defaultLocationKind,
        locationLabel: defaultLocationLabel,
        portMode: defaultPortMode,
        searchPlaceholder:
            recommendedLocationFocus === "Destination"
                ? "Search destination city, port, airport, or country"
                : recommendedLocationFocus === "Origin"
                  ? "Search origin city, port, airport, or country"
                  : "Search vendor city, port, airport, or country",
        qualificationTitle: "Qualification",
        qualificationDescription: "Screen the shortlist using the fields available for this vendor pool.",
        qualificationFilters: ["status"],
        operationalTitle: "Operations",
        operationalDescription: "Show only the operational strengths that matter for this quote.",
        operationalFilters: [],
        categoryDescription: "Common vendor buckets for this quote type.",
    });

    switch (departmentId) {
        case "road_freight":
            profile = buildProfile({
                ...profile,
                quoteTypeContext: "road_freight",
                scopeLabel: "Transport vendors",
                scopeSummary:
                    "Transport quotes should focus on inland operators and packers rather than sea or customs networks.",
                locationRole: recommendedLocationFocus === "Destination" ? "DESTINATION" : "ORIGIN",
                locationKind: "SERVICE_LOCATION",
                locationLabel:
                    recommendedLocationFocus === "Destination"
                        ? "Destination Service Location"
                        : "Origin Service Location",
                portMode: null,
                scopedCategories: [
                    CATEGORY_LABELS.transporter,
                    CATEGORY_LABELS.packer,
                ],
                quickCategoryNames: [
                    CATEGORY_LABELS.transporter,
                    CATEGORY_LABELS.packer,
                ],
                qualificationTitle: "Transport fit",
                qualificationDescription:
                    "Use only the transport-side capabilities that exist in the vendor master.",
                qualificationFilters: ["status", "projectCargo"],
                operationalTitle: "Asset filters",
                operationalDescription:
                    "Narrow to vendors with owned transport or warehousing when the move needs direct operating control.",
                operationalFilters: ["ownTransport", "ownWarehouse"],
                categoryDescription:
                    "Transport quotes mainly need transporters and packers.",
            });
            break;
        case "cha_services":
            profile = buildProfile({
                ...profile,
                quoteTypeContext: "cha_services",
                scopeLabel: "Customs vendors",
                scopeSummary:
                    "CHA quotes should stay focused on customs and licensing vendors, without transport-only filters.",
                locationRole: recommendedLocationFocus === "Destination" ? "DESTINATION" : "ORIGIN",
                locationKind: "SERVICE_LOCATION",
                locationLabel:
                    recommendedLocationFocus === "Destination"
                        ? "Destination Service Location"
                        : "Origin Service Location",
                portMode: null,
                scopedCategories: [CATEGORY_LABELS.cha, CATEGORY_LABELS.licensing],
                quickCategoryNames: [CATEGORY_LABELS.cha, CATEGORY_LABELS.licensing],
                qualificationTitle: "Customs fit",
                qualificationDescription:
                    "Keep this shortlist centered on customs-ready operators rather than freight operators.",
                qualificationFilters: ["status"],
                operationalTitle: "Clearance capability",
                operationalDescription:
                    "Own customs is the meaningful operational signal for this quote type.",
                operationalFilters: ["ownCustoms"],
                categoryDescription:
                    "CHA quotes usually rely on CHA and licensing vendors from the vendor master.",
            });
            break;
        case "ocean_freight":
            profile = buildProfile({
                ...profile,
                quoteTypeContext: "ocean_freight",
                scopeLabel: "Ocean carriers",
                scopeSummary:
                    "Ocean freight quotes should show shipping-line, carrier, and co-loader vendors instead of transport-side operators.",
                locationRole: recommendedLocationFocus === "Destination" ? "DESTINATION" : "ORIGIN",
                locationKind: "PORT",
                locationLabel:
                    recommendedLocationFocus === "Destination"
                        ? "Port"
                        : "Port",
                portMode: "SEAPORT",
                scopedCategories: [
                    CATEGORY_LABELS.shippingLine,
                    CATEGORY_LABELS.carrier,
                    CATEGORY_LABELS.coLoader,
                ],
                quickCategoryNames: [
                    CATEGORY_LABELS.shippingLine,
                    CATEGORY_LABELS.carrier,
                    CATEGORY_LABELS.coLoader,
                ],
                qualificationTitle: "Sea capability",
                qualificationDescription:
                    "Sea freight, project cargo, and consolidation are the relevant capability checks for the ocean quote.",
                qualificationFilters: ["status", "seaFreight", "projectCargo"],
                operationalTitle: "Network strength",
                operationalDescription:
                    "Use consolidation ownership only for ocean networks; transport and customs ownership are hidden here.",
                operationalFilters: ["ownConsolidation"],
                categoryDescription:
                    "Ocean freight quotes should concentrate on shipping lines, carriers, and co-loaders.",
            });
            break;
        case "air_freight":
            profile = buildProfile({
                ...profile,
                quoteTypeContext: "air_freight",
                scopeLabel: "Air freight vendors",
                scopeSummary:
                    "Air freight quotes should stay on IATA, carrier, and co-loader vendors rather than sea or transport profiles.",
                locationRole: recommendedLocationFocus === "Destination" ? "DESTINATION" : "ORIGIN",
                locationKind: "PORT",
                locationLabel:
                    recommendedLocationFocus === "Destination"
                        ? "Airport"
                        : "Airport",
                portMode: "AIRPORT",
                scopedCategories: [
                    CATEGORY_LABELS.iata,
                    CATEGORY_LABELS.carrier,
                    CATEGORY_LABELS.coLoader,
                ],
                quickCategoryNames: [
                    CATEGORY_LABELS.iata,
                    CATEGORY_LABELS.carrier,
                    CATEGORY_LABELS.coLoader,
                ],
                qualificationTitle: "Air capability",
                qualificationDescription:
                    "IATA certification and project-cargo handling are the relevant checks for air freight.",
                qualificationFilters: ["status", "iataCertified", "projectCargo"],
                operationalTitle: "Operations",
                operationalDescription:
                    "Air freight quotes do not need transport or customs ownership filters by default.",
                operationalFilters: [],
                categoryDescription:
                    "Air freight quotes usually need IATA agents, carriers, and co-loaders.",
            });
            break;
        case "local_port_charges":
            profile = buildProfile({
                ...profile,
                quoteTypeContext: "local_port_charges",
                scopeLabel: isAir ? "Origin air handling" : "Origin port handling",
                scopeSummary: isAir
                    ? "Origin local charges for air moves should focus on IATA and customs-capable handlers."
                    : "Origin local charges should focus on port-side handlers and customs vendors, not inland transport vendors.",
                locationRole: recommendedLocationFocus === "Destination" ? "DESTINATION" : "ORIGIN",
                locationKind: "PORT",
                locationLabel:
                    recommendedLocationFocus === "Destination"
                        ? isAir
                            ? "Airport"
                            : "Port"
                        : isAir
                          ? "Airport"
                          : "Port",
                portMode: isAir ? "AIRPORT" : "SEAPORT",
                scopedCategories: isAir
                    ? [CATEGORY_LABELS.iata, CATEGORY_LABELS.cha, CATEGORY_LABELS.carrier]
                    : [
                          CATEGORY_LABELS.cfs,
                          CATEGORY_LABELS.cha,
                          CATEGORY_LABELS.shippingLine,
                          CATEGORY_LABELS.carrier,
                      ],
                quickCategoryNames: isAir
                    ? [CATEGORY_LABELS.iata, CATEGORY_LABELS.cha, CATEGORY_LABELS.carrier]
                    : [CATEGORY_LABELS.cfs, CATEGORY_LABELS.cha, CATEGORY_LABELS.shippingLine],
                qualificationTitle: isAir ? "Air handling fit" : "Port handling fit",
                qualificationDescription: isAir
                    ? "Use air-side operational fields only."
                    : "Use ocean-side operational fields only.",
                qualificationFilters: isAir
                    ? ["status", "iataCertified"]
                    : ["status", "seaFreight"],
                operationalTitle: "Handling operations",
                operationalDescription:
                    "Warehousing and customs ownership are the most useful operational screens for local charge vendors.",
                operationalFilters: ["ownWarehouse", "ownCustoms"],
                categoryDescription: isAir
                    ? "Origin air local-charge quotes usually need IATA and CHA-style handlers."
                    : "Origin port local-charge quotes usually need CFS, CHA, shipping-line, or carrier vendors.",
            });
            break;
        case "destination_charges":
            profile = buildProfile({
                ...profile,
                quoteTypeContext: "destination_charges",
                scopeLabel: isAir ? "Destination air handling" : "Destination local handling",
                scopeSummary: isAir
                    ? "Destination air charges should focus on IATA, CHA, and overseas handling partners."
                    : "Destination charges should focus on destination-side agents, customs, and handling vendors rather than transport operators.",
                locationRole: "DESTINATION",
                locationKind: "PORT",
                locationLabel: isAir ? "Airport" : "Port",
                portMode: isAir ? "AIRPORT" : "SEAPORT",
                scopedCategories: isAir
                    ? [CATEGORY_LABELS.wca, CATEGORY_LABELS.iata, CATEGORY_LABELS.cha]
                    : [
                          CATEGORY_LABELS.wca,
                          CATEGORY_LABELS.cha,
                          CATEGORY_LABELS.cfs,
                          CATEGORY_LABELS.shippingLine,
                      ],
                quickCategoryNames: isAir
                    ? [CATEGORY_LABELS.wca, CATEGORY_LABELS.iata, CATEGORY_LABELS.cha]
                    : [CATEGORY_LABELS.wca, CATEGORY_LABELS.cha, CATEGORY_LABELS.cfs],
                qualificationTitle: isAir ? "Destination air fit" : "Destination handling fit",
                qualificationDescription: isAir
                    ? "Keep the shortlist on air-side and customs-side destination partners."
                    : "Keep the shortlist on destination-side ocean handling partners.",
                qualificationFilters: isAir
                    ? ["status", "iataCertified"]
                    : ["status", "seaFreight"],
                operationalTitle: "Destination operations",
                operationalDescription:
                    "Destination-side customs and warehousing ownership are the useful filters for this quote type.",
                operationalFilters: ["ownWarehouse", "ownCustoms"],
                categoryDescription: isAir
                    ? "Destination air charges usually rely on WCA, IATA, and CHA partners."
                    : "Destination ocean charges usually rely on WCA, CHA, CFS, and shipping-line partners.",
            });
            break;
        default:
            break;
    }

    return {
        ...profile,
        scopedCategories: filterScopedCategories(profile.scopedCategories, availableCategories),
        quickCategoryNames: filterScopedCategories(profile.quickCategoryNames, availableCategories),
    };
}

export function getEffectiveVendorCategoryNames(
    criteriaCategories: string[],
    profile: VendorSelectionProfile,
) {
    const scopedCategories =
        profile.scopedCategories.length > 0 ? profile.scopedCategories : criteriaCategories;

    const selectedVisibleCategories = criteriaCategories.filter((category) =>
        scopedCategories.includes(category),
    );

    return selectedVisibleCategories.length > 0 ? selectedVisibleCategories : scopedCategories;
}

export function getVisibleVendorFilterKeys(profile: VendorSelectionProfile) {
    return Array.from(
        new Set<VendorAdvancedFilterKey>([
            "status",
            ...profile.qualificationFilters,
            ...profile.operationalFilters,
        ]),
    );
}
