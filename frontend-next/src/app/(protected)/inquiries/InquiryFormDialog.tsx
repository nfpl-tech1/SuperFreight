"use client";

import { useDeferredValue, useEffect, useState } from "react";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CUSTOMER_ROLE_OPTIONS,
  INCOTERM_OPTIONS,
} from "@/lib/inquiryQuotePlanning";
import { api, type VendorLocationOption } from "@/lib/api";
import { VendorLocationPicker } from "@/components/rfq/VendorLocationPicker";
import {
  getLocationPlaceholder,
  getPortModeForShipmentMode,
  type InquiryFormState,
  SHIPMENT_MODE_OPTIONS,
  TRADE_LANE_OPTIONS,
} from "@/app/(protected)/inquiries/inquiry-form.helpers";

function usePortLocationOptions(
  query: string,
  portMode: "AIRPORT" | "SEAPORT",
) {
  const deferredQuery = useDeferredValue(query);
  const requestKey = `${portMode}:${deferredQuery.trim().toLowerCase()}`;
  const [result, setResult] = useState<{
    options: VendorLocationOption[];
    requestKey: string;
  }>({
    options: [],
    requestKey: "",
  });

  useEffect(() => {
    let cancelled = false;

    api
      .getVendorLocationOptions({
        locationKind: "PORT",
        portMode,
        pageSize: 20,
        search: deferredQuery.trim() || undefined,
      })
      .then((response) => {
        if (!cancelled) {
          setResult({
            options: response.items,
            requestKey,
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResult({
            options: [],
            requestKey,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [deferredQuery, portMode, requestKey]);

  return {
    options: result.options,
    loading: result.requestKey !== requestKey,
  };
}

interface InquiryFormDialogProps {
  mode: "create" | "edit";
  form: InquiryFormState;
  saving: boolean;
  isCustomerRoleRequired: boolean;
  onFormChange: (form: InquiryFormState) => void;
  onSave: () => void;
}

export function InquiryFormDialog({
  mode,
  form,
  saving,
  isCustomerRoleRequired,
  onFormChange,
  onSave,
}: InquiryFormDialogProps) {
  const portMode = getPortModeForShipmentMode(form.shipmentMode);
  const { options: originOptions, loading: loadingOriginOptions } =
    usePortLocationOptions(form.origin, portMode);
  const { options: destinationOptions, loading: loadingDestinationOptions } =
    usePortLocationOptions(form.destination, portMode);

  const updateField = <Key extends keyof InquiryFormState>(
    key: Key,
    value: InquiryFormState[Key],
  ) => {
    onFormChange({
      ...form,
      [key]: value,
    });
  };

  const handleShipmentModeChange = (shipmentMode: string) => {
    onFormChange({
      ...form,
      shipmentMode,
      origin: "",
      destination: "",
    });
  };

  return (
    <DialogContent className="max-h-[min(90svh,56rem)] overflow-y-auto sm:max-w-xl xl:max-w-2xl">
      <DialogHeader>
        <DialogTitle>
          {mode === "edit" ? "Edit Inquiry" : "Create Inquiry"}
        </DialogTitle>
        <DialogDescription>
          Capture the key shipment details first. The layout stays single-column
          on tighter laptop widths to keep each field readable.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="space-y-2">
            <Label>Inquiry Number</Label>
            <Input
              value={form.inquiryNumber}
              onChange={(event) =>
                updateField("inquiryNumber", event.target.value)
              }
              placeholder={
                mode === "edit" ? "Required" : "Auto-generated if left blank"
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Customer</Label>
            <Input
              value={form.customerName}
              onChange={(event) =>
                updateField("customerName", event.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Trade Lane</Label>
            <Select
              value={form.tradeLane}
              onValueChange={(value) => updateField("tradeLane", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRADE_LANE_OPTIONS.map((tradeLane) => (
                  <SelectItem key={tradeLane} value={tradeLane}>
                    {tradeLane}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Customer Role</Label>
          <Select
            value={form.customerRole || undefined}
            onValueChange={(value) =>
              updateField(
                "customerRole",
                value as InquiryFormState["customerRole"],
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select who sent the inquiry" />
            </SelectTrigger>
            <SelectContent>
              {CUSTOMER_ROLE_OPTIONS.map((customerRole) => (
                <SelectItem key={customerRole} value={customerRole}>
                  {customerRole}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isCustomerRoleRequired ? (
            <p className="text-xs text-muted-foreground">
              Export quote planning uses whether the inquiry came from the
              shipper or consignee/agent.
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="space-y-2">
            <Label>Mode</Label>
            <Select
              value={form.shipmentMode}
              onValueChange={handleShipmentModeChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SHIPMENT_MODE_OPTIONS.map((shipmentMode) => (
                  <SelectItem key={shipmentMode} value={shipmentMode}>
                    {shipmentMode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Incoterm</Label>
            <Select
              value={form.incoterm || undefined}
              onValueChange={(value) => updateField("incoterm", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select incoterm" />
              </SelectTrigger>
              <SelectContent>
                {INCOTERM_OPTIONS.map((incoterm) => (
                  <SelectItem key={incoterm} value={incoterm}>
                    {incoterm}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="space-y-2">
            <VendorLocationPicker
              label="Origin"
              placeholder={getLocationPlaceholder(form.shipmentMode, "origin")}
              value={form.origin}
              options={originOptions}
              loading={loadingOriginOptions}
              onQueryChange={(value) => updateField("origin", value)}
              onSelect={(option) => updateField("origin", option.label)}
              onClear={() => updateField("origin", "")}
            />
          </div>
          <div className="space-y-2">
            <VendorLocationPicker
              label="Destination"
              placeholder={getLocationPlaceholder(
                form.shipmentMode,
                "destination",
              )}
              value={form.destination}
              options={destinationOptions}
              loading={loadingDestinationOptions}
              onQueryChange={(value) => updateField("destination", value)}
              onSelect={(option) => updateField("destination", option.label)}
              onClear={() => updateField("destination", "")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Cargo Description</Label>
          <Input
            value={form.cargoSummary}
            onChange={(event) =>
              updateField("cargoSummary", event.target.value)
            }
          />
        </div>

        <Button
          onClick={onSave}
          className="w-full"
          disabled={
            !form.customerName ||
            (isCustomerRoleRequired && !form.customerRole) ||
            saving
          }
        >
          {saving
            ? mode === "edit"
              ? "Saving..."
              : "Creating..."
            : mode === "edit"
              ? "Save Changes"
              : "Save Inquiry"}
        </Button>
      </div>
    </DialogContent>
  );
}
