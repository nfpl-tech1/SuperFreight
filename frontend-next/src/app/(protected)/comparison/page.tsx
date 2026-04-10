"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api, FreightQuote, Inquiry } from "@/lib/api";
import { filterableVendors } from "@/data/sampleVendors";
import {
  applyVendorToQuoteForm,
  buildQuoteCreatePayload,
  createEmptyQuoteForm,
  getLowestQuoteRate,
} from "./comparison.helpers";
import type { QuoteFormState, SelectableVendor } from "./comparison.types";
import { InquirySelectorCard } from "./components/inquiry-selector-card";
import { QuoteCaptureDialog } from "./components/quote-capture-dialog";
import { VendorQuotesTable } from "./components/vendor-quotes-table";

export default function ComparisonPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [vendors, setVendors] = useState<SelectableVendor[]>([]);
  const [quotes, setQuotes] = useState<FreightQuote[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<QuoteFormState>(createEmptyQuoteForm);

  useEffect(() => {
    void api.getInquiries()
      .then((inquiryData) => {
        setInquiries(inquiryData);
        setVendors(
          filterableVendors.map((vendor) => ({
            id: vendor.id,
            name: vendor.name,
            locationMaster: vendor.locationMaster,
          })),
        );
      })
      .catch(() => toast.error("Failed to load comparison data"));
  }, []);

  useEffect(() => {
    if (!selectedInquiry) return;
    void api.getQuotes(selectedInquiry)
      .then(setQuotes)
      .catch(() => toast.error("Failed to load quotes"));
  }, [selectedInquiry]);

  const lowestRate = useMemo(() => getLowestQuoteRate(quotes), [quotes]);

  const handleSelect = (quoteId: string) => {
    router.push(`/customer-quote?quoteId=${quoteId}`);
  };

  const handleVendorChange = (vendorId: string) => {
    setForm((prev) => applyVendorToQuoteForm(prev, vendorId, vendors));
  };

  const handleFormValueChange = (field: keyof QuoteFormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveQuote = async () => {
    if (!selectedInquiry) {
      toast.error("Select an inquiry first.");
      return;
    }
    try {
      await api.createQuote(buildQuoteCreatePayload(selectedInquiry, form));
      setIsOpen(false);
      setForm(createEmptyQuoteForm());
      setQuotes(await api.getQuotes(selectedInquiry));
      toast.success("Quote captured");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save quote");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quote Comparison Engine</h1>
          <p className="text-sm text-muted-foreground mt-1">Compare captured vendor quotations inquiry by inquiry.</p>
        </div>
        <QuoteCaptureDialog
          isOpen={isOpen}
          canOpen={!!selectedInquiry}
          vendors={vendors}
          form={form}
          onOpenChange={setIsOpen}
          onVendorChange={handleVendorChange}
          onFormValueChange={handleFormValueChange}
          onSave={() => void handleSaveQuote()}
        />
      </div>
      <InquirySelectorCard
        inquiries={inquiries}
        selectedInquiry={selectedInquiry}
        onSelectInquiry={setSelectedInquiry}
      />

      <VendorQuotesTable quotes={quotes} lowestRate={lowestRate} onSelectQuote={handleSelect} />
    </div>
  );
}
