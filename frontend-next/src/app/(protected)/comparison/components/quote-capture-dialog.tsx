"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { QuoteFormState, SelectableVendor } from "../comparison.types";

const QUOTE_INPUT_FIELDS: Array<{
  key: keyof Pick<
    QuoteFormState,
    "freightRate" | "localCharges" | "documentation" | "totalRate" | "transitDays"
  >;
  label: string;
}> = [
  { key: "freightRate", label: "Freight Rate" },
  { key: "localCharges", label: "Local Charges" },
  { key: "documentation", label: "Documentation" },
  { key: "totalRate", label: "Total Rate" },
  { key: "transitDays", label: "Transit Days" },
];

type QuoteCaptureDialogProps = {
  isOpen: boolean;
  canOpen: boolean;
  vendors: SelectableVendor[];
  form: QuoteFormState;
  onOpenChange: (value: boolean) => void;
  onVendorChange: (vendorId: string) => void;
  onFormValueChange: (field: keyof QuoteFormState, value: string) => void;
  onSave: () => void;
};

export function QuoteCaptureDialog({
  isOpen,
  canOpen,
  vendors,
  form,
  onOpenChange,
  onVendorChange,
  onFormValueChange,
  onSave,
}: QuoteCaptureDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={!canOpen}>Add Quote</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Capture Vendor Quote</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Vendor</Label>
            <Select value={form.vendorId} onValueChange={onVendorChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select vendor..." />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name} {vendor.locationMaster ? `(${vendor.locationMaster})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {QUOTE_INPUT_FIELDS.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label>{field.label}</Label>
                <Input
                  value={form[field.key]}
                  onChange={(event) => onFormValueChange(field.key, event.target.value)}
                />
              </div>
            ))}

            <div className="space-y-2">
              <Label>Valid Until</Label>
              <Input
                type="date"
                value={form.validUntil}
                onChange={(event) => onFormValueChange("validUntil", event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Remarks</Label>
            <Input
              value={form.remarks}
              onChange={(event) => onFormValueChange("remarks", event.target.value)}
            />
          </div>

          <Button onClick={onSave} className="w-full" disabled={!form.vendorName}>
            Save Quote
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
