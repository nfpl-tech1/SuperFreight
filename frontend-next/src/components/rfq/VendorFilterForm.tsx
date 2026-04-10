"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { defaultFilterCriteria } from "@/lib/vendorFilter";
import { cn } from "@/lib/utils";
import { getVisibleVendorFilterKeys } from "@/components/rfq/vendor-selection-profile";
import type {
    VendorAdvancedFilterKey,
    VendorFilterCriteria,
    VendorLookupBundle,
    VendorSelectionProfile,
    YesNoAny,
} from "@/types/rfq";

interface Props {
    criteria: VendorFilterCriteria;
    lookups: VendorLookupBundle;
    profile: VendorSelectionProfile;
    onChange: (criteria: VendorFilterCriteria) => void;
    activeFilterCount: number;
}

function FilterToggle({
    checked,
    label,
    onToggle,
}: {
    checked: boolean;
    label: string;
    onToggle: () => void;
}) {
    return (
        <label
            className={cn(
                "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-xs transition-colors",
                checked
                    ? "border-primary bg-primary/15 text-primary font-semibold"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:bg-muted/40",
            )}
        >
            <Checkbox checked={checked} onCheckedChange={onToggle} />
            <span className="leading-tight">{label}</span>
        </label>
    );
}

function SelectField({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <label className="flex flex-col gap-1.5">
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {label}
            </span>
            {children}
        </label>
    );
}

function YesNoAnySelect({
    value,
    onChange,
    label,
}: {
    value: YesNoAny;
    onChange: (value: YesNoAny) => void;
    label: string;
}) {
    return (
        <SelectField label={label}>
            <Select value={value} onValueChange={(nextValue) => onChange(nextValue as YesNoAny)}>
                <SelectTrigger className="h-9 w-full rounded-md bg-background text-sm">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Any">Any</SelectItem>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                </SelectContent>
            </Select>
        </SelectField>
    );
}

function FilterSection({
    title,
    badge,
    description,
    children,
}: {
    title: string;
    badge?: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <section className="rounded-md border border-border/70 bg-white px-4 py-3">
            <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            {title}
                        </h3>
                        {badge ? (
                            <Badge variant="outline" className="h-5 rounded-sm px-2 text-[0.6rem]">
                                {badge}
                            </Badge>
                        ) : null}
                    </div>
                    {description ? (
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            {description}
                        </p>
                    ) : null}
                </div>
            </div>
            {children}
        </section>
    );
}

function hasFilter(visibleFilterKeys: Set<VendorAdvancedFilterKey>, key: VendorAdvancedFilterKey) {
    return visibleFilterKeys.has(key);
}

export function VendorFilterForm({
    criteria,
    lookups,
    profile,
    onChange,
    activeFilterCount,
}: Props) {
    const visibleFilterKeys = new Set<VendorAdvancedFilterKey>(getVisibleVendorFilterKeys(profile));

    const toggleTradeDirection = (tradeDirection: string) => {
        const nextTradeDirections = criteria.tradeDirections.includes(tradeDirection)
            ? criteria.tradeDirections.filter((value) => value !== tradeDirection)
            : [...criteria.tradeDirections, tradeDirection];

        onChange({ ...criteria, tradeDirections: nextTradeDirections });
    };

    return (
        <div className="rounded-[0.6rem] border border-border/70 bg-[hsl(214_38%_98%)] px-4 py-4">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Advanced Filters
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {profile.scopeSummary}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {activeFilterCount > 0 ? (
                        <Badge variant="secondary" className="rounded-sm">
                            {activeFilterCount} active
                        </Badge>
                    ) : null}
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={activeFilterCount === 0}
                        onClick={() => onChange(defaultFilterCriteria())}
                    >
                        Reset All
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <FilterSection
                    title={profile.qualificationTitle}
                    badge={profile.scopeLabel}
                    description={profile.qualificationDescription}
                >
                    <div className="grid gap-3">
                        {hasFilter(visibleFilterKeys, "status") ? (
                            <div className="grid gap-3 sm:grid-cols-2">
                                <SelectField label="Status">
                                    <Select
                                        value={criteria.status}
                                        onValueChange={(value) =>
                                            onChange({
                                                ...criteria,
                                                status: value as VendorFilterCriteria["status"],
                                            })
                                        }
                                    >
                                        <SelectTrigger className="h-9 w-full rounded-md bg-background text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Inactive">Inactive</SelectItem>
                                            <SelectItem value="Any">Any</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </SelectField>
                            </div>
                        ) : null}

                        <div className="grid gap-3 sm:grid-cols-3">
                            {hasFilter(visibleFilterKeys, "iataCertified") ? (
                                <YesNoAnySelect
                                    label="IATA Certified"
                                    value={criteria.iataCertified}
                                    onChange={(value) => onChange({ ...criteria, iataCertified: value })}
                                />
                            ) : null}
                            {hasFilter(visibleFilterKeys, "seaFreight") ? (
                                <YesNoAnySelect
                                    label="Sea Freight"
                                    value={criteria.seaFreight}
                                    onChange={(value) => onChange({ ...criteria, seaFreight: value })}
                                />
                            ) : null}
                            {hasFilter(visibleFilterKeys, "projectCargo") ? (
                                <YesNoAnySelect
                                    label="Project Cargo"
                                    value={criteria.projectCargo}
                                    onChange={(value) => onChange({ ...criteria, projectCargo: value })}
                                />
                            ) : null}
                        </div>
                    </div>
                </FilterSection>

                {profile.operationalFilters.length > 0 ? (
                    <FilterSection
                        title={profile.operationalTitle}
                        badge="Operations"
                        description={profile.operationalDescription}
                    >
                        <div className="grid gap-3 sm:grid-cols-2">
                            {hasFilter(visibleFilterKeys, "ownConsolidation") ? (
                                <YesNoAnySelect
                                    label="Own Consolidation"
                                    value={criteria.ownConsolidation}
                                    onChange={(value) => onChange({ ...criteria, ownConsolidation: value })}
                                />
                            ) : null}
                            {hasFilter(visibleFilterKeys, "ownTransport") ? (
                                <YesNoAnySelect
                                    label="Own Transport"
                                    value={criteria.ownTransport}
                                    onChange={(value) => onChange({ ...criteria, ownTransport: value })}
                                />
                            ) : null}
                            {hasFilter(visibleFilterKeys, "ownWarehouse") ? (
                                <YesNoAnySelect
                                    label="Own Warehouse"
                                    value={criteria.ownWarehouse}
                                    onChange={(value) => onChange({ ...criteria, ownWarehouse: value })}
                                />
                            ) : null}
                            {hasFilter(visibleFilterKeys, "ownCustoms") ? (
                                <YesNoAnySelect
                                    label="Own Customs"
                                    value={criteria.ownCustoms}
                                    onChange={(value) => onChange({ ...criteria, ownCustoms: value })}
                                />
                            ) : null}
                        </div>
                    </FilterSection>
                ) : (
                    <div className="hidden xl:block" />
                )}
            </div>

            {lookups.tradeDirections.length > 0 ? (
                <div className="mt-4">
                    <FilterSection
                        title="Trade Lanes"
                        badge={`${criteria.tradeDirections.length} selected`}
                        description="Restrict the shortlist to matching trade direction coverage."
                    >
                        <div className="grid grid-cols-2 gap-2">
                            {lookups.tradeDirections.map((tradeDirection) => (
                                <FilterToggle
                                    key={tradeDirection}
                                    checked={criteria.tradeDirections.includes(tradeDirection)}
                                    label={tradeDirection}
                                    onToggle={() => toggleTradeDirection(tradeDirection)}
                                />
                            ))}
                        </div>
                    </FilterSection>
                </div>
            ) : null}
        </div>
    );
}
