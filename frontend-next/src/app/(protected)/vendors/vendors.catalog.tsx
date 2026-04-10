"use client";

import { Eye, Plus, RefreshCw, Search } from "lucide-react";
import type { VendorCatalogPage, VendorLocationOption, VendorLookups } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ALL_FILTER,
  getCountriesLabel,
  getPrimaryContactLabel,
  getPrimaryOfficeLabel,
  getVendorCountsLabel,
  getVisibleVendorTypes,
  PAGE_SIZE,
  type VendorFilters,
} from "@/app/(protected)/vendors/vendors.helpers";
import { SearchablePortSelect } from "@/app/(protected)/vendors/vendors.parts";

type VendorCatalogItem = VendorCatalogPage["items"][number];

export function VendorCatalogSection({
  canManage,
  catalog,
  filters,
  loadingBootData,
  loadingCatalog,
  lookups,
  onCreateVendor,
  onNextPage,
  onOpenVendorDetails,
  onPortChange,
  onPreviousPage,
  onRefresh,
  onResetFilters,
  onSearchChange,
  onTypeChange,
  portOptions,
}: {
  canManage: boolean;
  catalog: VendorCatalogPage | null;
  filters: VendorFilters;
  loadingBootData: boolean;
  loadingCatalog: boolean;
  lookups: VendorLookups;
  onCreateVendor: () => void;
  onNextPage: () => void;
  onOpenVendorDetails: (vendorId: string) => void;
  onPortChange: (value: string) => void;
  onPreviousPage: () => void;
  onRefresh: () => void;
  onResetFilters: () => void;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  portOptions: VendorLocationOption[];
}) {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[2rem] font-bold tracking-tight text-slate-900">
            Vendor Master
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Search and manage imported vendors, offices, contacts, and CC
            recipients.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {canManage ? (
            <Button onClick={onCreateVendor}>
              <Plus className="mr-2 h-4 w-4" />
              Add Vendor
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[18rem] flex-1">
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <Input
            value={filters.search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search company, office, city, contact, or email"
            className="h-10 pl-10 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {lookups.vendorTypes.map((vendorType) => {
            const isActive = filters.typeCode === vendorType.typeCode;
            return (
              <button
                key={vendorType.id}
                type="button"
                onClick={() =>
                  onTypeChange(
                    isActive ? ALL_FILTER : vendorType.typeCode,
                  )
                }
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  isActive
                    ? "border-[hsl(228,55%,23%)] bg-[hsl(228,55%,23%)] text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {vendorType.typeName}
              </button>
            );
          })}
        </div>

        <SearchablePortSelect
          options={portOptions}
          value={filters.portId}
          onChange={onPortChange}
          placeholder="Port"
          allLabel="All ports"
        />

        <Button
          variant="ghost"
          className="h-10 shrink-0 px-3 text-sm"
          onClick={onResetFilters}
        >
          Reset
        </Button>
      </div>

      <Card className="flex flex-1 flex-col gap-0 overflow-hidden border-slate-200 py-0 shadow-sm">
        <CardContent className="flex flex-1 flex-col px-0">
          {loadingBootData || loadingCatalog ? (
            <div className="flex items-center px-6 py-8">
              <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                Loading vendor catalog...
              </p>
            </div>
          ) : (
            <>
              <VendorMobileList
                catalog={catalog}
                onOpenVendorDetails={onOpenVendorDetails}
              />
              <VendorDesktopTable
                catalog={catalog}
                onOpenVendorDetails={onOpenVendorDetails}
              />

              <Separator />

              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2">
                <p className="text-xs text-slate-500">
                  {(catalog?.total ?? 0).toLocaleString()} vendor entries /{" "}
                  {PAGE_SIZE} per page
                </p>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <p className="text-xs whitespace-nowrap text-slate-500">
                    Page {catalog?.page ?? 1} of {catalog?.totalPages ?? 0}
                  </p>
                  <Button
                    variant="outline"
                    size="xs"
                    disabled={!catalog || catalog.page <= 1}
                    onClick={onPreviousPage}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    disabled={!catalog || catalog.page >= catalog.totalPages}
                    onClick={onNextPage}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function VendorMobileList({
  catalog,
  onOpenVendorDetails,
}: {
  catalog: VendorCatalogPage | null;
  onOpenVendorDetails: (vendorId: string) => void;
}) {
  return (
    <div className="space-y-3 px-3 pb-2 lg:hidden">
      {catalog && catalog.items.length > 0 ? (
        catalog.items.map((vendor) => (
          <VendorMobileCard
            key={vendor.id}
            vendor={vendor}
            onOpenVendorDetails={onOpenVendorDetails}
          />
        ))
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
          No vendors match the current filters.
        </p>
      )}
    </div>
  );
}

function VendorMobileCard({
  vendor,
  onOpenVendorDetails,
}: {
  vendor: VendorCatalogItem;
  onOpenVendorDetails: (vendorId: string) => void;
}) {
  const primaryOfficeLabel = getPrimaryOfficeLabel(vendor);
  const countriesLabel = getCountriesLabel(vendor);
  const primaryContactLabel = getPrimaryContactLabel(vendor);
  const visibleVendorTypes = getVisibleVendorTypes(vendor.vendorTypes);
  const firstType = visibleVendorTypes[0]?.typeName ?? null;
  const extraTypeCount = Math.max(visibleVendorTypes.length - 1, 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className="truncate font-semibold text-slate-900"
            title={vendor.companyName}
          >
            {vendor.companyName}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {getVendorCountsLabel(vendor)}
          </p>
        </div>
        <Badge variant={vendor.isActive ? "default" : "secondary"}>
          {vendor.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <VendorSummaryTile label="Primary Office" value={primaryOfficeLabel} />
        <VendorSummaryTile label="Countries" value={countriesLabel} />
        <VendorSummaryTile label="Primary Contact" value={primaryContactLabel} />
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Types
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {firstType ? (
              <>
                <Badge
                  variant="outline"
                  className="border-slate-200 bg-white text-slate-600"
                >
                  {firstType}
                </Badge>
                {extraTypeCount > 0 ? (
                  <Badge
                    variant="outline"
                    className="border-slate-200 bg-white text-slate-600"
                  >
                    +{extraTypeCount}
                  </Badge>
                ) : null}
              </>
            ) : (
              <span className="text-sm text-slate-500">No tags</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Button
          variant="outline"
          className="w-full justify-center"
          onClick={() => onOpenVendorDetails(vendor.id)}
        >
          <Eye data-icon="inline-start" />
          Actions
        </Button>
      </div>
    </div>
  );
}

function VendorSummaryTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p
        className="mt-2 truncate text-sm font-medium text-slate-900"
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

function VendorDesktopTable({
  catalog,
  onOpenVendorDetails,
}: {
  catalog: VendorCatalogPage | null;
  onOpenVendorDetails: (vendorId: string) => void;
}) {
  return (
    <div className="hidden flex-1 lg:block">
      <Table className="table-fixed">
        <TableHeader className="bg-[hsl(214_40%_96%)]">
          <TableRow className="border-b border-[hsl(214_32%_85%)] bg-[hsl(214_40%_96%)] hover:bg-[hsl(214_40%_96%)]">
            <TableHead className="h-10 w-[27%] bg-[hsl(214_40%_96%)] px-4 text-xs font-semibold tracking-[0.02em] text-primary">
              Vendor
            </TableHead>
            <TableHead className="h-10 w-[18%] bg-[hsl(214_40%_96%)] px-4 text-xs font-semibold tracking-[0.02em] text-primary">
              Primary Office
            </TableHead>
            <TableHead className="h-10 w-[11%] bg-[hsl(214_40%_96%)] px-4 text-xs font-semibold tracking-[0.02em] text-primary">
              Countries
            </TableHead>
            <TableHead className="h-10 w-[11%] bg-[hsl(214_40%_96%)] px-4 text-xs font-semibold tracking-[0.02em] text-primary">
              Types
            </TableHead>
            <TableHead className="h-10 w-[17%] bg-[hsl(214_40%_96%)] px-4 text-xs font-semibold tracking-[0.02em] text-primary">
              Contacts
            </TableHead>
            <TableHead className="h-10 w-[7%] bg-[hsl(214_40%_96%)] px-4 text-xs font-semibold tracking-[0.02em] text-primary">
              Status
            </TableHead>
            <TableHead className="h-10 w-[9%] bg-[hsl(214_40%_96%)] px-4 text-right text-xs font-semibold tracking-[0.02em] text-primary">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {catalog && catalog.items.length > 0 ? (
            catalog.items.map((vendor) => (
              <VendorDesktopRow
                key={vendor.id}
                vendor={vendor}
                onOpenVendorDetails={onOpenVendorDetails}
              />
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={7}
                className="px-3 py-12 text-center text-sm text-slate-500"
              >
                No vendors match the current filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function VendorDesktopRow({
  vendor,
  onOpenVendorDetails,
}: {
  vendor: VendorCatalogItem;
  onOpenVendorDetails: (vendorId: string) => void;
}) {
  const primaryOfficeLabel = getPrimaryOfficeLabel(vendor);
  const countriesLabel = getCountriesLabel(vendor);
  const primaryContactLabel = getPrimaryContactLabel(vendor);
  const visibleVendorTypes = getVisibleVendorTypes(vendor.vendorTypes);
  const firstType = visibleVendorTypes[0]?.typeName ?? null;
  const extraTypeCount = Math.max(visibleVendorTypes.length - 1, 0);

  return (
    <TableRow>
      <TableCell className="px-4 py-3.5">
        <div className="min-w-0">
          <p
            className="truncate text-[14px] font-semibold text-slate-900"
            title={vendor.companyName}
          >
            {vendor.companyName}
          </p>
          <p
            className="mt-0.5 truncate text-[11px] leading-tight text-slate-500"
            title={getVendorCountsLabel(vendor)}
          >
            {getVendorCountsLabel(vendor)}
          </p>
        </div>
      </TableCell>
      <TableCell className="px-4 py-3 text-[13px] text-slate-600">
        <div className="min-w-0 truncate" title={primaryOfficeLabel}>
          {primaryOfficeLabel}
        </div>
      </TableCell>
      <TableCell className="px-4 py-3 text-[13px] text-slate-600">
        <div className="min-w-0 truncate" title={countriesLabel}>
          {countriesLabel}
        </div>
      </TableCell>
      <TableCell className="px-4 py-3">
        {firstType ? (
          <div className="flex items-center gap-1.5 overflow-hidden">
            <Badge
              variant="outline"
              className="border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600"
              title={vendor.vendorTypes
                .filter((vendorType) => vendorType.typeCode !== "CARRIER")
                .map((vendorType) => vendorType.typeName)
                .join(", ")}
            >
              {firstType}
            </Badge>
            {extraTypeCount > 0 ? (
              <Badge
                variant="outline"
                className="border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600"
              >
                +{extraTypeCount}
              </Badge>
            ) : null}
          </div>
        ) : (
          <span className="text-[13px] text-slate-500">No tags</span>
        )}
      </TableCell>
      <TableCell className="px-4 py-3 text-[13px] text-slate-600">
        <div className="min-w-0 truncate" title={primaryContactLabel}>
          {primaryContactLabel}
        </div>
      </TableCell>
      <TableCell className="px-4 py-3">
        <Badge
          variant={vendor.isActive ? "default" : "secondary"}
          className="px-2.5 py-0.5 text-[11px]"
        >
          {vendor.isActive ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell className="px-4 py-3 text-right">
        <Button
          variant="outline"
          size="xs"
          className="h-8 justify-center px-3 text-xs"
          onClick={() => onOpenVendorDetails(vendor.id)}
        >
          <Eye data-icon="inline-start" />
          <span className="xl:hidden">Actions</span>
          <span className="hidden xl:inline">Actions</span>
        </Button>
      </TableCell>
    </TableRow>
  );
}
