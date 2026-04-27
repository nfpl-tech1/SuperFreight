import type {
  FreightQuote,
  Inquiry,
  QuoteInboxMessage,
  QuoteInboxMessageMetadata,
  RfqFieldSpec,
} from "@/lib/api";
import { formatInquiryLabel } from "@/lib/formatting/display";
import type {
  ComparisonColumn,
  QuoteReviewFormState,
} from "./comparison.types";

export function formatInquiryOptionLabel(inquiry: Inquiry) {
  return formatInquiryLabel(inquiry);
}

export function getLowestQuoteRate(quotes: FreightQuote[]) {
  const eligibleQuotes = quotes
    .map((quote) => Number(quote.totalRate))
    .filter((value) => Number.isFinite(value) && value > 0);

  return eligibleQuotes.length > 0 ? Math.min(...eligibleQuotes) : null;
}

export function getComparisonColumns(
  fieldSpecs: RfqFieldSpec[],
  quotes: FreightQuote[],
): ComparisonColumn[] {
  if (fieldSpecs.length > 0) {
    return fieldSpecs.map((field) => ({
      key: field.fieldKey,
      label: field.fieldLabel,
    }));
  }

  const discoveredKeys = new Map<string, ComparisonColumn>();
  for (const quote of quotes) {
    for (const key of Object.keys(quote.comparisonFields ?? {})) {
      if (!discoveredKeys.has(key)) {
        discoveredKeys.set(key, {
          key,
          label: humanizeFieldKey(key),
        });
      }
    }
  }

  return Array.from(discoveredKeys.values());
}

export function createQuoteReviewForm(
  quote: FreightQuote,
  fieldSpecs: RfqFieldSpec[],
): QuoteReviewFormState {
  const comparisonFields = Object.fromEntries(
    getComparisonColumns(fieldSpecs, [quote]).map((field) => [
      field.key,
      stringifyFieldValue(quote.comparisonFields?.[field.key]),
    ]),
  );

  return {
    vendorName: quote.vendorName,
    currency: quote.currency ?? "USD",
    totalRate: stringifyFieldValue(quote.totalRate),
    freightRate: stringifyFieldValue(quote.freightRate),
    localCharges: stringifyFieldValue(quote.localCharges),
    documentation: stringifyFieldValue(quote.documentation),
    transitDays: stringifyFieldValue(quote.transitDays),
    validUntil: quote.validUntil ?? "",
    remarks: quote.remarks ?? "",
    reviewStatus: quote.reviewStatus ?? "reviewed",
    comparisonFields,
  };
}

export function updateComparisonField(
  form: QuoteReviewFormState,
  key: string,
  value: string,
): QuoteReviewFormState {
  return {
    ...form,
    comparisonFields: {
      ...form.comparisonFields,
      [key]: value,
    },
  };
}

export function buildQuoteUpdatePayload(form: QuoteReviewFormState) {
  return {
    vendorName: form.vendorName.trim(),
    currency: form.currency.trim() || undefined,
    totalRate: parseOptionalNumber(form.totalRate),
    freightRate: parseOptionalNumber(form.freightRate),
    localCharges: parseOptionalNumber(form.localCharges),
    documentation: parseOptionalNumber(form.documentation),
    transitDays: parseOptionalInteger(form.transitDays),
    validUntil: form.validUntil.trim() || undefined,
    remarks: form.remarks.trim() || undefined,
    reviewStatus: form.reviewStatus.trim() || undefined,
    comparisonFields: sanitizeComparisonFields(form.comparisonFields),
    extractedFields: sanitizeComparisonFields(form.comparisonFields),
  };
}

export function getLinkedQuoteId(message: QuoteInboxMessage) {
  const quoteId = message.rawMetadata?.quoteId;
  return typeof quoteId === "string" ? quoteId : null;
}

export function getInboxMetadata(message: QuoteInboxMessage) {
  return message.rawMetadata ?? null;
}

export function getInboxInquiryNumber(message: QuoteInboxMessage) {
  const inquiryNumber = getInboxMetadata(message)?.inquiryNumber;
  return typeof inquiryNumber === "string" ? inquiryNumber : null;
}

export function getInboxMatchConfidence(message: QuoteInboxMessage) {
  const matchConfidence = getInboxMetadata(message)?.matchConfidence;
  return isMatchConfidence(matchConfidence) ? matchConfidence : null;
}

export function getInboxMatchReason(message: QuoteInboxMessage) {
  const matchReason = getInboxMetadata(message)?.matchReason;
  return typeof matchReason === "string" ? matchReason : null;
}

export function getSuggestedVendorIds(message: QuoteInboxMessage) {
  return sanitizeStringArray(getInboxMetadata(message)?.suggestedVendorIds);
}

export function getSuggestedRfqIds(message: QuoteInboxMessage) {
  return sanitizeStringArray(getInboxMetadata(message)?.suggestedRfqIds);
}

export function getMatchedBySignals(message: QuoteInboxMessage) {
  return sanitizeStringArray(getInboxMetadata(message)?.matchedBy);
}

export function getSuggestedVendorId(
  message: QuoteInboxMessage,
  allowedVendorIds: string[] = [],
) {
  if (message.matchedVendorId && isAllowedId(message.matchedVendorId, allowedVendorIds)) {
    return message.matchedVendorId;
  }

  const suggestedVendorIds = getSuggestedVendorIds(message).filter((vendorId) =>
    isAllowedId(vendorId, allowedVendorIds),
  );
  return suggestedVendorIds.length === 1 ? suggestedVendorIds[0] : null;
}

export function formatMatchConfidenceLabel(
  confidence: QuoteInboxMessageMetadata["matchConfidence"] | null,
) {
  switch (confidence) {
    case "high":
      return "High confidence";
    case "medium":
      return "Medium confidence";
    case "low":
      return "Low confidence";
    case "none":
      return "No confidence";
    default:
      return null;
  }
}

export function formatInboxMatchSummary(message: QuoteInboxMessage) {
  const confidence = getInboxMatchConfidence(message);
  const inquiryNumber = getInboxInquiryNumber(message);
  const matchedBySignals = getMatchedBySignals(message);

  if (!inquiryNumber) {
    return "No inquiry number detected yet.";
  }

  if (confidence === "high") {
    return `Inquiry ${inquiryNumber} matched with enough detail to auto-process.`;
  }

  if (confidence === "medium") {
    return `Inquiry ${inquiryNumber} matched, but one detail still needs confirmation.`;
  }

  if (confidence === "low") {
    return `Inquiry ${inquiryNumber} matched, but vendor or RFQ still needs review.`;
  }

  if (matchedBySignals.length > 0) {
    return `Inquiry ${inquiryNumber} was detected from the message, but the link is still incomplete.`;
  }

  return `Inquiry ${inquiryNumber} was detected from the subject.`;
}

export function formatMatchSignalLabel(signal: string) {
  switch (signal) {
    case "inquiry_number":
      return "Inquiry number";
    case "sender_exact_email":
      return "Exact sender email";
    case "sender_email_domain":
      return "Sender domain";
    case "rfq_vendor_membership":
      return "Vendor on RFQ";
    case "single_rfq_for_inquiry":
      return "Single RFQ";
    case "rfq_subject_match":
      return "RFQ subject";
    default:
      return humanizeFieldKey(signal);
  }
}

export function formatInboxStatusLabel(status: QuoteInboxMessage["status"]) {
  switch (status) {
    case "ignored":
      return "Ignored";
    case "unmatched":
      return "Unmatched";
    case "extraction_pending":
      return "Extracting";
    case "needs_review":
      return "Needs Review";
    case "finalized":
      return "Finalized";
    case "failed":
      return "Failed";
    default:
      return status;
  }
}

export function humanizeFieldKey(value: string) {
  return value
    .replaceAll(/[_-]+/g, " ")
    .replaceAll(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatComparisonValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return String(value);
}

function stringifyFieldValue(value: unknown) {
  return value === null || value === undefined ? "" : String(value);
}

function parseOptionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseOptionalInteger(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function sanitizeComparisonFields(fields: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(fields)
      .map(([key, value]) => [key, value.trim()])
      .filter(([, value]) => value.length > 0),
  );
}

function sanitizeStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function isAllowedId(value: string, allowedIds: string[]) {
  return allowedIds.length === 0 || allowedIds.includes(value);
}

function isMatchConfidence(
  value: unknown,
): value is QuoteInboxMessageMetadata["matchConfidence"] {
  return value === "none" || value === "low" || value === "medium" || value === "high";
}
