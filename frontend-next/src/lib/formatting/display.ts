type RouteLike = {
  origin?: string | null;
  destination?: string | null;
};

type InquiryLabelLike = RouteLike & {
  inquiryNumber: string;
  customerName: string;
};

const UNKNOWN_ROUTE_SEGMENT = "TBC";

export function formatRoute(
  origin?: string | null,
  destination?: string | null,
) {
  return `${origin ?? UNKNOWN_ROUTE_SEGMENT} -> ${destination ?? UNKNOWN_ROUTE_SEGMENT}`;
}

export function formatInquiryLabel(inquiry: InquiryLabelLike) {
  return `${inquiry.inquiryNumber} - ${inquiry.customerName} (${formatRoute(
    inquiry.origin,
    inquiry.destination,
  )})`;
}

export function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
