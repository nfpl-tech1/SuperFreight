"use client";

import { AlertCircle, CheckCircle2, ChevronDown, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import type {
  ResponseField,
  VendorDispatchTarget,
} from "@/types/rfq";

export function ResponseFieldBadge({ field }: { field: ResponseField }) {
  return (
    <Badge variant="outline" className="text-xs">
      {field.label}
      {field.isCustom && (
        <span className="ml-1 rounded-sm bg-primary px-1 py-0.5 text-[0.5625rem] text-white">
          Custom
        </span>
      )}
    </Badge>
  );
}

function getResolutionBadgeVariant(target: VendorDispatchTarget) {
  if (target.needsAttention || target.isLoading) {
    return "outline";
  }

  if (target.resolution === "MANUAL") {
    return "secondary";
  }

  return "default";
}

export function VendorDispatchList({
  targets,
  compact = false,
  onOfficeChange,
}: {
  targets: VendorDispatchTarget[];
  compact?: boolean;
  onOfficeChange?: (vendorId: string, officeId: string, checked: boolean) => void;
}) {
  if (targets.length === 0) {
    return (
      <p className="py-1 text-xs italic text-muted-foreground">
        No vendors selected.
      </p>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {targets.map((target) => {
        const canChooseOffice =
          Boolean(onOfficeChange) && target.availableOffices.length > 1;

        return (
          <div
            key={target.vendorId}
            className={compact ? "space-y-2 py-2" : "space-y-2.5 py-3"}
          >
            <div className="flex items-start gap-2">
              {target.needsAttention || target.isLoading ? (
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
              ) : (
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[0.8125rem] font-medium leading-tight">
                    {target.vendorName}
                  </p>
                  <Badge
                    variant={getResolutionBadgeVariant(target)}
                    className="rounded-sm text-[0.625rem]"
                  >
                    {target.resolutionLabel}
                  </Badge>
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  {target.selectedOfficeIds.length > 1
                    ? `${target.selectedOfficeIds.length} offices selected`
                    : target.officeName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {target.selectedOfficeIds.length > 1
                    ? "RFQ will be sent separately to each selected office."
                    : target.officeLocation}
                </p>
                {target.contactEmail ? (
                  <p
                    className={
                      compact
                        ? "text-xs text-muted-foreground"
                        : "break-all text-xs text-muted-foreground"
                    }
                  >
                    {target.contactName} · {target.contactEmail}
                  </p>
                ) : null}
                {target.ccEmails.length > 0 ? (
                  <p
                    className={
                      compact
                        ? "text-[0.7rem] text-muted-foreground"
                        : "break-all text-[0.7rem] text-muted-foreground"
                    }
                  >
                    CC: {target.ccEmails.join(", ")}
                  </p>
                ) : null}
              </div>
            </div>

            {canChooseOffice ? (
              <div className="pl-5">
                <p className="mb-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Sending Offices
                </p>
                <div className="flex flex-col gap-2 rounded-lg border border-border/70 bg-muted/25 p-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <span className="truncate text-left">
                          {target.selectedOfficeIds.length > 0
                            ? `${target.selectedOfficeIds.length} office${target.selectedOfficeIds.length !== 1 ? "s" : ""} selected`
                            : "Choose offices"}
                        </span>
                        <ChevronDown data-icon="inline-end" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[22rem]">
                      <DropdownMenuLabel>Select sending offices</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        {target.availableOffices.map((office) => {
                          const checked = target.selectedOfficeIds.includes(office.officeId);

                          return (
                            <DropdownMenuCheckboxItem
                              key={office.officeId}
                              checked={checked}
                              onCheckedChange={(nextChecked) =>
                                onOfficeChange?.(target.vendorId, office.officeId, Boolean(nextChecked))
                              }
                              className="items-start"
                            >
                              <div className="flex min-w-0 flex-col gap-0.5">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-medium text-foreground">
                                    {office.officeName}
                                  </span>
                                  {office.isPrimary ? (
                                    <Badge variant="outline" className="text-[0.625rem]">
                                      Primary
                                    </Badge>
                                  ) : null}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {office.locationLabel}
                                </span>
                                <span className="truncate text-xs text-muted-foreground">
                                  {office.contactName} · {office.contactEmail}
                                </span>
                              </div>
                            </DropdownMenuCheckboxItem>
                          );
                        })}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {target.selectedOffices.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {target.selectedOffices.map((office) => (
                        <Badge
                          key={office.officeId}
                          variant="secondary"
                          className="max-w-full truncate text-[0.625rem]"
                        >
                          {office.officeName}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-amber-700">
                      Select at least one office to send this RFQ.
                    </p>
                  )}
                </div>
              </div>
            ) : target.selectedOffices.length > 1 ? (
              <div className="pl-5">
                <p className="mb-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Selected Offices
                </p>
                <div className="flex flex-col gap-2 rounded-lg border border-border/70 bg-muted/25 p-3">
                  {target.selectedOffices.map((office, officeIndex) => (
                    <div key={office.officeId} className="flex flex-col gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {office.officeName}
                          </span>
                          {office.isPrimary ? (
                            <Badge variant="outline" className="text-[0.625rem]">
                              Primary
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-xs text-muted-foreground">{office.locationLabel}</p>
                        <p className="break-all text-xs text-muted-foreground">
                          {office.contactName} · {office.contactEmail}
                        </p>
                        {office.ccEmails.length > 0 ? (
                          <p className="break-all text-[0.7rem] text-muted-foreground">
                            CC: {office.ccEmails.join(", ")}
                          </p>
                        ) : null}
                      </div>
                      {officeIndex < target.selectedOffices.length - 1 ? <Separator /> : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function ResponseFieldList({ fields }: { fields: ResponseField[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {fields.map((field) => (
        <ResponseFieldBadge key={field.id} field={field} />
      ))}
    </div>
  );
}

export function SendRfqButton({
  count,
  disabled,
  loading = false,
  onClick,
}: {
  count: number;
  disabled: boolean;
  loading?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      size="lg"
      className="w-full text-[0.9375rem]"
      onClick={onClick}
      disabled={disabled || loading}
    >
      <Send className="mr-2 h-4 w-4" />{" "}
      {loading
        ? "Sending RFQ..."
        : `Send RFQ to ${count} Vendor${count !== 1 ? "s" : ""}`}
    </Button>
  );
}
