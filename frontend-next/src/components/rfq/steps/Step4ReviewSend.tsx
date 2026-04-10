"use client";

import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RFQPreview, type RfqPreviewDraft } from "@/components/rfq/RFQPreview";
import {
  formatSelectedCount,
} from "@/components/rfq/steps/rfq-step.helpers";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { toast } from "sonner";
import type {
  DepartmentDefinition,
  FormValues,
  ResponseField,
  FilterableVendor,
  VendorDispatchTarget,
} from "@/types/rfq";
import type { OutlookStatus } from "@/lib/api";
import {
  ResponseFieldList,
  SendRfqButton,
  VendorDispatchList,
} from "./step4-review-send.parts";

interface Props {
  department: DepartmentDefinition;
  formValues: FormValues;
  selectedResponseFields: ResponseField[];
  selectedVendors: FilterableVendor[];
  selectedVendorDispatchTargets: VendorDispatchTarget[];
  inquiryId?: string;
  inquiryNumber?: string;
  inquiryCustomer?: string;
  tradeLane?: string;
  incoterm?: string;
  isSending?: boolean;
  outlookStatus?: OutlookStatus | null;
  onOfficeChange: (vendorId: string, officeId: string, checked: boolean) => void;
  onSend: (draft: RfqPreviewDraft | null) => Promise<void>;
}

export function Step4ReviewSend({
    department, formValues, selectedResponseFields,
    selectedVendors, selectedVendorDispatchTargets, inquiryId = "", inquiryNumber = "", inquiryCustomer = "", tradeLane, incoterm, isSending = false, outlookStatus = null, onOfficeChange, onSend,
}: Props) {
    const isMobile = useIsMobile();
    const selectedVendorSummary = formatSelectedCount(selectedVendors.length, "vendor");
    const selectedFieldSummary = formatSelectedCount(selectedResponseFields.length, "response field");
    const draftGetterRef = useRef<(() => RfqPreviewDraft) | null>(null);
    const canSendViaOutlook = !!outlookStatus?.isConnected;
    const dispatchTargetsReady = selectedVendorDispatchTargets.every(
      (target) =>
        !target.isLoading &&
        !target.needsAttention &&
        target.selectedOfficeIds.length > 0,
    );
    const dispatchIssues = selectedVendorDispatchTargets.filter(
      (target) =>
        target.isLoading ||
        target.needsAttention ||
        target.selectedOfficeIds.length === 0,
    );
    const outlookStatusLabel = outlookStatus?.isConnected
      ? "Connected"
      : outlookStatus?.reconnectRequired
        ? "Reconnect required"
        : "Not connected";
    const outlookStatusDescription = outlookStatus?.isConnected
      ? `Sending from ${outlookStatus.mailbox ?? "your Outlook mailbox"}.`
      : outlookStatus?.reconnectRequired
        ? "Reconnect Outlook once from your Profile page to enable sending."
        : "Connect Outlook from your Profile page to send RFQs.";

    const handleSend = async () => {
        await onSend(draftGetterRef.current?.() ?? null);
        toast.success(`RFQ Sent! Dispatched to ${selectedVendors.length} vendor(s). You'll receive responses in your inbox.`);
    };

    if (isMobile) {
        return (
            <div className="flex flex-col gap-3">
                <div className="rounded-xl border border-border bg-card shadow-sm">
                    <div className="border-b border-border px-4 py-3">
                        <p className="text-sm font-semibold text-card-foreground">Ready to Dispatch</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {selectedVendorSummary} selected with {selectedFieldSummary}.
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Outlook</span>
                            <Badge variant={canSendViaOutlook ? "default" : outlookStatus?.reconnectRequired ? "outline" : "secondary"}>
                                {outlookStatusLabel}
                            </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{outlookStatusDescription}</p>
                        {dispatchIssues.length > 0 ? (
                          <p className="mt-2 text-xs text-amber-700">
                            Resolve the sending offices for {dispatchIssues.length} vendor{dispatchIssues.length !== 1 ? "s" : ""} before sending.
                          </p>
                        ) : null}
                    </div>
                    <div className="px-4 py-4">
                        <SendRfqButton count={selectedVendors.length} disabled={selectedVendors.length === 0 || !canSendViaOutlook || !dispatchTargetsReady} loading={isSending} onClick={() => void handleSend()} />
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="border-b border-border px-4 py-3">
                        <span className="text-sm font-semibold leading-none text-card-foreground">Review Details</span>
                    </div>
                    <Accordion type="multiple" defaultValue={["vendors", "fields"]} className="px-4">
                        <AccordionItem value="vendors">
                            <AccordionTrigger className="py-3 text-sm hover:no-underline">
                                Selected Vendors ({selectedVendors.length})
                            </AccordionTrigger>
                            <AccordionContent>
                                <VendorDispatchList
                                  targets={selectedVendorDispatchTargets}
                                  onOfficeChange={onOfficeChange}
                                />
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="fields">
                            <AccordionTrigger className="py-3 text-sm hover:no-underline">
                                Expected Response Fields ({selectedResponseFields.length})
                            </AccordionTrigger>
                            <AccordionContent>
                                <ResponseFieldList fields={selectedResponseFields} />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>

                <div className="min-h-[26rem] overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <RFQPreview
                        departmentName={department.name}
                        departmentId={department.id}
                        inquiryId={inquiryId}
                        inquiryNumber={inquiryNumber}
                        companyName={inquiryCustomer}
                        fields={department.fields}
                        values={formValues}
                        tradeLane={tradeLane}
                        incoterm={incoterm}
                        hideSendButton
                        hideCopyButton
                        onDraftReady={(fn) => { draftGetterRef.current = fn; }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex gap-3">
            <div className="flex-1 flex flex-col overflow-hidden min-w-0 rounded-xl border border-border bg-card shadow-sm">
                <div className="flex-1 min-h-0 overflow-hidden">
                    <RFQPreview
                        departmentName={department.name}
                        departmentId={department.id}
                        inquiryId={inquiryId}
                        inquiryNumber={inquiryNumber}
                        companyName={inquiryCustomer}
                        fields={department.fields}
                        values={formValues}
                        tradeLane={tradeLane}
                        incoterm={incoterm}
                        hideSendButton
                        hideCopyButton
                        onDraftReady={(fn) => { draftGetterRef.current = fn; }}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto min-h-0" style={{ width: "22rem", minWidth: "22rem" }}>
                <div className="shrink-0 rounded-xl border border-border bg-card shadow-sm">
                    <div className="border-b border-border px-4 py-2">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-semibold leading-none text-card-foreground">Outlook Mailbox</span>
                            <Badge variant={canSendViaOutlook ? "default" : outlookStatus?.reconnectRequired ? "outline" : "secondary"}>
                                {outlookStatusLabel}
                            </Badge>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">{outlookStatusDescription}</p>
                        {dispatchIssues.length > 0 ? (
                          <p className="mt-2 text-xs text-amber-700">
                            Resolve the sending offices for {dispatchIssues.length} vendor{dispatchIssues.length !== 1 ? "s" : ""} before sending.
                          </p>
                        ) : null}
                    </div>
                </div>

                <div className="shrink-0 rounded-xl border border-border bg-card shadow-sm">
                    <div className="px-4 py-2 border-b border-border">
                        <span className="text-sm font-semibold leading-none text-card-foreground">Selected Vendors ({selectedVendors.length})</span>
                    </div>
                    <div className="px-4 py-2">
                        <VendorDispatchList
                          targets={selectedVendorDispatchTargets}
                          compact
                          onOfficeChange={onOfficeChange}
                        />
                    </div>
                </div>

                <div className="shrink-0 rounded-xl border border-border bg-card shadow-sm">
                    <div className="px-4 py-2 border-b border-border">
                        <span className="text-sm font-semibold leading-none text-card-foreground">Expected Response Fields ({selectedResponseFields.length})</span>
                    </div>
                    <div className="px-4 py-2">
                        <ResponseFieldList fields={selectedResponseFields} />
                    </div>
                </div>

                <div className="shrink-0">
                    <SendRfqButton count={selectedVendors.length} disabled={selectedVendors.length === 0 || !canSendViaOutlook || !dispatchTargetsReady} loading={isSending} onClick={() => void handleSend()} />
                </div>
            </div>
        </div>
    );
}
