"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { QuoteInboxMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  formatInboxMatchSummary,
  formatInboxStatusLabel,
  formatMatchConfidenceLabel,
  formatMatchSignalLabel,
  getLinkedQuoteId,
  getInboxInquiryNumber,
  getInboxMatchConfidence,
  getMatchedBySignals,
  getSuggestedRfqIds,
  getSuggestedVendorId,
  getSuggestedVendorIds,
} from "../comparison.helpers";

type QuoteInboxPanelProps = {
  canEdit: boolean;
  inboxMessages: QuoteInboxMessage[];
  isBusy: boolean;
  linkableVendorOptions: Array<{ id: string; label: string }>;
  onIgnore: (messageId: string) => void;
  onLinkMessage: (messageId: string) => void;
  onOpenLinkedQuote: (quoteId: string) => void;
  onReprocess: (messageId: string) => void;
  onScan: () => void;
  onVendorSelectionChange: (messageId: string, vendorId: string) => void;
  selectedVendorByMessageId: Record<string, string>;
};

export function QuoteInboxPanel({
  canEdit,
  inboxMessages,
  isBusy,
  linkableVendorOptions,
  onIgnore,
  onLinkMessage,
  onOpenLinkedQuote,
  onReprocess,
  onScan,
  onVendorSelectionChange,
  selectedVendorByMessageId,
}: QuoteInboxPanelProps) {
  return (
    <Card className="min-h-[28rem]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Received Quote Inbox</CardTitle>
        <Button size="sm" variant="outline" onClick={onScan} disabled={!canEdit || isBusy}>
          Scan Mailbox
        </Button>
      </CardHeader>
      <CardContent>
        {inboxMessages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No received messages are linked to this RFQ yet.
          </p>
        ) : (
          <ScrollArea className="h-[24rem] pr-3">
            <div className="space-y-3">
              {inboxMessages.map((message) => {
                const linkedQuoteId = getLinkedQuoteId(message);
                const inquiryNumber = getInboxInquiryNumber(message);
                const matchConfidence = getInboxMatchConfidence(message);
                const matchConfidenceLabel = formatMatchConfidenceLabel(matchConfidence);
                const matchedBySignals = getMatchedBySignals(message);
                const suggestedVendorIds = getSuggestedVendorIds(message);
                const suggestedRfqIds = getSuggestedRfqIds(message);
                const suggestedVendorId = getSuggestedVendorId(
                  message,
                  linkableVendorOptions.map((vendor) => vendor.id),
                );
                const suggestedVendorLabel =
                  linkableVendorOptions.find((vendor) => vendor.id === suggestedVendorId)?.label ??
                  null;

                return (
                  <div
                    key={message.id}
                    className="rounded-xl border border-border bg-card/50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">
                          {message.fromName || message.fromEmail || "Unknown sender"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {message.subject || "No subject"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Received: {new Date(message.receivedAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge
                        className={cn(
                          "border-transparent",
                          message.status === "needs_review" && "bg-amber-500 text-white",
                          message.status === "failed" && "bg-rose-600 text-white",
                          message.status === "ignored" && "bg-slate-500 text-white",
                          message.status === "unmatched" && "bg-sky-600 text-white",
                          message.status === "extraction_pending" && "bg-indigo-600 text-white",
                          message.status === "finalized" && "bg-emerald-600 text-white",
                        )}
                      >
                        {formatInboxStatusLabel(message.status)}
                      </Badge>
                    </div>

                    <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                      {message.bodyPreview || "No preview available."}
                    </p>

                    {inquiryNumber || matchConfidenceLabel || matchedBySignals.length > 0 ? (
                      <div className="mt-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                        <p className="text-xs font-medium text-foreground">
                          {formatInboxMatchSummary(message)}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {inquiryNumber ? (
                            <Badge variant="secondary">Inquiry {inquiryNumber}</Badge>
                          ) : null}
                          {matchConfidenceLabel ? (
                            <Badge variant="outline">{matchConfidenceLabel}</Badge>
                          ) : null}
                          {suggestedVendorLabel ? (
                            <Badge variant="outline">
                              Suggested vendor: {suggestedVendorLabel}
                            </Badge>
                          ) : null}
                          {suggestedRfqIds.length === 1 ? (
                            <Badge variant="outline">Suggested RFQ in current inquiry</Badge>
                          ) : null}
                        </div>
                        {matchedBySignals.length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {matchedBySignals.map((signal) => (
                              <Badge key={signal} variant="secondary" className="text-[11px]">
                                {formatMatchSignalLabel(signal)}
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                        {suggestedVendorIds.length > 1 ? (
                          <p className="mt-2 text-xs text-muted-foreground">
                            Multiple vendors are plausible, so this message still needs manual
                            confirmation.
                          </p>
                        ) : null}
                      </div>
                    ) : null}

                    {message.failureReason ? (
                      <p className="mt-2 text-xs text-rose-600">{message.failureReason}</p>
                    ) : null}

                    {message.ignoreReason ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Ignore reason: {message.ignoreReason}
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onReprocess(message.id)}
                        disabled={!canEdit || isBusy}
                      >
                        Reprocess
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onIgnore(message.id)}
                        disabled={!canEdit || isBusy}
                      >
                        Ignore
                      </Button>
                      {linkedQuoteId ? (
                        <Button
                          size="sm"
                          onClick={() => onOpenLinkedQuote(linkedQuoteId)}
                          disabled={!canEdit || isBusy}
                        >
                          Review Draft
                        </Button>
                      ) : null}
                      {message.webLink ? (
                        <Button size="sm" variant="ghost" asChild>
                          <a href={message.webLink} target="_blank" rel="noreferrer">
                            Open Mail
                          </a>
                        </Button>
                      ) : null}
                    </div>

                    {!linkedQuoteId && linkableVendorOptions.length > 0 ? (
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Select
                          value={selectedVendorByMessageId[message.id] ?? ""}
                          disabled={!canEdit}
                          onValueChange={(value) =>
                            onVendorSelectionChange(message.id, value)
                          }
                        >
                          <SelectTrigger className="sm:max-w-xs">
                            <SelectValue placeholder="Select vendor to link..." />
                          </SelectTrigger>
                          <SelectContent>
                            {linkableVendorOptions.map((vendor) => (
                              <SelectItem key={vendor.id} value={vendor.id}>
                                {vendor.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          onClick={() => onLinkMessage(message.id)}
                          disabled={
                            !canEdit || isBusy || !selectedVendorByMessageId[message.id]
                          }
                        >
                          Link & Extract
                        </Button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
