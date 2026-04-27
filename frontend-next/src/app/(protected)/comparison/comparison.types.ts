import type { FreightQuote, QuoteInboxMessage, RfqFieldSpec } from "@/lib/api";

export type QuoteReviewFormState = {
  vendorName: string;
  currency: string;
  totalRate: string;
  freightRate: string;
  localCharges: string;
  documentation: string;
  transitDays: string;
  validUntil: string;
  remarks: string;
  reviewStatus: string;
  comparisonFields: Record<string, string>;
};

export type ComparisonColumn = {
  key: string;
  label: string;
};

export type ComparisonWorkspaceState = {
  inquiries: boolean;
  rfqs: boolean;
  quotes: boolean;
  inbox: boolean;
};

export type QuoteReviewSelection = {
  quote: FreightQuote;
  sourceMessage?: QuoteInboxMessage | null;
  fieldSpecs: RfqFieldSpec[];
};
