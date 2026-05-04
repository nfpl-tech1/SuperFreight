"use client";

import { MapPin, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Inquiry } from "@/lib/api";
import type { RecommendedQuoteType } from "@/components/rfq/hooks/use-rfq-wizard.helpers";
import { cn } from "@/lib/utils";

interface Props {
  inquiryId: string;
  inquiries: Inquiry[];
  currentInquiry?: Inquiry;
  quotePlanSummary: string;
  quoteOptions: RecommendedQuoteType[];
  departmentId: string;
  onInquiryChange: (id: string) => void;
  onDepartmentChange: (id: string) => void;
  onSaveQuote: () => Promise<void>;
  isSavingQuote: boolean;
  canEdit?: boolean;
  compact?: boolean;
  compactTitle?: string;
  compactSubtitle?: string;
}

function getQuoteStatusMeta(recommendation: Pick<RecommendedQuoteType, "isReady" | "draftCount" | "sentCount">) {
  if (recommendation.isReady) {
    const detailParts = [];

    if (recommendation.draftCount > 0) {
      detailParts.push(`${recommendation.draftCount} saved`);
    }

    if (recommendation.sentCount > 0) {
      detailParts.push(`${recommendation.sentCount} sent`);
    }

    return {
      dotClassName: "bg-emerald-500",
      pillClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
      label: "Ready",
      detail: detailParts.join(" | ") || "Saved",
    };
  }

  return {
    dotClassName: "bg-amber-400",
    pillClassName: "border-amber-200 bg-amber-50 text-amber-700",
    label: "Pending",
    detail: "Not saved yet",
  };
}

export function QuoteWorkspaceHeader({
  inquiryId,
  inquiries,
  currentInquiry,
  quotePlanSummary,
  quoteOptions,
  departmentId,
  onInquiryChange,
  onDepartmentChange,
  onSaveQuote,
  isSavingQuote,
  canEdit = true,
  compact = false,
  compactTitle,
  compactSubtitle,
}: Props) {
  const currentQuote =
    quoteOptions.find((recommendation) => recommendation.departmentId === departmentId) ??
    quoteOptions[0];
  const useCompactTabRail = true;

  const tabsContent = (
    <Tabs value={departmentId} onValueChange={onDepartmentChange} className="gap-3">
      {!compact && !useCompactTabRail ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Quote Tabs
            </span>
            <span className="text-xs text-muted-foreground">
              Select a quote type to work on it
            </span>
          </div>
        </div>
      ) : null}

      <div className={cn(compact && "overflow-x-auto")}>
        <TabsList
          className={cn(
            useCompactTabRail
              ? "!inline-flex !h-auto min-w-max gap-1 rounded-[0.45rem] border border-[hsl(214_28%_88%)] bg-[hsl(214_25%_95%)] p-1 !justify-start !items-stretch"
              : "!grid !h-auto !w-full grid-cols-1 gap-2 rounded-[1.1rem] border border-[hsl(214_32%_88%)] bg-[linear-gradient(180deg,hsl(214_45%_98%),hsl(214_30%_96%))] p-2.5 !justify-stretch !items-stretch shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] sm:grid-cols-2 xl:grid-cols-5",
          )}
        >
          {quoteOptions.map((recommendation) => {
            const status = getQuoteStatusMeta(recommendation);
            const isCurrentQuote = recommendation.departmentId === departmentId;
            const metaParts = [
              recommendation.locationFocus !== "Any"
                ? `${recommendation.locationFocus} vendors`
                : "Any vendor pool",
              recommendation.priority !== "recommended"
                ? "Fallback"
                : "Recommended",
            ];

            return (
              <Tooltip key={recommendation.departmentId}>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value={recommendation.departmentId}
                    className={cn(
                      useCompactTabRail
                        ? "!w-auto !justify-center h-9 rounded-[0.28rem] border px-4 py-1.5 text-xs font-semibold shadow-sm transition-colors" 
                        : "!w-full !justify-between h-auto min-h-[4.25rem] rounded-xl border px-3.5 py-3 text-left shadow-sm transition-all",
                      useCompactTabRail &&
                        (isCurrentQuote
                          ? "border-primary bg-[hsl(221_54%_31%)] text-white hover:bg-[hsl(221_54%_31%)] hover:text-white"
                          : "border-transparent bg-transparent text-[hsl(220_12%_42%)] hover:border-[hsl(214_28%_88%)] hover:bg-white hover:text-[hsl(221_41%_24%)]"),
                      !useCompactTabRail &&
                        (isCurrentQuote
                          ? "border-[hsl(221_54%_31%)] bg-[linear-gradient(180deg,hsl(225_54%_33%),hsl(221_52%_27%))] text-white shadow-[0_16px_30px_-24px_rgba(19,39,94,0.95)] hover:bg-[linear-gradient(180deg,hsl(225_54%_33%),hsl(221_52%_27%))] hover:text-white"
                          : recommendation.isReady
                            ? "border-emerald-200 bg-white text-[hsl(152_57%_24%)] hover:border-emerald-300 hover:bg-emerald-50/70"
                            : "border-amber-200 bg-white text-[hsl(31_86%_32%)] hover:border-amber-300 hover:bg-amber-50/70"),
                    )}
                  >
                    {useCompactTabRail ? (
                      <span className="truncate">{recommendation.label}</span>
                    ) : (
                      <>
                        <span className="flex min-w-0 items-center gap-2">
                          <span
                            className={cn(
                              "h-2.5 w-2.5 shrink-0 rounded-full",
                              isCurrentQuote ? "bg-white shadow-[0_0_0_3px_rgba(255,255,255,0.14)]" : status.dotClassName,
                            )}
                          />
                          <span className={cn("truncate font-semibold", isCurrentQuote && "text-white")}>
                            {recommendation.label}
                          </span>
                        </span>
                        <div className="ml-2 flex shrink-0 items-center gap-1.5">
                          {isCurrentQuote ? (
                            <Badge className="h-6 border border-white/20 bg-white/12 px-2 text-[0.65rem] text-white shadow-none hover:bg-white/12">
                              Current
                            </Badge>
                          ) : null}
                          <Badge
                            variant="outline"
                            className={cn(
                              "h-6 px-2 text-[0.65rem]",
                              isCurrentQuote
                                ? "border-white/20 bg-white/10 text-white"
                                : status.pillClassName,
                            )}
                          >
                            {status.label}
                          </Badge>
                        </div>
                      </>
                    )}
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={6} className="max-w-xs">
                  <p>{recommendation.reason}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {metaParts.join(" | ")} | {status.detail}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TabsList>
      </div>
    </Tabs>
  );

  if (compact) {
    return (
      <Card className="gap-0 overflow-hidden rounded-[0.75rem] border-[hsl(214_28%_88%)] py-0 shadow-[0_14px_32px_-28px_rgba(15,23,42,0.35)]">
        <CardContent className="bg-white px-5 py-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              {compactTitle ? (
                <h2 className="text-[1.35rem] font-semibold tracking-tight text-foreground">
                  {compactTitle}
                </h2>
              ) : null}
              {compactSubtitle ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {compactSubtitle}
                </p>
              ) : null}
            </div>
            <div className="min-w-0 xl:max-w-[56%]">
              {tabsContent}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gap-0 overflow-hidden rounded-[1.1rem] border-[hsl(214_32%_88%)] py-0 shadow-[0_18px_48px_-34px_rgba(19,39,94,0.38)]">
      <CardHeader className="block border-b border-[hsl(214_32%_90%)] px-5 py-5">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(24rem,42rem)] xl:items-start">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Quote Planning
              </CardTitle>
              {quoteOptions.length > 0 ? (
                <Badge variant="outline" className="h-5 px-2 text-[0.65rem]">
                  {quoteOptions.length} suggested
                </Badge>
              ) : null}
            </div>

            <CardDescription className="mt-2 line-clamp-2 text-sm leading-6 text-[hsl(220_24%_34%)]">
              {quotePlanSummary}
            </CardDescription>

            {currentInquiry ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="h-6 px-2 text-[0.6875rem]">
                  {currentInquiry.tradeLane ?? "Trade Lane TBC"}
                </Badge>
                <Badge variant="secondary" className="h-6 px-2 text-[0.6875rem]">
                  {currentInquiry.shipmentMode ?? "Mode TBC"}
                </Badge>
                <Badge variant="secondary" className="h-6 px-2 text-[0.6875rem]">
                  {currentInquiry.incoterm ?? "Incoterm TBC"}
                </Badge>
                <Badge variant="secondary" className="h-6 px-2 text-[0.6875rem]">
                  {currentInquiry.customerRole ?? "Customer Role TBC"}
                </Badge>
                <Badge variant="outline" className="h-6 max-w-full gap-1 px-2 text-[0.6875rem]">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">
                    {currentInquiry.origin ?? "Origin TBC"} {"->"} {currentInquiry.destination ?? "Destination TBC"}
                  </span>
                </Badge>
              </div>
            ) : null}
          </div>

          <div className="min-w-0 xl:ml-auto">
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
              <div className="grid gap-2">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Inquiry Number
                </p>
                <Select value={inquiryId} onValueChange={onInquiryChange}>
                  <SelectTrigger className="h-11 w-full bg-white">
                    <SelectValue placeholder="Select Inquiry..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {inquiries.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.inquiryNumber} - {item.customerName}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2 sm:min-w-[8.5rem]">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-transparent">
                  Save
                </p>
                <Button
                  type="button"
                  onClick={() => void onSaveQuote()}
                  disabled={!canEdit || isSavingQuote || currentQuote?.isReady}
                  className="h-11 min-w-[8.5rem]"
                >
                  <Save data-icon="inline-start" />
                  {isSavingQuote ? "Saving" : currentQuote?.isReady ? "Saved" : "Save Quote"}
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-3">
                <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Quote Tabs
                </span>
                <span className="text-xs text-muted-foreground">
                  Select a quote type to work on it
                </span>
              </div>
              <div className="mt-2 overflow-x-auto">
                {tabsContent}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
