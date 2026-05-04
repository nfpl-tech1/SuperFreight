"use client";

import { useRef, useState, useEffect, type ChangeEvent } from "react";
import { FileText, Paperclip, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  MscFieldKey,
  MscFields,
  ResponseField,
  VendorDispatchTarget,
} from "@/types/rfq";
import { api, type OutlookStatus, type PortMasterListItem } from "@/lib/api";
import { MSC_FIELD_DEFINITIONS } from "@/components/rfq/msc-format.helpers";
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
  canEdit?: boolean;
  outlookStatus?: OutlookStatus | null;
  customCcEmail: string;
  mscFields: MscFields;
  isMscRequired: boolean;
  mscVendors: FilterableVendor[];
  missingMscFields: string[];
  onCustomCcEmailChange: (value: string) => void;
  onMscFieldChange: (key: MscFieldKey, value: string) => void;
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value: string) {
  return EMAIL_RE.test(value.trim());
}

function parseEmailList(value: string): string[] {
  return value
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function isValidOptionalEmailList(value: string) {
  const emails = parseEmailList(value);
  return emails.length === 0 || emails.every(isValidEmail);
}

function MultiEmailChipInput({
  value,
  disabled,
  onChange,
}: {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  const [chips, setChips] = useState<string[]>(() => parseEmailList(value));
  const [inputVal, setInputVal] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (prevValueRef.current !== value) {
      prevValueRef.current = value;
      setChips(parseEmailList(value));
    }
  }, [value]);

  const sync = (next: string[]) => {
    setChips(next);
    prevValueRef.current = next.join(",");
    onChange(next.join(","));
  };

  const commit = (raw: string) => {
    const emails = parseEmailList(raw);
    if (emails.length === 0) return;
    const next = Array.from(new Set([...chips, ...emails]));
    sync(next);
    setInputVal("");
  };

  const remove = (idx: number) => {
    sync(chips.filter((_, i) => i !== idx));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["Enter", "Tab", ",", " "].includes(e.key)) {
      if (inputVal.trim()) {
        e.preventDefault();
        commit(inputVal);
      }
    } else if (e.key === "Backspace" && !inputVal && chips.length > 0) {
      remove(chips.length - 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    if (parseEmailList(pasted).length > 1 || pasted.includes(",") || pasted.includes(";")) {
      e.preventDefault();
      commit(pasted);
    }
  };

  const hasError = chips.some((c) => !isValidEmail(c));

  return (
    <div
      className={[
        "flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-sm ring-offset-background",
        "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        hasError ? "border-red-300 focus-within:ring-red-400" : "border-input",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-text",
      ].join(" ")}
      onClick={() => !disabled && inputRef.current?.focus()}
    >
      {chips.map((email, idx) => {
        const invalid = !isValidEmail(email);
        return (
          <span
            key={`${email}-${idx}`}
            className={[
              "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
              invalid
                ? "bg-red-100 text-red-700 ring-1 ring-red-300"
                : "bg-muted text-foreground",
            ].join(" ")}
          >
            {email}
            {!disabled && (
              <button
                type="button"
                aria-label={`Remove ${email}`}
                className="ml-0.5 rounded-sm opacity-60 hover:opacity-100 focus:outline-none"
                onClick={(e) => { e.stopPropagation(); remove(idx); }}
                tabIndex={-1}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        );
      })}
      <input
        ref={inputRef}
        type="email"
        inputMode="email"
        value={inputVal}
        disabled={disabled}
        placeholder={chips.length === 0 ? "senior.staff@company.com" : "Add another..."}
        className="min-w-40 flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        onChange={(e) => setInputVal(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={() => { if (inputVal.trim()) commit(inputVal); }}
      />
    </div>
  );
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

function formatPortLabel(port: PortMasterListItem) {
  return `(${port.code}) ${port.name}`;
}

function PortSearchInput({
  value,
  placeholder,
  disabled,
  isMissing,
  onChange,
}: {
  value: string;
  placeholder?: string;
  disabled: boolean;
  isMissing: boolean;
  onChange: (value: string) => void;
}) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<PortMasterListItem[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const page = await api.getPortMaster({ search: query, portMode: "SEAPORT", isActive: true, pageSize: 10 });
        setResults(page.items);
        setOpen(page.items.length > 0);
      } catch {
        setResults([]);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={query}
        disabled={disabled}
        placeholder={placeholder}
        aria-invalid={isMissing}
        className={isMissing ? "border-red-300 focus-visible:ring-red-400" : ""}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
        }}
        onFocus={() => results.length > 0 && setOpen(true)}
      />
      {open && (
        <ul className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md text-sm max-h-48 overflow-y-auto">
          {results.map((port) => (
            <li
              key={port.id}
              className="cursor-pointer px-3 py-2 hover:bg-accent"
              onMouseDown={(e) => {
                e.preventDefault();
                const label = formatPortLabel(port);
                setQuery(label);
                onChange(label);
                setOpen(false);
              }}
            >
              <span className="font-medium">{port.code}</span>
              <span className="text-muted-foreground"> — {port.name}</span>
              {port.countryName && (
                <span className="text-muted-foreground">, {port.countryName}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MscFieldsPanel({
  isRequired,
  mscVendors,
  fields,
  missingFields,
  disabled,
  onChange,
}: {
  isRequired: boolean;
  mscVendors: FilterableVendor[];
  fields: MscFields;
  missingFields: string[];
  disabled: boolean;
  onChange: (key: MscFieldKey, value: string) => void;
}) {
  if (!isRequired) {
    return null;
  }

  return (
    <div className="rounded-xl border border-amber-300/70 bg-amber-50/60 shadow-sm">
      <div className="border-b border-amber-300/70 px-4 py-3">
        <p className="text-sm font-semibold text-amber-950">MSC Required Fields</p>
        <p className="mt-1 text-xs text-amber-900/80">
          MSC uses its own enquiry format. These fields are required before sending
          because {mscVendors.map((vendor) => vendor.name).join(", ")} will receive
          an MSC-specific RFQ email while the other vendors keep the standard format.
        </p>
        {missingFields.length > 0 ? (
          <p className="mt-2 text-xs font-medium text-amber-800">
            Still required: {missingFields.join(", ")}
          </p>
        ) : null}
      </div>
      <div className="grid gap-3 px-4 py-4 md:grid-cols-2">
        {MSC_FIELD_DEFINITIONS.map((field) => {
          const isMissing = missingFields.includes(field.label);
          const commonProps = {
            value: fields[field.key],
            disabled,
            "aria-invalid": isMissing,
            placeholder: field.placeholder,
            onChange: (
              event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
            ) => onChange(field.key, event.target.value),
            className: isMissing ? "border-red-300 focus-visible:ring-red-400" : "",
          };

          return (
            <label
              key={field.key}
              className={field.multiline ? "md:col-span-2" : "space-y-2"}
            >
              <span className="text-xs font-medium text-amber-950">
                {field.label}
              </span>
              {field.portSearch ? (
                <PortSearchInput
                  value={fields[field.key]}
                  placeholder={field.placeholder}
                  disabled={disabled}
                  isMissing={isMissing}
                  onChange={(val) => onChange(field.key, val)}
                />
              ) : field.multiline ? (
                <Textarea rows={3} {...commonProps} />
              ) : (
                <Input {...commonProps} />
              )}
            </label>
          );
        })}
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
  canEdit = true,
  outlookStatus = null,
  customCcEmail,
  mscFields,
  isMscRequired,
  mscVendors,
  missingMscFields,
  onCustomCcEmailChange,
  onMscFieldChange,
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
  const hasValidCustomCcEmail = isValidOptionalEmailList(customCcEmail);
  const canSend = 
    canEdit &&
    selectedVendors.length > 0 &&
    canSendViaOutlook &&
    dispatchTargetsReady &&
    hasValidCustomCcEmail &&
    missingMscFields.length === 0;

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

    if (missingMscFields.length > 0) {
      toast.error(
        `Complete the MSC-required fields before sending: ${missingMscFields.join(", ")}.`,
      );
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
                !canSend
              }
              loading={isSending}
              onClick={() => void handleSend()}
            />
          </div>
        </div>

        <MscFieldsPanel
          isRequired={isMscRequired}
          mscVendors={mscVendors}
          fields={mscFields}
          missingFields={missingMscFields}
          disabled={!canEdit || isSending}
          onChange={onMscFieldChange}
        />

        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-card-foreground">
              Internal CC
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Optional. Add one or more internal staff emails to CC on every
              vendor RFQ mail. Press Enter or comma to add each.
            </p>
          </div>
          <div className="px-4 py-4">
            <MultiEmailChipInput
              value={customCcEmail}
              disabled={!canEdit || isSending}
              onChange={onCustomCcEmailChange}
            />
            {!hasValidCustomCcEmail ? (
              <p className="mt-2 text-xs text-red-600">
                One or more emails are invalid.
              </p>
            ) : null}
          </div>
        </div>

        <AttachmentPanel
          attachments={attachments}
          disabled={!canEdit || isSending}
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
              Optional. Add one or more internal staff emails to CC on every
              vendor RFQ mail. Press Enter or comma to add each.
            </p>
          </div>
          <div className="px-4 py-3">
            <MultiEmailChipInput
              value={customCcEmail}
              disabled={!canEdit || isSending}
              onChange={onCustomCcEmailChange}
            />
            {!hasValidCustomCcEmail ? (
              <p className="mt-2 text-xs text-red-600">
                One or more emails are invalid.
              </p>
            ) : null}
          </div>
        </div>

        <MscFieldsPanel
          isRequired={isMscRequired}
          mscVendors={mscVendors}
          fields={mscFields}
          missingFields={missingMscFields}
          disabled={!canEdit || isSending}
          onChange={onMscFieldChange}
        />

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
          disabled={!canEdit || isSending}
          onAdd={() => fileInputRef.current?.click()}
          onRemove={handleRemoveAttachment}
        />

        <div className="shrink-0">
          <SendRfqButton
            count={selectedVendors.length}
            disabled={
              !canSend
            }
            loading={isSending}
            onClick={() => void handleSend()}
          />
        </div>
      </div>
    </div>
  );
}
