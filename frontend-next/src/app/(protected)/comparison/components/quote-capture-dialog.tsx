"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import type { QuoteInboxMessage, RfqFieldSpec } from "@/lib/api";
import type { QuoteReviewFormState } from "../comparison.types";

const CORE_FIELDS: Array<{
  key: keyof Pick<
    QuoteReviewFormState,
    | "vendorName"
    | "currency"
    | "totalRate"
    | "freightRate"
    | "localCharges"
    | "documentation"
    | "transitDays"
    | "validUntil"
  >;
  label: string;
  type?: string;
}> = [
  { key: "vendorName", label: "Vendor Name" },
  { key: "currency", label: "Currency" },
  { key: "totalRate", label: "Total Rate", type: "number" },
  { key: "freightRate", label: "Freight Rate", type: "number" },
  { key: "localCharges", label: "Local Charges", type: "number" },
  { key: "documentation", label: "Documentation", type: "number" },
  { key: "transitDays", label: "Transit Days", type: "number" },
  { key: "validUntil", label: "Valid Until", type: "date" },
];

type QuoteCaptureDialogProps = {
  canEdit: boolean;
  fieldSpecs: RfqFieldSpec[];
  form: QuoteReviewFormState;
  inboxMessage?: QuoteInboxMessage | null;
  isOpen: boolean;
  isSaving: boolean;
  onComparisonFieldChange: (fieldKey: string, value: string) => void;
  onCoreFieldChange: (field: keyof QuoteReviewFormState, value: string) => void;
  onOpenChange: (value: boolean) => void;
  onSave: () => void;
};

export function QuoteCaptureDialog({
  canEdit,
  fieldSpecs,
  form,
  inboxMessage,
  isOpen,
  isSaving,
  onComparisonFieldChange,
  onCoreFieldChange,
  onOpenChange,
  onSave,
}: QuoteCaptureDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Review Extracted Quote</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[72vh] pr-4">
          <div className="space-y-6">
            {inboxMessage ? (
              <div className="rounded-xl border border-border bg-muted/40 p-4">
                <p className="text-sm font-medium">
                  {inboxMessage.fromName || inboxMessage.fromEmail || "Unknown sender"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {inboxMessage.subject || "No subject"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Received: {new Date(inboxMessage.receivedAt).toLocaleString()}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {inboxMessage.bodyPreview || "No preview available."}
                </p>
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              {CORE_FIELDS.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label>{field.label}</Label>
                  <Input
                    type={field.type}
                    value={form[field.key]}
                    disabled={!canEdit}
                    onChange={(event) => onCoreFieldChange(field.key, event.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold">RFQ Comparison Fields</h3>
                <p className="text-xs text-muted-foreground">
                  Edit the extracted values that will appear in the comparison grid.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {fieldSpecs.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label>{field.fieldLabel}</Label>
                    <Input
                      value={form.comparisonFields[field.fieldKey] ?? ""}
                      disabled={!canEdit}
                      onChange={(event) =>
                        onComparisonFieldChange(field.fieldKey, event.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Remarks</Label>
              <Textarea
                value={form.remarks}
                disabled={!canEdit}
                onChange={(event) => onCoreFieldChange("remarks", event.target.value)}
                rows={5}
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={onSave} disabled={!canEdit || isSaving}>
                {isSaving ? "Saving..." : "Save Review"}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
