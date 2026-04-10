"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, FileText, HourglassIcon, MessageSquare, Plus, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api, Inquiry } from "@/lib/api";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { toast } from "sonner";

const statusConfig: Record<string, { dot: string; text: string; bg: string }> = {
  PENDING: { dot: "bg-yellow-400", text: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200" },
  RFQ_SENT: { dot: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  QUOTES_RECEIVED: { dot: "bg-green-500", text: "text-green-700", bg: "bg-green-50 border-green-200" },
  QUOTED_TO_CUSTOMER: { dot: "bg-purple-500", text: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
  CLOSED: { dot: "bg-slate-400", text: "text-slate-600", bg: "bg-slate-50 border-slate-200" },
};

export default function DashboardPage() {
  const isMobile = useIsMobile();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  useEffect(() => {
    api.getInquiries().then(setInquiries).catch(() => toast.error("Failed to load inquiries"));
  }, []);

  const summaryCards = useMemo(
    () => [
      { label: "PENDING ENQUIRIES", value: inquiries.filter((e) => e.status === "PENDING").length, icon: Clock, subtitle: "Needs triage" },
      { label: "ACTIVE RFQS", value: inquiries.filter((e) => e.status === "RFQ_SENT").length, icon: FileText, subtitle: "Awaiting vendor replies" },
      { label: "QUOTES RECEIVED", value: inquiries.filter((e) => e.status === "QUOTES_RECEIVED").length, icon: MessageSquare, subtitle: "Ready for comparison" },
      { label: "AWAITING RESPONSE", value: inquiries.filter((e) => e.status === "QUOTED_TO_CUSTOMER").length, icon: HourglassIcon, subtitle: "With customers" },
    ],
    [inquiries]
  );

  return (
    <div className="flex flex-col gap-6 min-h-full">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {isMobile ? "Dashboard" : "Dashboard Overview"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Live view of inquiry capture, RFQs, and quote progress.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="font-medium px-6 py-2.5 rounded-lg text-sm shadow-sm">
            <Link href="/inquiries">
              <Plus className="h-4 w-4 mr-1" /> New Inquiry
            </Link>
          </Button>
          <Button asChild className="font-medium px-6 py-2.5 rounded-lg text-sm shadow-sm">
            <Link href="/rfq">
              <FileText className="h-4 w-4 mr-1" /> New RFQ
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-6 border border-border shadow-sm hover:shadow-md hover:-translate-y-px transition-all max-sm:p-4">
            <div className="flex items-start justify-between mb-2">
              <span className="text-[0.6875rem] font-semibold tracking-[0.06em] uppercase text-primary">{card.label}</span>
              <card.icon className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>
            <div className="text-[2.25rem] font-bold text-foreground leading-[1.1] mb-2 max-sm:text-[1.75rem]">{card.value}</div>
            <div className="flex items-center text-xs font-medium text-slate-500">
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              {card.subtitle}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Recent Inquiries</h2>
        </div>

        {!isMobile && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-muted/40">
                  {["INQUIRY", "CUSTOMER", "ROUTE", "MODE", "STATUS", "CREATED"].map((heading) => (
                    <th key={heading} className="px-6 py-3.5 text-[0.6875rem] font-semibold tracking-[0.06em] uppercase text-muted-foreground whitespace-nowrap">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inquiry) => {
                  const status = statusConfig[inquiry.status] || statusConfig.PENDING;
                  return (
                    <tr key={inquiry.id} className="cursor-pointer hover:bg-primary/5 transition-colors">
                      <td className="px-6 py-4 border-t border-border/50 font-semibold text-primary whitespace-nowrap">{inquiry.inquiryNumber}</td>
                      <td className="px-6 py-4 border-t border-border/50 font-medium text-foreground">{inquiry.customerName}</td>
                      <td className="px-6 py-4 border-t border-border/50">
                        <span className="flex items-center text-muted-foreground text-[0.8125rem] whitespace-nowrap gap-2">
                          {inquiry.origin ?? "TBC"}<ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />{inquiry.destination ?? "TBC"}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-t border-border/50">
                        <Badge variant="outline" className="text-xs font-medium px-3 py-1 rounded-full">{inquiry.shipmentMode ?? inquiry.inquiryType}</Badge>
                      </td>
                      <td className="px-6 py-4 border-t border-border/50">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${status.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${status.dot}`} />
                          <span className={status.text}>{inquiry.status.replaceAll("_", " ")}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 border-t border-border/50 text-muted-foreground text-[0.8125rem] whitespace-nowrap">{new Date(inquiry.createdAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {isMobile && (
          <div className="flex flex-col">
            {inquiries.map((inquiry) => {
              const status = statusConfig[inquiry.status] || statusConfig.PENDING;
              return (
                <div key={inquiry.id} className="px-5 py-4 border-t border-border/50 first:border-t-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[0.6875rem] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{inquiry.inquiryNumber}</span>
                    <span className="text-xs text-muted-foreground">{new Date(inquiry.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-[0.9375rem] font-semibold text-foreground mb-1">{inquiry.customerName}</h3>
                  <div className="flex items-center text-[0.8125rem] text-muted-foreground mb-3 gap-1.5">
                    <span>{inquiry.origin ?? "TBC"}</span>
                    <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
                    <span>{inquiry.destination ?? "TBC"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[0.6875rem] font-medium px-2.5 py-0.5 rounded-full">{inquiry.shipmentMode ?? inquiry.inquiryType}</Badge>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.6875rem] font-medium border ${status.bg}`}>
                      <span className={`w-1 h-1 rounded-full shrink-0 ${status.dot}`} />
                      <span className={status.text}>{inquiry.status.replaceAll("_", " ")}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
