"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VendorLocationOption } from "@/types/rfq";

export type VendorSearchOption = {
    value: string;
    label: string;
};

function getPortModeLabel(portMode: string | null) {
    if (portMode === "AIRPORT") {
        return "Air";
    }

    if (portMode === "SEAPORT") {
        return "Sea";
    }

    return null;
}

interface Props {
    vendorTypeValue: string;
    vendorTypeOptions: VendorSearchOption[];
    filterValue: string;
    filterOptions: VendorSearchOption[];
    query: string;
    placeholder: string;
    locationOptions: VendorLocationOption[];
    loadingLocationOptions?: boolean;
    useLocationOptions?: boolean;
    advancedFiltersOpen?: boolean;
    activeFilterCount?: number;
    onVendorTypeChange: (value: string) => void;
    onFilterChange: (value: string) => void;
    onQueryChange: (value: string) => void;
    onLocationSelect: (option: VendorLocationOption) => void;
    onToggleAdvancedFilters: () => void;
    onClear: () => void;
}

export function VendorSearchBar({
    vendorTypeValue,
    vendorTypeOptions,
    filterValue,
    filterOptions,
    query,
    placeholder,
    locationOptions,
    loadingLocationOptions = false,
    useLocationOptions = false,
    advancedFiltersOpen = false,
    activeFilterCount = 0,
    onVendorTypeChange,
    onFilterChange,
    onQueryChange,
    onLocationSelect,
    onToggleAdvancedFilters,
    onClear,
}: Props) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <div className="flex flex-col overflow-visible rounded-md border border-border/80 bg-white shadow-sm md:flex-row">
                <Select
                    value={vendorTypeValue}
                    onValueChange={(nextValue) => {
                        setIsOpen(false);
                        onVendorTypeChange(nextValue);
                    }}
                >
                    <SelectTrigger className="min-w-55 rounded-none border-0 bg-[hsl(214_38%_98%)] px-4 py-0 text-sm shadow-none data-[size=default]:h-12 focus:ring-0 focus-visible:border-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:border-r">
                        <SelectValue placeholder="Vendor Type" />
                    </SelectTrigger>
                    <SelectContent>
                        {vendorTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={filterValue}
                    onValueChange={(nextValue) => {
                        setIsOpen(false);
                        onFilterChange(nextValue);
                    }}
                >
                    <SelectTrigger className="min-w-45 rounded-none border-0 bg-[hsl(214_38%_98%)] px-4 py-0 text-sm shadow-none data-[size=default]:h-12 focus:ring-0 focus-visible:border-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:border-r">
                        <SelectValue placeholder="Filter By" />
                    </SelectTrigger>
                    <SelectContent>
                        {filterOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="relative flex-1">
                    <Input
                        value={query}
                        onFocus={() => {
                            if (useLocationOptions) {
                                setIsOpen(true);
                            }
                        }}
                        onChange={(event) => {
                            if (useLocationOptions) {
                                setIsOpen(true);
                            }
                            onQueryChange(event.target.value);
                        }}
                        onBlur={() => {
                            window.setTimeout(() => setIsOpen(false), 120);
                        }}
                        placeholder={placeholder}
                        className="h-12 rounded-none border-0 pr-24 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        autoComplete="off"
                    />
                    {query ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 h-8 -translate-y-1/2 rounded-sm px-3 text-xs"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => {
                                setIsOpen(false);
                                onClear();
                            }}
                        >
                            Clear
                        </Button>
                    ) : null}
                </div>

                <div className="border-t border-border/80 md:border-t-0 md:border-l">
                    <Button
                        type="button"
                        variant="ghost"
                        className="h-12 w-full rounded-none px-4 text-sm md:w-auto"
                        onClick={onToggleAdvancedFilters}
                    >
                        <SlidersHorizontal className="size-4" />
                        Advanced Filters
                        {activeFilterCount > 0 ? (
                            <Badge variant="secondary" className="rounded-full px-2">
                                {activeFilterCount}
                            </Badge>
                        ) : null}
                        <ChevronDown
                            className={cn(
                                "size-4 transition-transform",
                                advancedFiltersOpen && "rotate-180",
                            )}
                        />
                    </Button>
                </div>
            </div>

            {useLocationOptions && isOpen ? (
                <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-md border border-border/80 bg-white shadow-lg">
                    <ScrollArea className="max-h-72">
                        <div className="p-1.5">
                            {loadingLocationOptions ? (
                                <div className="px-3 py-4 text-sm text-muted-foreground">
                                    Loading locations...
                                </div>
                            ) : locationOptions.length === 0 ? (
                                <div className="px-3 py-4 text-sm text-muted-foreground">
                                    No matching locations found.
                                </div>
                            ) : (
                                locationOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        className={cn(
                                            "flex w-full items-start justify-between gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-muted/40",
                                        )}
                                        onMouseDown={(event) => {
                                            event.preventDefault();
                                            onLocationSelect(option);
                                            setIsOpen(false);
                                        }}
                                    >
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-sm font-medium text-foreground">
                                                {option.label}
                                            </span>
                                            {option.subLabel ? (
                                                <span className="mt-0.5 block text-xs text-muted-foreground">
                                                    {option.subLabel}
                                                </span>
                                            ) : null}
                                        </span>
                                        {option.kind === "PORT" && getPortModeLabel(option.portMode) ? (
                                            <Badge
                                                variant="outline"
                                                className="mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium"
                                            >
                                                {getPortModeLabel(option.portMode)}
                                            </Badge>
                                        ) : null}
                                    </button>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>
            ) : null}
        </div>
    );
}
