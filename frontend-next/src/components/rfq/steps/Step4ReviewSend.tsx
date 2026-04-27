"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { FileText, Paperclip, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RFQPreview, type RfqPreviewDraft } from "@/components/rfq/RFQPreview";
import { formatSelectedCount } from "@/components/rfq/steps/rfq-step.helpers";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { toast } from "sonner";
import type {
  DepartmentDefinition,
  FilterableVendor,
  FormValues,
  ResponseField,
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
  isExwClubbed?: boolean;
  isSending?: boolean;
  outlookStatus?: OutlookStatus | null;
  customCcEmail: string;
  onCustomCcEmailChange: (value: string) => void;
  onOfficeChange: (
    vendorId: string,
    officeId: string,
    checked: boolean,
  ) => void;
  onSend: (draft: RfqPreviewDraft | null, attachments: File[]) => Promise<void>;
}

const ATTACHMENT_ACCEPT =
  ".pdf,.png,.jpg,.jpeg,.gif,.webp,.bmp,.svg,.doc,.docx,.xls,.xlsx,.csv,.txt";

function mergeAttachments(existingFiles: File[], nextFiles: File[]) {
  const filesByKey = new Map(
    existingFiles.map((file) => [
      `${file.name}:${file.size}:${file.lastModified}`,
      file,
    ]),
  );

  for (const file of nextFiles) {
    filesByKey.set(`${file.name}:${file.size}:${file.lastModified}`, file);
  }

  return Array.from(filesByKey.values());
}

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function isValidOptionalEmail(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

function AttachmentPanel({
  attachments,
  disabled,
  onAdd,
  onRemove,
}: {
  attachments: File[];
  disabled: boolean;
  onAdd: () => void;
  onRemove: (fileToRemove: File) => void;
}) {
  return (
    <div className="shrink-0 rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-4 py-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold leading-none text-card-foreground">
            Attachments
          </span>
          <Badge variant="outline">
            {attachments.length} file{attachments.length !== 1 ? "s" : ""}
          </Badge>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Add screenshots, PDFs, images, or documents. They are sent with the
          RFQ and not stored in the app.
        </p>
      </div>
      <div className="space-y-3 px-4 py-3">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start"
          onClick={onAdd}
          disabled={disabled}
        >
          <Paperclip className="mr-2 h-4 w-4" />
          Add attachment
        </Button>

        {attachments.length > 0 ? (
          <div className="space-y-2">
            {attachments.map((file) => (
              <div
                key={`${file.name}:${file.size}:${file.lastModified}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/25 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => onRemove(file)}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-3 py-4 text-center text-xs text-muted-foreground">
            <FileText className="mx-auto mb-2 h-4 w-4" />
            No files attached yet.
          </div>
        )}
      </div>
    </div>
  );
}

export function Step4ReviewSend({
  department,
  formValues,
  selectedResponseFields,
  selectedVendors,
  selectedVendorDispatchTargets,
  inquiryId = "",
  inquiryNumber = "",
  inquiryCustomer = "",
  tradeLane,
  incoterm,
  isExwClubbed,
  isSending = false,
  outlookStatus = null,
  customCcEmail,
  onCustomCcEmailChange,
  onOfficeChange,
  onSend,
}: Props) {
  const isMobile = useIsMobile();
  const selectedVendorSummary = formatSelectedCount(
    selectedVendors.length,
    "vendor",
  );
  const selectedFieldSummary = formatSelectedCount(
    selectedResponseFields.length,
    "response field",
  );
  const draftGetterRef = useRef<(() => RfqPreviewDraft) | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
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
  const hasValidCustomCcEmail = isValidOptionalEmail(customCcEmail);

  const handleAttachmentSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files ?? []);
    if (nextFiles.length === 0) {
      return;
    }

    setAttachments((currentAttachments) =>
      mergeAttachments(currentAttachments, nextFiles),
    );
    event.target.value = "";
  };

  const handleRemoveAttachment = (fileToRemove: File) => {
    setAttachments((currentAttachments) =>
      currentAttachments.filter(
        (file) =>
          `${file.name}:${file.size}:${file.lastModified}` !==
          `${fileToRemove.name}:${fileToRemove.size}:${fileToRemove.lastModified}`,
      ),
    );
  };

  const handleSend = async () => {
    if (!hasValidCustomCcEmail) {
      toast.error("Enter a valid internal CC email before sending.");
      return;
    }

    await onSend(draftGetterRef.current?.() ?? null, attachments);
    setAttachments([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success(
      `RFQ Sent! Dispatched to ${selectedVendors.length} vendor(s). You'll receive responses in your inbox.`,
    );
  };

  if (isMobile) {
    return (
      <div className="flex flex-col gap-3">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ATTACHMENT_ACCEPT}
          className="hidden"
          onChange={handleAttachmentSelection}
        />

        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-card-foreground">
              Ready to Dispatch
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {selectedVendorSummary} selected with {selectedFieldSummary}.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Outlook</span>
              <Badge
                variant={
                  canSendViaOutlook
                    ? "default"
                    : outlookStatus?.reconnectRequired
                      ? "outline"
                      : "secondary"
                }
              >
                {outlookStatusLabel}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {outlookStatusDescription}
            </p>
            {dispatchIssues.length > 0 ? (
              <p className="mt-2 text-xs text-amber-700">
                Resolve the sending offices for {dispatchIssues.length} vendor
                {dispatchIssues.length !== 1 ? "s" : ""} before sending.
              </p>
            ) : null}
          </div>
          <div className="px-4 py-4">
            <SendRfqButton
              count={selectedVendors.length}
              disabled={
                selectedVendors.length === 0 ||
                !canSendViaOutlook ||
                !dispatchTargetsReady ||
                !hasValidCustomCcEmail
              }
              loading={isSending}
              onClick={() => void handleSend()}
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-card-foreground">
              Internal CC
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Optional. Add one internal senior staff email to be CCed on every
              vendor RFQ mail.
            </p>
          </div>
          <div className="px-4 py-4">
            <Input
              type="email"
              inputMode="email"
              placeholder="senior.staff@company.com"
              value={customCcEmail}
              onChange={(event) => onCustomCcEmailChange(event.target.value)}
              aria-invalid={!hasValidCustomCcEmail}
              disabled={isSending}
            />
            {!hasValidCustomCcEmail ? (
              <p className="mt-2 text-xs text-red-600">
                Enter a valid email address or leave this blank.
              </p>
            ) : null}
          </div>
        </div>

        <AttachmentPanel
          attachments={attachments}
          disabled={isSending}
          onAdd={() => fileInputRef.current?.click()}
          onRemove={handleRemoveAttachment}
        />

        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-4 py-3">
            <span className="text-sm font-semibold leading-none text-card-foreground">
              Review Details
            </span>
          </div>
          <Accordion
            type="multiple"
            defaultValue={["vendors", "fields"]}
            className="px-4"
          >
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
            isExwClubbed={isExwClubbed}
            hideSendButton
            hideCopyButton
            onDraftReady={(fn) => {
              draftGetterRef.current = fn;
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex gap-3">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ATTACHMENT_ACCEPT}
        className="hidden"
        onChange={handleAttachmentSelection}
      />

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
            isExwClubbed={isExwClubbed}
            hideSendButton
            hideCopyButton
            onDraftReady={(fn) => {
              draftGetterRef.current = fn;
            }}
          />
        </div>
      </div>

      <div
        className="flex flex-col gap-3 overflow-y-auto min-h-0"
        style={{ width: "22rem", minWidth: "22rem" }}
      >
        <div className="shrink-0 rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-4 py-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold leading-none text-card-foreground">
                Outlook Mailbox
              </span>
              <Badge
                variant={
                  canSendViaOutlook
                    ? "default"
                    : outlookStatus?.reconnectRequired
                      ? "outline"
                      : "secondary"
                }
              >
                {outlookStatusLabel}
              </Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {outlookStatusDescription}
            </p>
            {dispatchIssues.length > 0 ? (
              <p className="mt-2 text-xs text-amber-700">
                Resolve the sending offices for {dispatchIssues.length} vendor
                {dispatchIssues.length !== 1 ? "s" : ""} before sending.
              </p>
            ) : null}
          </div>
        </div>

        <div className="shrink-0 rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-4 py-2">
            <span className="text-sm font-semibold leading-none text-card-foreground">
              Internal CC
            </span>
            <p className="mt-2 text-xs text-muted-foreground">
              Optional. Add one internal senior staff email to be CCed on every
              vendor RFQ mail.
            </p>
          </div>
          <div className="px-4 py-3">
            <Input
              type="email"
              inputMode="email"
              placeholder="senior.staff@company.com"
              value={customCcEmail}
              onChange={(event) => onCustomCcEmailChange(event.target.value)}
              aria-invalid={!hasValidCustomCcEmail}
              disabled={isSending}
            />
            {!hasValidCustomCcEmail ? (
              <p className="mt-2 text-xs text-red-600">
                Enter a valid email address or leave this blank.
              </p>
            ) : null}
          </div>
        </div>

        <div className="shrink-0 rounded-xl border border-border bg-card shadow-sm">
          <div className="px-4 py-2 border-b border-border">
            <span className="text-sm font-semibold leading-none text-card-foreground">
              Selected Vendors ({selectedVendors.length})
            </span>
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
            <span className="text-sm font-semibold leading-none text-card-foreground">
              Expected Response Fields ({selectedResponseFields.length})
            </span>
          </div>
          <div className="px-4 py-2">
            <ResponseFieldList fields={selectedResponseFields} />
          </div>
        </div>

        <AttachmentPanel
          attachments={attachments}
          disabled={isSending}
          onAdd={() => fileInputRef.current?.click()}
          onRemove={handleRemoveAttachment}
        />

        <div className="shrink-0">
          <SendRfqButton
            count={selectedVendors.length}
            disabled={
              selectedVendors.length === 0 ||
              !canSendViaOutlook ||
              !dispatchTargetsReady ||
              !hasValidCustomCcEmail
            }
            loading={isSending}
            onClick={() => void handleSend()}
          />
        </div>
      </div>
    </div>
  );
}
