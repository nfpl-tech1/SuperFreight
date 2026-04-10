"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { VendorFilterForm } from "@/components/rfq/VendorFilterForm";
import { VendorSearchBar, type VendorSearchOption } from "@/components/rfq/VendorSearchBar";
import { VendorTable } from "@/components/rfq/VendorTable";
import { countActiveVendorFilters } from "@/components/rfq/steps/rfq-step.helpers";
import type {
    FilterableVendor,
    VendorFilterCriteria,
    VendorLocationOption,
    VendorLookupBundle,
    VendorSelectionProfile,
} from "@/types/rfq";

interface Props {
    filterCriteria: VendorFilterCriteria;
    vendorLookups: VendorLookupBundle;
    selectionProfile: VendorSelectionProfile;
    onFilterChange: (criteria: VendorFilterCriteria) => void;
    locationOptions: VendorLocationOption[];
    loadingLocationOptions?: boolean;
    onWidenScopeToCountry: () => void;
    onResetScopeToExact: () => void;
    fetchedVendors: FilterableVendor[];
    vendorPage: number;
    vendorTotal: number;
    vendorTotalPages: number;
    loadingVendors?: boolean;
    selectedVendors: FilterableVendor[];
    selectedVendorIds: Set<string>;
    onToggleVendor: (id: string) => void;
    onClearSelectedVendors: () => void;
    onPreviousPage: () => void;
    onNextPage: () => void;
}

export function Step3VendorSelection({
    filterCriteria,
    vendorLookups,
    selectionProfile,
    onFilterChange,
    fetchedVendors,
    vendorPage,
    vendorTotal,
    vendorTotalPages,
    loadingVendors = false,
    selectedVendors,
    locationOptions,
    loadingLocationOptions = false,
    onWidenScopeToCountry,
    onResetScopeToExact,
    selectedVendorIds,
    onToggleVendor,
    onClearSelectedVendors,
    onPreviousPage,
    onNextPage,
}: Props) {
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [showSelectedOnly, setShowSelectedOnly] = useState(false);

    const activeFilterCount = countActiveVendorFilters(filterCriteria, selectionProfile);
    const hasSelectedLocation = Boolean(filterCriteria.selectedLocationId);
    const searchMode = filterCriteria.searchMode || "all";
    const vendorTypeMode = filterCriteria.vendorTypeMode || "relevant";
    const selectedVendorCount = selectedVendorIds.size;

    const vendorTypeOptions: VendorSearchOption[] = [
        { value: "relevant", label: "All Relevant" },
        { value: "shipping_line_nvocc", label: "Shipping Line/NVOCC" },
        ...vendorLookups.categories
            .filter((category) => !["Shipping Line", "Carrier", "Co-Loader"].includes(category))
            .map((category) => ({
                value: `category:${category}`,
                label: category,
            })),
    ];

    const filterOptions: VendorSearchOption[] = [
        { value: "all", label: "All Fields" },
        { value: "port", label: "Port" },
        { value: "city", label: "City" },
        { value: "origin", label: "Origin" },
        { value: "destination", label: "Destination" },
    ];

    const usesLocationOptions =
        searchMode === "port" || searchMode === "origin" || searchMode === "destination";

    const displayedVendors = showSelectedOnly ? selectedVendors : fetchedVendors;

    const isLoadingSelectedVendors =
        showSelectedOnly &&
        selectedVendorCount > 0 &&
        selectedVendors.length < selectedVendorCount;

    const displayedVendorPage = showSelectedOnly ? 1 : vendorPage;
    const displayedVendorTotal = showSelectedOnly ? selectedVendorCount : vendorTotal;
    const displayedVendorTotalPages = showSelectedOnly ? 1 : vendorTotalPages;

    const canShowExactMatchAction =
        hasSelectedLocation && filterCriteria.locationScope === "COUNTRY";

    const canShowWidenAction =
        hasSelectedLocation &&
        filterCriteria.locationScope !== "COUNTRY" &&
        Boolean(filterCriteria.selectedLocationCountryName);

    const hasLocationContextChips =
        canShowExactMatchAction ||
        canShowWidenAction ||
        Boolean(filterCriteria.selectedLocationLabel);

    const handleClearSelectedVendors = () => {
        setShowSelectedOnly(false);
        onClearSelectedVendors();
    };

    const searchPlaceholder =
        searchMode === "port"
            ? "Search port and select from the list"
            : searchMode === "origin"
              ? "Search origin port and select from the list"
              : searchMode === "destination"
                ? "Search destination port and select from the list"
                : searchMode === "city"
                  ? "Search city, office, or country"
                  : vendorTypeMode === "shipping_line_nvocc"
                    ? "Search shipping line or NVOCC vendors"
                    : vendorTypeMode.startsWith("category:")
                      ? `Search ${vendorTypeMode.slice("category:".length)} vendors`
                      : "Search all relevant vendors";

    const handleVendorTypeChange = (mode: string) => {
        onFilterChange({
            ...filterCriteria,
            vendorTypeMode: mode,
            categories:
                mode === "shipping_line_nvocc"
                    ? ["Shipping Line", "Carrier"]
                    : mode.startsWith("category:")
                      ? [mode.slice("category:".length)]
                      : [],
        });
    };

    const handleSearchFilterChange = (mode: string) => {
        onFilterChange({
            ...filterCriteria,
            searchMode: mode,
            locationFocus:
                mode === "origin"
                    ? "Origin"
                    : mode === "destination"
                      ? "Destination"
                      : "Any",
            locationQuery: "",
            selectedLocationId: "",
            selectedLocationKind: "",
            selectedLocationLabel: "",
            selectedLocationCountryName: "",
            locationScope: "EXACT",
        });
    };

    const clearLocationSelection = () => {
        onFilterChange({
            ...filterCriteria,
            locationQuery: "",
            selectedLocationId: "",
            selectedLocationKind: "",
            selectedLocationLabel: "",
            selectedLocationCountryName: "",
            locationScope: "EXACT",
        });
    };

    const handleLocationQueryChange = (value: string) => {
        onFilterChange({
            ...filterCriteria,
            locationQuery: value,
            selectedLocationId: "",
            selectedLocationKind: "",
            selectedLocationLabel: "",
            selectedLocationCountryName: "",
            locationScope: "EXACT",
        });
    };

    const handleLocationSelect = (option: VendorLocationOption) => {
        onFilterChange({
            ...filterCriteria,
            locationQuery: option.label,
            selectedLocationId: option.id,
            selectedLocationKind: option.kind,
            selectedLocationLabel: option.label,
            selectedLocationCountryName: option.countryName,
            locationScope: "EXACT",
        });
    };

    return (
        <Card className="flex h-full min-h-0 flex-col gap-0 overflow-hidden rounded-2xl border-[hsl(214_28%_88%)] bg-white py-0 shadow-[0_14px_32px_-28px_rgba(15,23,42,0.35)]">
            
            {/* HEADER */}
            <CardHeader className="block border-b border-[hsl(214_28%_90%)] px-5 pt-4 pb-2">
                <div className="relative overflow-visible">
                    <div className="space-y-1">
                        <VendorSearchBar
                            vendorTypeValue={vendorTypeMode}
                            vendorTypeOptions={vendorTypeOptions}
                            filterValue={searchMode}
                            filterOptions={filterOptions}
                            query={filterCriteria.locationQuery}
                            placeholder={searchPlaceholder}
                            locationOptions={locationOptions}
                            loadingLocationOptions={loadingLocationOptions}
                            useLocationOptions={usesLocationOptions}
                            advancedFiltersOpen={filtersOpen}
                            activeFilterCount={activeFilterCount}
                            onVendorTypeChange={handleVendorTypeChange}
                            onFilterChange={handleSearchFilterChange}
                            onQueryChange={handleLocationQueryChange}
                            onLocationSelect={handleLocationSelect}
                            onToggleAdvancedFilters={() =>
                                setFiltersOpen((current) => !current)
                            }
                            onClear={clearLocationSelection}
                        />

                        {/* ACTION BAR */}
                        <div className="flex flex-wrap items-center justify-end gap-2 py-2">
                            <Button
                                type="button"
                                variant={showSelectedOnly ? "default" : "outline"}
                                size="sm"
                                className="h-8 rounded-sm px-3"
                                onClick={() => setShowSelectedOnly((current) => !current)}
                                disabled={selectedVendorCount === 0 && !showSelectedOnly}
                            >
                                {showSelectedOnly ? "Show All Vendors" : "Show Selected"}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 rounded-sm px-3"
                                onClick={handleClearSelectedVendors}
                                disabled={selectedVendorCount === 0}
                            >
                                Clear Selection
                            </Button>

                            <Badge variant="secondary" className="rounded-sm px-2 py-1 h-8">
                                {selectedVendorCount} selected
                            </Badge>
                        </div>

                        {/* LOCATION CHIPS */}
                        {hasLocationContextChips && (
                            <div className="flex flex-wrap items-center gap-2 pb-1">
                                {canShowExactMatchAction && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="rounded-full px-4"
                                        onClick={onResetScopeToExact}
                                    >
                                        Exact Match
                                    </Button>
                                )}

                                {canShowWidenAction && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="rounded-full px-4"
                                        onClick={onWidenScopeToCountry}
                                    >
                                        Widen to {filterCriteria.selectedLocationCountryName}
                                    </Button>
                                )}

                                {filterCriteria.selectedLocationLabel && (
                                    <Badge variant="outline" className="rounded-full px-3 py-1">
                                        {filterCriteria.selectedLocationLabel}
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {filtersOpen && (
                    <>
                        <Separator className="my-3" />
                        <VendorFilterForm
                            criteria={filterCriteria}
                            lookups={vendorLookups}
                            profile={selectionProfile}
                            onChange={onFilterChange}
                            activeFilterCount={activeFilterCount}
                        />
                    </>
                )}
            </CardHeader>

            {/* TABLE */}
            <CardContent className="min-h-0 flex-1 px-0 py-0">
                <div className="min-h-0 h-full">
                    <VendorTable
                        vendors={displayedVendors}
                        loading={loadingVendors || isLoadingSelectedVendors}
                        showSelectedOnly={showSelectedOnly}
                        selectedVendorCount={selectedVendorCount}
                        onToggleShowSelected={() => setShowSelectedOnly((current) => !current)}
                        selectedLocationLabel={filterCriteria.selectedLocationLabel}
                        selectedLocationCountryName={filterCriteria.selectedLocationCountryName}
                        locationScope={filterCriteria.locationScope}
                        onWidenToCountry={onWidenScopeToCountry}
                        onResetToExact={onResetScopeToExact}
                        onClearSelected={handleClearSelectedVendors}
                        selectedIds={selectedVendorIds}
                        onToggle={onToggleVendor}
                        onPreviousPage={onPreviousPage}
                        onNextPage={onNextPage}
                        vendorPage={displayedVendorPage}
                        vendorTotal={displayedVendorTotal}
                        vendorTotalPages={displayedVendorTotalPages}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
