"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { FilterableVendor } from "@/types/rfq";

interface Props {
    vendors: FilterableVendor[];
    selectedIds: Set<string>;
    selectedVendorCount: number;
    showSelectedOnly?: boolean;
    onToggleShowSelected: () => void;
    onClearSelected: () => void;
    onToggle: (id: string) => void;
    onPreviousPage: () => void;
    onNextPage: () => void;
    vendorPage: number;
    vendorTotal: number;
    vendorTotalPages: number;
    loading?: boolean;
    selectedLocationLabel?: string;
    selectedLocationCountryName?: string;
    locationScope?: "EXACT" | "COUNTRY";
    onWidenToCountry?: () => void;
    onResetToExact?: () => void;
}

function getVendorLocationLabel(vendor: FilterableVendor) {
    const location = vendor.locationMaster.trim();
    const country = vendor.country?.trim();

    if (!country) {
        return location;
    }

    return location.toLowerCase().endsWith(country.toLowerCase())
        ? location
        : `${location}, ${country}`;
}

function getStatusBadgeClasses(status: FilterableVendor["status"]) {
    return status === "Active"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-slate-200 bg-slate-100 text-slate-600";
}

export function VendorTable({
    vendors,
    selectedIds,
    selectedVendorCount,
    showSelectedOnly = false,
    onToggleShowSelected,
    onClearSelected,
    onToggle,
    onPreviousPage,
    onNextPage,
    vendorPage,
    vendorTotal,
    vendorTotalPages,
    loading = false,
    selectedLocationLabel,
    selectedLocationCountryName,
    locationScope = "EXACT",
    onWidenToCountry,
    onResetToExact,
}: Props) {
    const hasExactLocation = Boolean(selectedLocationLabel);
    const hasCountryScope =
        locationScope === "COUNTRY" && Boolean(selectedLocationCountryName);
    const hasSelectedVendors = selectedVendorCount > 0;

    if (loading) {
        return (
            <div className="flex h-full min-h-96 items-center justify-center bg-[hsl(214_38%_99%)] px-6 text-center">
                <div className="max-w-sm">
                    <p className="text-sm font-semibold text-foreground">Loading vendors...</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {showSelectedOnly
                            ? "Loading the vendors selected for this RFQ."
                            : "Pulling the next page of vendor matches from the vendor master."}
                    </p>
                </div>
            </div>
        );
    }

    if (vendors.length === 0) {
        return (
            <div className="flex h-full min-h-[24rem] items-center justify-center bg-[hsl(214_38%_99%)] px-6 text-center">
                <div className="max-w-sm">
                    <p className="text-sm font-semibold text-foreground">
                        {showSelectedOnly && selectedVendorCount === 0
                            ? "No vendors selected for this RFQ yet"
                            : hasCountryScope
                            ? `No vendors matched ${selectedLocationCountryName ?? "this country"}`
                            : hasExactLocation
                              ? `No vendors are linked to ${selectedLocationLabel}`
                              : showSelectedOnly
                                ? "No selected vendors are available to show"
                                : "No vendors matched the current selection"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {showSelectedOnly && selectedVendorCount === 0
                            ? "Pick vendors from the list first, then use Show selected to review only that shortlist."
                            : hasCountryScope
                            ? "Try another location or reset back to exact scope."
                            : hasExactLocation && selectedLocationCountryName
                              ? `You can widen the search to ${selectedLocationCountryName} to see the broader in-country vendor pool.`
                              : showSelectedOnly
                                ? "Switch back to the full vendor list to continue selecting vendors."
                                : "Try a different port search, category chip, or advanced filter."}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                        {showSelectedOnly ? (
                            <Button type="button" variant="outline" size="sm" onClick={onToggleShowSelected}>
                                Show All Vendors
                            </Button>
                        ) : hasCountryScope ? (
                            <Button type="button" variant="outline" size="sm" onClick={onResetToExact}>
                                Back to Exact Match
                            </Button>
                        ) : hasExactLocation && selectedLocationCountryName ? (
                            <Button type="button" variant="outline" size="sm" onClick={onWidenToCountry}>
                                Widen to {selectedLocationCountryName}
                            </Button>
                        ) : null}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-0 flex-col bg-white">
            <div className="flex flex-col gap-2 p-3 xl:hidden">
                {vendors.map((vendor) => {
                    const isSelected = selectedIds.has(vendor.id);

                    return (
                        <div
                            key={vendor.id}
                            role="button"
                            tabIndex={0}
                            className={cn(
                                "rounded-md border px-3 py-3 text-left transition-colors",
                                isSelected
                                    ? "border-primary/25 bg-primary/5"
                                    : "border-border/70 bg-background hover:bg-muted/20",
                            )}
                            onClick={() => onToggle(vendor.id)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    onToggle(vendor.id);
                                }
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <div className="pt-0.5" onClick={(event) => event.stopPropagation()}>
                                    <Checkbox checked={isSelected} onCheckedChange={() => onToggle(vendor.id)} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-foreground">{vendor.name}</p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {getVendorLocationLabel(vendor)}
                                            </p>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={cn("rounded-full px-2 text-[0.62rem]", getStatusBadgeClasses(vendor.status))}
                                        >
                                            {vendor.status}
                                        </Badge>
                                    </div>

                                    <div className="mt-3 grid gap-3 text-xs">
                                        <div className="grid gap-1">
                                            <span className="font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                                Contact
                                            </span>
                                            <span className="text-foreground">{vendor.primaryContactName}</span>
                                            <span className="truncate text-muted-foreground">
                                                {vendor.primaryContactEmail}
                                            </span>
                                        </div>

                                        <div className="grid gap-1">
                                            <span className="font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                                Categories
                                            </span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {vendor.categories.map((category) => (
                                                    <Badge key={category} variant="outline" className="rounded-full px-2 text-[0.62rem]">
                                                        {category}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="hidden min-h-0 flex-1 xl:flex xl:flex-col">
                <ScrollArea className="min-h-0 flex-1">
                    <Table>
                        <TableHeader className="sticky top-0 z-10 bg-[hsl(214_30%_96%)]">
                            <TableRow className="border-border/70 hover:bg-transparent">
                                <TableHead className="w-10" />
                                <TableHead className="min-w-[12rem] text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                    Name
                                </TableHead>
                                <TableHead className="min-w-[10rem] text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                    Location
                                </TableHead>
                                <TableHead className="min-w-[9rem] text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                    Contact
                                </TableHead>
                                <TableHead className="min-w-[12rem] text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                    Email
                                </TableHead>
                                <TableHead className="min-w-[10rem] text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                    Categories
                                </TableHead>
                                <TableHead className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                    Status
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vendors.map((vendor) => {
                                const isSelected = selectedIds.has(vendor.id);

                                return (
                                    <TableRow
                                        key={vendor.id}
                                        data-state={isSelected ? "selected" : undefined}
                                        className={cn(
                                            "cursor-pointer border-border/60",
                                            isSelected && "bg-primary/5",
                                        )}
                                        onClick={() => onToggle(vendor.id)}
                                    >
                                        <TableCell onClick={(event) => event.stopPropagation()}>
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => onToggle(vendor.id)}
                                                onClick={(event) => event.stopPropagation()}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-sm font-semibold text-foreground">{vendor.name}</p>
                                        </TableCell>
                                        <TableCell className="text-sm text-foreground">
                                            {getVendorLocationLabel(vendor)}
                                        </TableCell>
                                        <TableCell className="text-sm text-foreground">
                                            {vendor.primaryContactName}
                                        </TableCell>
                                        <TableCell>
                                            <p className="truncate text-sm text-muted-foreground">
                                                {vendor.primaryContactEmail}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1.5">
                                                {vendor.categories.map((category) => (
                                                    <Badge key={category} variant="outline" className="rounded-full px-2 text-[0.62rem]">
                                                        {category}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={cn("rounded-full px-2 text-[0.62rem]", getStatusBadgeClasses(vendor.status))}
                                            >
                                                {vendor.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 bg-[hsl(214_38%_98%)] px-4 py-3">
                <div className="flex flex-wrap items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    <span>
                        {showSelectedOnly
                            ? `Viewing ${selectedVendorCount.toLocaleString()} selected vendors`
                            : `Showing ${vendors.length} of ${vendorTotal.toLocaleString()} vendors`}
                    </span>
                </div>

                {showSelectedOnly ? null : (
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-sm"
                            onClick={onPreviousPage}
                            disabled={vendorPage <= 1}
                        >
                            Previous
                        </Button>
                        <Badge variant="secondary" className="rounded-sm px-2">
                            {vendorPage} / {Math.max(vendorTotalPages, 1)}
                        </Badge>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-sm"
                            onClick={onNextPage}
                            disabled={vendorPage >= vendorTotalPages}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
