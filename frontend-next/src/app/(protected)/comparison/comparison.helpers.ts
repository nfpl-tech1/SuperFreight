import { FreightQuote, Inquiry } from "@/lib/api";
import type { QuoteFormState, SelectableVendor } from "./comparison.types";

export const EMPTY_QUOTE_FORM: QuoteFormState = {
  vendorId: "",
  vendorName: "",
  freightRate: "0",
  localCharges: "0",
  documentation: "0",
  totalRate: "0",
  transitDays: "0",
  validUntil: "",
  remarks: "",
};

export function createEmptyQuoteForm(): QuoteFormState {
  return { ...EMPTY_QUOTE_FORM };
}

export function getLowestQuoteRate(quotes: FreightQuote[]) {
  return quotes.length > 0 ? Math.min(...quotes.map((quote) => Number(quote.totalRate ?? 0))) : 0;
}

export function applyVendorToQuoteForm(
  currentForm: QuoteFormState,
  vendorId: string,
  vendors: SelectableVendor[],
): QuoteFormState {
  const vendor = vendors.find((item) => item.id === vendorId);

  return {
    ...currentForm,
    vendorId,
    vendorName: vendor?.name ?? "",
  };
}

export function buildQuoteCreatePayload(selectedInquiry: string, form: QuoteFormState) {
  return {
    inquiryId: selectedInquiry,
    vendorId: form.vendorId || undefined,
    vendorName: form.vendorName,
    freightRate: Number(form.freightRate),
    localCharges: Number(form.localCharges),
    documentation: Number(form.documentation),
    totalRate: Number(form.totalRate),
    transitDays: Number(form.transitDays),
    validUntil: form.validUntil || undefined,
    remarks: form.remarks || undefined,
  };
}

export function formatInquiryOptionLabel(inquiry: Inquiry) {
  return `${inquiry.inquiryNumber} - ${inquiry.customerName} (${inquiry.origin ?? "TBC"} -> ${inquiry.destination ?? "TBC"})`;
}
