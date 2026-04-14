"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FormValues, FieldDefinition } from "@/types/rfq";
import {
  Send,
  Bold,
  Italic,
  Underline,
  List as ListIcon,
  ListOrdered,
  RefreshCcw,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import {
  buildPreviewEmailHtml,
  buildPreviewRows,
  buildPreviewSubjectLine,
  buildPreviewTableHtml,
  buildTemplatePreviewEmailHtml,
  resolveTemplate,
} from "@/components/rfq/rfqPreview.helpers";

interface Props {
  departmentName: string;
  departmentId: string;
  inquiryId?: string;
  inquiryNumber?: string;
  companyName: string;
  fields: FieldDefinition[];
  values: FormValues;
  tradeLane?: string;
  incoterm?: string;
  isExwClubbed?: boolean;
  onSendViaOutlook?: () => void;
  hideSendButton?: boolean;
  hideCopyButton?: boolean;
  onCopyReady?: (fn: () => Promise<void>) => void;
  onDraftReady?: (fn: () => RfqPreviewDraft) => void;
}

export interface RfqPreviewDraft {
  subjectLine: string;
  html: string;
}

export function RFQPreview({
  departmentId,
  inquiryId,
  inquiryNumber,
  fields,
  values,
  tradeLane,
  incoterm,
  isExwClubbed,
  onSendViaOutlook,
  hideSendButton,
  onCopyReady,
  onDraftReady,
}: Props) {
  const rows = buildPreviewRows(fields, values);
  const editorRef = useRef<HTMLDivElement>(null);
  const prevRowsRef = useRef(rows);
  const [isEdited, setIsEdited] = useState(false);

  // Resolve the matching email template based on department + trade lane + mode + variant
  const stuffingTypeMap: Record<string, string> = {
    "Factory Stuffing": "factory_stuffing",
    "Dock Stuffing": "dock_stuffing",
    "Factory Destuffing": "factory_destuffing",
    "Dock Destuffing": "dock_destuffing",
  };
  const stuffingType =
    typeof values.stuffing_type === "string"
      ? (stuffingTypeMap[values.stuffing_type] ?? undefined)
      : undefined;

  // Trade lane from form values (if present) or from inquiry prop
  const effectiveTradeLane =
    typeof values.trade_lane === "string"
      ? values.trade_lane.toUpperCase()
      : tradeLane;

  const matchedTemplate = useMemo(
    () =>
      resolveTemplate({
        departmentId,
        formValues: values,
        tradeLane: effectiveTradeLane,
        incoterm,
        stuffingType,
        isExwClubbed,
      }),
    [
      departmentId,
      values,
      effectiveTradeLane,
      incoterm,
      stuffingType,
      isExwClubbed,
    ],
  );

  const fallbackPreviewHtml = useMemo(() => {
    if (matchedTemplate) {
      return buildTemplatePreviewEmailHtml(matchedTemplate, values);
    }

    return buildPreviewEmailHtml({
      departmentId,
      tableHtml: buildPreviewTableHtml(rows),
    });
  }, [departmentId, matchedTemplate, rows, values]);

  useEffect(() => {
    if (!editorRef.current) return;
    const tableDOM = editorRef.current.querySelector(
      "#rfq-dynamic-table-container table",
    );

    // Use template-based rendering when a template matches
    if (matchedTemplate) {
      const resolveValue =
        isEdited && tableDOM
          ? (row: { label: string; value: string }) => {
              const prev = prevRowsRef.current.find(
                (prevRow) => prevRow.label === row.label,
              );
              if (prev && prev.value === row.value) {
                const cell = Array.from(
                  tableDOM.querySelectorAll("td[data-value-label]"),
                ).find(
                  (td) => td.getAttribute("data-value-label") === row.label,
                );
                if (cell) return cell.innerHTML;
              }
              return row.value;
            }
          : undefined;

      if (!isEdited) {
        editorRef.current.innerHTML = buildTemplatePreviewEmailHtml(
          matchedTemplate,
          values,
          resolveValue,
        );
      } else {
        const tableContainer = editorRef.current.querySelector(
          "#rfq-dynamic-table-container",
        );
        if (tableContainer) {
          // Re-render only the data table, keep user edits to text
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = buildTemplatePreviewEmailHtml(
            matchedTemplate,
            values,
            resolveValue,
          );
          const newTable = tempDiv.querySelector(
            "#rfq-dynamic-table-container",
          );
          if (newTable) tableContainer.innerHTML = newTable.innerHTML;
        }
      }
    } else {
      // Fallback to legacy preview
      const tableHtml = buildPreviewTableHtml(rows, (row) => {
        let displayValue = row.value;

        if (isEdited && tableDOM) {
          const prev = prevRowsRef.current.find(
            (prevRow) => prevRow.label === row.label,
          );
          if (prev && prev.value === row.value) {
            const cell = Array.from(
              tableDOM.querySelectorAll("td[data-value-label]"),
            ).find((td) => td.getAttribute("data-value-label") === row.label);
            if (cell) displayValue = cell.innerHTML;
          }
        }

        return displayValue;
      });

      if (!isEdited) {
        editorRef.current.innerHTML = buildPreviewEmailHtml({
          departmentId,
          tableHtml,
        });
      } else {
        const tableContainer = editorRef.current.querySelector(
          "#rfq-dynamic-table-container",
        );
        if (tableContainer) tableContainer.innerHTML = tableHtml;
      }
    }

    prevRowsRef.current = rows;
  }, [rows, isEdited, departmentId, inquiryId, values, matchedTemplate]);

  const handleInput = () => {
    if (!isEdited) setIsEdited(true);
  };

  const handleFormat = (event: MouseEvent, command: string) => {
    event.preventDefault();
    document.execCommand(command, false);
    editorRef.current?.focus();
    if (!isEdited) setIsEdited(true);
  };

  async function handleCopyToClipboardImpl() {
    if (!editorRef.current) return;
    const outputHtml = editorRef.current.innerHTML;
    const plainText = editorRef.current.innerText;

    try {
      if (navigator.clipboard && typeof ClipboardItem !== "undefined") {
        const htmlBlob = new Blob([outputHtml], { type: "text/html" });
        const textBlob = new Blob([plainText], { type: "text/plain" });
        await navigator.clipboard.write([
          new ClipboardItem({ "text/html": htmlBlob, "text/plain": textBlob }),
        ]);
      } else {
        await navigator.clipboard.writeText(plainText);
      }
      toast.success("Copied to clipboard. Rich text preserved for Outlook.");
    } catch {
      toast.error("Copy failed. Please try again.");
    }
  }

  useEffect(() => {
    if (onCopyReady) onCopyReady(handleCopyToClipboardImpl);
  }, [onCopyReady]);

  const computedSubjectLine = buildPreviewSubjectLine(
    departmentId,
    inquiryNumber || inquiryId || "",
    values,
  );
  const subjectContextKey = `${departmentId}::${inquiryId}::${inquiryNumber}`;
  const [subjectOverride, setSubjectOverride] = useState<{
    contextKey: string;
    value: string;
  } | null>(null);
  const isSubjectEdited = subjectOverride?.contextKey === subjectContextKey;
  const subjectLine = isSubjectEdited
    ? (subjectOverride?.value ?? computedSubjectLine)
    : computedSubjectLine;

  useEffect(() => {
    if (!onDraftReady) {
      return;
    }

    onDraftReady(() => ({
      subjectLine,
      html: editorRef.current?.innerHTML?.trim() || fallbackPreviewHtml,
    }));
  }, [fallbackPreviewHtml, onDraftReady, subjectLine]);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <div className="flex flex-col gap-1.5 border-b border-border px-3 py-2.5 sm:flex-row sm:items-baseline">
        <h3 className="m-0 flex items-center gap-2 text-sm font-semibold text-primary">
          Email Preview
          {isEdited && (
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-700">
              Manual Edit Mode
            </span>
          )}
        </h3>
        {matchedTemplate && (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
            <FileText className="h-2.5 w-2.5" />
            {matchedTemplate.name}
          </span>
        )}
        <span className="text-[0.6875rem] text-muted-foreground">
          {isEdited
            ? "Auto-update paused to protect your edits"
            : "Auto-updates as you fill the form"}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1 border-y border-slate-200 bg-slate-50 px-3 py-1.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-slate-600"
          onClick={(event) => handleFormat(event, "bold")}
        >
          <Bold className="h-[15px] w-[15px]" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-slate-600"
          onClick={(event) => handleFormat(event, "italic")}
        >
          <Italic className="h-[15px] w-[15px]" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-slate-600"
          onClick={(event) => handleFormat(event, "underline")}
        >
          <Underline className="h-[15px] w-[15px]" />
        </Button>
        <div className="mx-1 h-4 w-px bg-slate-300" />
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-slate-600"
          onClick={(event) => handleFormat(event, "insertOrderedList")}
        >
          <ListOrdered className="h-[15px] w-[15px]" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-slate-600"
          onClick={(event) => handleFormat(event, "insertUnorderedList")}
        >
          <ListIcon className="h-[15px] w-[15px]" />
        </Button>
        {isEdited && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEdited(false)}
            className="ml-auto h-7 px-2 text-[11px] text-orange-600 hover:bg-orange-100 hover:text-orange-700"
          >
            <RefreshCcw className="h-3 w-3 mr-1" /> Restore Auto-update
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 pt-3 text-[0.8125rem] leading-relaxed text-[hsl(215_20%_25%)]">
        <div className="mb-3 space-y-2 border-b border-slate-100 pb-3">
          <div className="flex items-center justify-between gap-3">
            <strong className="text-[0.8125rem] text-[hsl(228_55%_40%)]">
              Subject
            </strong>
            {isSubjectEdited ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSubjectOverride(null)}
                className="h-7 px-2 text-[11px] text-orange-600 hover:bg-orange-100 hover:text-orange-700"
              >
                <RefreshCcw className="mr-1 h-3 w-3" />
                Restore Auto-title
              </Button>
            ) : null}
          </div>
          <Input
            value={subjectLine}
            onChange={(event) =>
              setSubjectOverride({
                contextKey: subjectContextKey,
                value: event.target.value,
              })
            }
            placeholder="Edit the subject line before sending"
          />
        </div>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          className="min-h-[200px] overflow-x-auto rounded p-2 outline-none transition-colors hover:bg-slate-50/50 [&_table]:w-full"
        />
      </div>

      {!hideSendButton && onSendViaOutlook && (
        <div className="flex justify-end gap-2 border-t border-border px-3 py-2.5">
          <Button onClick={onSendViaOutlook} className="text-[0.8125rem]">
            <Send className="h-4 w-4 mr-2" /> Send via Outlook
          </Button>
        </div>
      )}
    </div>
  );
}
