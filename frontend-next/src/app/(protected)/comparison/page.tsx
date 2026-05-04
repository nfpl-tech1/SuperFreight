"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  api,
  FreightQuote,
  getErrorMessage,
  Inquiry,
  QuoteInboxMessage,
  Rfq,
  VendorDetail,
} from "@/lib/api";
import { canEditModule } from "@/lib/module-access";
import {
  buildQuoteUpdatePayload,
  createQuoteReviewForm,
  getLinkedQuoteId,
  getLowestQuoteRate,
  getSuggestedVendorId,
  updateComparisonField,
} from "./comparison.helpers";
import type {
  ComparisonWorkspaceState,
  QuoteReviewFormState,
} from "./comparison.types";
import { InquirySelectorCard } from "./components/inquiry-selector-card";
import { QuoteCaptureDialog } from "./components/quote-capture-dialog";
import { QuoteInboxPanel } from "./components/quote-inbox-panel";
import { RfqSelectorCard } from "./components/rfq-selector-card";
import { VendorQuotesTable } from "./components/vendor-quotes-table";

const INITIAL_LOADING_STATE: ComparisonWorkspaceState = {
  inquiries: false,
  rfqs: false,
  quotes: false,
  inbox: false,
};

export default function ComparisonPage() {
  const { user } = useAuth();
  const canEditComparison = canEditModule(user, "comparison");
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [quotes, setQuotes] = useState<FreightQuote[]>([]);
  const [inboxMessages, setInboxMessages] = useState<QuoteInboxMessage[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState("");
  const [selectedRfqId, setSelectedRfqId] = useState("");
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [linkableVendors, setLinkableVendors] = useState<VendorDetail[]>([]);
  const [selectedVendorByMessageId, setSelectedVendorByMessageId] = useState<
    Record<string, string>
  >({});
  const [reviewForm, setReviewForm] = useState<QuoteReviewFormState | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [loading, setLoading] = useState<ComparisonWorkspaceState>(
    INITIAL_LOADING_STATE,
  );

  const refreshComparisonWorkspace = useCallback(async (
    inquiryId = selectedInquiry,
    rfqId = selectedRfqId,
  ) => {
    if (!inquiryId || !rfqId) {
      return;
    }

    setLoading((prev) => ({ ...prev, quotes: true, inbox: true }));
    try {
      const [quoteData, inboxData] = await Promise.all([
        api.getQuotesByRfq({ inquiryId, rfqId }),
        api.getQuoteInbox({ inquiryId, rfqId }),
      ]);
      setQuotes(quoteData);
      setInboxMessages(inboxData);
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to refresh quotes and inbox messages"),
      );
    } finally {
      setLoading((prev) => ({ ...prev, quotes: false, inbox: false }));
    }
  }, [selectedInquiry, selectedRfqId]);

  useEffect(() => {
    setLoading((prev) => ({ ...prev, inquiries: true }));
    void api.getInquiries()
      .then(setInquiries)
      .catch((error) =>
        toast.error(getErrorMessage(error, "Failed to load inquiries")),
      )
      .finally(() =>
        setLoading((prev) => ({ ...prev, inquiries: false })),
      );
  }, []);

  useEffect(() => {
    if (!selectedInquiry) {
      setRfqs([]);
      setSelectedRfqId("");
      setLinkableVendors([]);
      setSelectedVendorByMessageId({});
      return;
    }

    setLoading((prev) => ({ ...prev, rfqs: true }));
    void api.getRfqs(selectedInquiry)
      .then((rfqData) => {
        setRfqs(rfqData);
        setSelectedRfqId((current) =>
          rfqData.some((rfq) => rfq.id === current) ? current : "",
        );
      })
      .catch((error) =>
        toast.error(getErrorMessage(error, "Failed to load RFQs")),
      )
      .finally(() => setLoading((prev) => ({ ...prev, rfqs: false })));
  }, [selectedInquiry]);

  useEffect(() => {
    if (!selectedInquiry || !selectedRfqId) {
      setQuotes([]);
      setInboxMessages([]);
      setLinkableVendors([]);
      setSelectedVendorByMessageId({});
      return;
    }

    void refreshComparisonWorkspace(selectedInquiry, selectedRfqId);
  }, [selectedInquiry, selectedRfqId, refreshComparisonWorkspace]);

  const selectedRfq = useMemo(
    () => rfqs.find((rfq) => rfq.id === selectedRfqId) ?? null,
    [rfqs, selectedRfqId],
  );

  useEffect(() => {
    if (!selectedRfq || selectedRfq.vendorIds.length === 0) {
      setLinkableVendors([]);
      setSelectedVendorByMessageId({});
      return;
    }

    void Promise.all(
      selectedRfq.vendorIds.map((vendorId) => api.getVendorDetail(vendorId)),
    )
      .then(setLinkableVendors)
      .catch((error) =>
        toast.error(getErrorMessage(error, "Failed to load RFQ vendors")),
      );
  }, [selectedRfq]);
  const selectedQuote = useMemo(
    () => quotes.find((quote) => quote.id === selectedQuoteId) ?? null,
    [quotes, selectedQuoteId],
  );
  const linkedInboxMessage = useMemo(
    () =>
      selectedQuote
        ? inboxMessages.find(
            (message) => getLinkedQuoteId(message) === selectedQuote.id,
          ) ?? null
        : null,
    [inboxMessages, selectedQuote],
  );
  const lowestRate = useMemo(() => getLowestQuoteRate(quotes), [quotes]);
  const linkableVendorOptions = useMemo(
    () =>
      linkableVendors.map((vendor) => ({
        id: vendor.id,
        label: vendor.companyName,
      })),
    [linkableVendors],
  );
  const linkableVendorIds = useMemo(
    () => linkableVendorOptions.map((vendor) => vendor.id),
    [linkableVendorOptions],
  );

  useEffect(() => {
    if (inboxMessages.length === 0 || linkableVendorIds.length === 0) {
      return;
    }

    setSelectedVendorByMessageId((prev) => {
      const next = { ...prev };
      let changed = false;

      for (const message of inboxMessages) {
        if (next[message.id]) {
          continue;
        }

        const suggestedVendorId = getSuggestedVendorId(message, linkableVendorIds);
        if (suggestedVendorId) {
          next[message.id] = suggestedVendorId;
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [inboxMessages, linkableVendorIds]);

  const openQuoteReview = (quoteId: string) => {
    const quote = quotes.find((item) => item.id === quoteId);
    if (!quote || !selectedRfq) {
      return;
    }

    setSelectedQuoteId(quoteId);
    setReviewForm(createQuoteReviewForm(quote, selectedRfq.fieldSpecs));
    setIsReviewOpen(true);
  };

  const handleScanMailbox = async () => {
    try {
      const result = await api.triggerQuoteInboxScan();
      await refreshComparisonWorkspace();
      toast.success(
        result.started ? "Mailbox scan triggered" : "Scan already running",
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to trigger mailbox scan"));
    }
  };

  const handleReprocessInboxMessage = async (messageId: string) => {
    try {
      const quote = await api.reprocessQuoteInboxMessage(messageId);
      await refreshComparisonWorkspace();
      if (quote?.id) {
        openQuoteReview(quote.id);
      }
      toast.success("Message reprocessed");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to reprocess message"));
    }
  };

  const handleIgnoreInboxMessage = async (messageId: string) => {
    try {
      await api.ignoreQuoteInboxMessage(messageId);
      await refreshComparisonWorkspace();
      toast.success("Message ignored");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to ignore message"));
    }
  };

  const handleVendorSelectionChange = (messageId: string, vendorId: string) => {
    setSelectedVendorByMessageId((prev) => ({
      ...prev,
      [messageId]: vendorId,
    }));
  };

  const handleLinkInboxMessage = async (messageId: string) => {
    if (!selectedRfqId) {
      toast.error("Select an RFQ before linking messages.");
      return;
    }

    const vendorId = selectedVendorByMessageId[messageId];
    if (!vendorId) {
      toast.error("Select a vendor to link this message.");
      return;
    }

    try {
      const quote = await api.linkQuoteInboxMessage(messageId, {
        rfqId: selectedRfqId,
        vendorId,
      });
      await refreshComparisonWorkspace();
      if (quote?.id) {
        openQuoteReview(quote.id);
      }
      toast.success("Message linked and extraction triggered");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to link message"));
    }
  };

  const handleReviewFormFieldChange = (
    field: keyof QuoteReviewFormState,
    value: string,
  ) => {
    setReviewForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleComparisonFieldChange = (fieldKey: string, value: string) => {
    setReviewForm((prev) =>
      prev ? updateComparisonField(prev, fieldKey, value) : prev,
    );
  };

  const handleSaveReview = async () => {
    if (!selectedQuote || !reviewForm) {
      return;
    }

    setIsSavingReview(true);
    try {
      await api.updateQuote(selectedQuote.id, buildQuoteUpdatePayload(reviewForm));
      await refreshComparisonWorkspace();
      setIsReviewOpen(false);
      toast.success("Quote review saved");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save reviewed quote"));
    } finally {
      setIsSavingReview(false);
    }
  };

  const handleSelectQuote = (quoteId: string) => {
    router.push(`/customer-quote?quoteId=${quoteId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quote Comparison Engine</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Compare received quotations RFQ by RFQ, review extracted drafts,
            and move the best quote into customer pricing.
          </p>
        </div>
      </div>

      <InquirySelectorCard
        inquiries={inquiries}
        selectedInquiry={selectedInquiry}
        onSelectInquiry={(value) => {
          setSelectedInquiry(value);
          setSelectedQuoteId(null);
          setReviewForm(null);
          setIsReviewOpen(false);
        }}
      />

      {selectedInquiry ? (
        <RfqSelectorCard
          rfqs={rfqs}
          selectedRfqId={selectedRfqId}
          onSelectRfq={(value) => {
            setSelectedRfqId(value);
            setSelectedQuoteId(null);
            setReviewForm(null);
            setIsReviewOpen(false);
          }}
        />
      ) : null}

      {selectedInquiry && !loading.rfqs && rfqs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
          No RFQs were found for this inquiry yet. Send an RFQ first, then come
          back here to review received quotations.
        </div>
      ) : null}

      {selectedRfq ? (
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <QuoteInboxPanel
            canEdit={canEditComparison}
            inboxMessages={inboxMessages}
            isBusy={loading.inbox || loading.quotes}
            linkableVendorOptions={linkableVendorOptions}
            onIgnore={handleIgnoreInboxMessage}
            onLinkMessage={handleLinkInboxMessage}
            onOpenLinkedQuote={openQuoteReview}
            onReprocess={handleReprocessInboxMessage}
            onScan={() => void handleScanMailbox()}
            onVendorSelectionChange={handleVendorSelectionChange}
            selectedVendorByMessageId={selectedVendorByMessageId}
          />

          <VendorQuotesTable
            canEdit={canEditComparison}
            fieldSpecs={selectedRfq.fieldSpecs}
            lowestRate={lowestRate}
            onReviewQuote={openQuoteReview}
            onSelectQuote={handleSelectQuote}
            quotes={quotes}
          />
        </div>
      ) : null}

      {selectedQuote && reviewForm && selectedRfq ? (
        <QuoteCaptureDialog
          canEdit={canEditComparison}
          fieldSpecs={selectedRfq.fieldSpecs}
          form={reviewForm}
          inboxMessage={linkedInboxMessage}
          isOpen={isReviewOpen}
          isSaving={isSavingReview}
          onComparisonFieldChange={handleComparisonFieldChange}
          onCoreFieldChange={handleReviewFormFieldChange}
          onOpenChange={setIsReviewOpen}
          onSave={() => void handleSaveReview()}
        />
      ) : null}
    </div>
  );
}
