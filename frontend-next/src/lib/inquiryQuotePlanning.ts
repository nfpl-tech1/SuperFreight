import type { Inquiry } from "@/lib/api";

export const INCOTERM_OPTIONS = [
  "EXW",
  "FCA",
  "FOB",
  "CFR",
  "CIF",
  "DAP",
  "DDU",
  "DDP",
] as const;

export const CUSTOMER_ROLE_OPTIONS = ["Consignee/Agent", "Shipper"] as const;

export type InquiryCustomerRole = (typeof CUSTOMER_ROLE_OPTIONS)[number];
export type QuoteRecommendationPriority = "recommended" | "consider";
export type QuoteLocationFocus = "Any" | "Origin" | "Destination";

export interface QuoteTypeRecommendation {
  departmentId: string;
  label: string;
  description: string;
  reason: string;
  locationFocus: QuoteLocationFocus;
  priority: QuoteRecommendationPriority;
}

interface QuotePlannerResult {
  summary: string;
  recommendations: QuoteTypeRecommendation[];
}

type QuoteTypeConfig = Omit<QuoteTypeRecommendation, "reason" | "priority">;

const SHARED_END_TO_END_TYPES = [
  "road_freight",
  "cha_services",
  "local_port_charges",
  "destination_charges",
] as const;

const QUOTE_TYPE_CONFIG: Record<string, QuoteTypeConfig> = {
  road_freight: {
    departmentId: "road_freight",
    label: "Transport",
    description: "Pickup, first-mile, or inland transport coverage.",
    locationFocus: "Origin",
  },
  cha_services: {
    departmentId: "cha_services",
    label: "CHA",
    description: "Customs clearance and export documentation support.",
    locationFocus: "Origin",
  },
  ocean_freight: {
    departmentId: "ocean_freight",
    label: "Ocean Freight",
    description: "Main carriage pricing from port to port.",
    locationFocus: "Any",
  },
  air_freight: {
    departmentId: "air_freight",
    label: "Air Freight",
    description: "Main carriage pricing for airport-to-airport moves.",
    locationFocus: "Any",
  },
  local_port_charges: {
    departmentId: "local_port_charges",
    label: "Origin Port Charges",
    description: "Origin-side terminal, documentation, and handling charges.",
    locationFocus: "Origin",
  },
  destination_charges: {
    departmentId: "destination_charges",
    label: "Destination Charges",
    description: "Destination local charges, handling, and import-side extras.",
    locationFocus: "Destination",
  },
};

type InquiryPlanningInput = Pick<
  Inquiry,
  "inquiryType" | "tradeLane" | "shipmentMode" | "incoterm" | "customerRole"
>;

function normalizeValue(value: string | null | undefined) {
  return value?.trim().toUpperCase() ?? "";
}

function getFreightDepartmentId(shipmentMode: string | null | undefined) {
  return normalizeValue(shipmentMode) === "AIR"
    ? "air_freight"
    : "ocean_freight";
}

function buildRecommendations(
  departmentIds: string[],
  reason: string,
  priority: QuoteRecommendationPriority = "recommended",
) {
  return Array.from(new Set(departmentIds))
    .map((departmentId) => QUOTE_TYPE_CONFIG[departmentId])
    .filter((item): item is QuoteTypeConfig => Boolean(item))
    .map((item) => ({
      ...item,
      reason,
      priority,
    }));
}

function buildFallbackRecommendations(input: InquiryPlanningInput) {
  const freightDepartmentId = getFreightDepartmentId(input.shipmentMode);
  const fallbackIds: string[] = [];

  if (input.inquiryType !== "CHA_ONLY") {
    fallbackIds.push(freightDepartmentId);
  }

  if (input.inquiryType !== "FREIGHT_ONLY") {
    fallbackIds.push("cha_services");
  }

  const normalizedIncoterm = normalizeValue(input.incoterm);
  if (["DAP", "DDU", "DDP"].includes(normalizedIncoterm)) {
    fallbackIds.push(
      "road_freight",
      "local_port_charges",
      "destination_charges",
    );
  }

  return fallbackIds;
}

export function planQuoteTypesForInquiry(
  inquiry?: InquiryPlanningInput | null,
): QuotePlannerResult {
  if (!inquiry) {
    return {
      summary:
        "Select an inquiry to see the quote types you may need to collect.",
      recommendations: [],
    };
  }

  const freightDepartmentId = getFreightDepartmentId(inquiry.shipmentMode);
  const normalizedTradeLane = normalizeValue(inquiry.tradeLane);
  const normalizedIncoterm = normalizeValue(inquiry.incoterm);
  const rawCustomerRole = inquiry.customerRole ?? "";
  // Normalize old DB values: "Consignee" → "Consignee/Agent"
  const normalizedCustomerRole =
    (rawCustomerRole as string) === "Consignee"
      ? "Consignee/Agent"
      : rawCustomerRole;

  if (normalizedTradeLane === "EXPORT") {
    if (["DAP", "DDU", "DDP"].includes(normalizedIncoterm)) {
      return {
        summary: `${normalizedIncoterm} export shipments usually need end-to-end costing, so collect every current quote type.`,
        recommendations: buildRecommendations(
          [...SHARED_END_TO_END_TYPES, freightDepartmentId],
          `${normalizedIncoterm} export shipments typically need complete door-to-door coverage.`,
        ),
      };
    }

    if (
      normalizedIncoterm === "EXW" &&
      normalizedCustomerRole === "Consignee/Agent"
    ) {
      return {
        summary:
          "EXW exports for a consignee need transport, CHA, and freight coverage. Origin port charges are clubbed with the freight quote.",
        recommendations: buildRecommendations(
          ["road_freight", "cha_services", freightDepartmentId],
          "EXW with consignee — freight and origin port charges come from the same vendor, no separate destination charges needed.",
        ),
      };
    }

    if (
      normalizedIncoterm === "FOB" &&
      normalizedCustomerRole === "Consignee/Agent"
    ) {
      return {
        summary:
          "FOB exports for a consignee usually need the main freight plus origin-side port charges.",
        recommendations: buildRecommendations(
          [freightDepartmentId, "local_port_charges"],
          "FOB with consignee involvement usually centers on freight plus origin-side local port costs.",
        ),
      };
    }

    if (normalizedIncoterm === "FOB" && normalizedCustomerRole === "Shipper") {
      return {
        summary:
          "FOB exports for a shipper usually need transport and CHA coverage.",
        recommendations: buildRecommendations(
          ["road_freight", "cha_services"],
          "FOB with shipper involvement usually needs inland movement and export customs support.",
        ),
      };
    }

    if (normalizedIncoterm === "CIF" && normalizedCustomerRole === "Shipper") {
      return {
        summary:
          "CIF exports for a shipper usually need inland, customs, freight, and origin port charges.",
        recommendations: buildRecommendations(
          [
            "road_freight",
            "cha_services",
            freightDepartmentId,
            "local_port_charges",
          ],
          "CIF with shipper involvement usually requires pricing up to freight and origin charge coverage.",
        ),
      };
    }

    const fallbackRecommendations = buildFallbackRecommendations(inquiry);
    return {
      summary:
        "Set both incoterm and customer role to unlock the export quote checklist. Base suggestions are shown for now.",
      recommendations: buildRecommendations(
        fallbackRecommendations,
        "Base recommendation from inquiry type and shipment mode.",
        "consider",
      ),
    };
  }

  return {
    summary:
      "Recommendations outside export currently use a simpler fallback based on inquiry type, shipment mode, and incoterm.",
    recommendations: buildRecommendations(
      buildFallbackRecommendations(inquiry),
      "Base recommendation from inquiry type and shipment mode.",
      "consider",
    ),
  };
}

export function getRecommendedDepartmentIdForInquiry(
  inquiry?: InquiryPlanningInput | null,
  fallbackDepartmentId?: string,
) {
  const plan = planQuoteTypesForInquiry(inquiry);
  return (
    plan.recommendations[0]?.departmentId ??
    fallbackDepartmentId ??
    "ocean_freight"
  );
}

export function getSuggestedLocationFilter(
  departmentId: string,
  inquiry?: Pick<Inquiry, "origin" | "destination"> | null,
) {
  if (!inquiry) {
    return { locationFocus: "Any" as const, locationQuery: "" };
  }

  if (departmentId === "destination_charges") {
    return {
      locationFocus: "Destination" as const,
      locationQuery: inquiry.destination?.trim() ?? "",
    };
  }

  if (
    departmentId === "road_freight" ||
    departmentId === "cha_services" ||
    departmentId === "local_port_charges"
  ) {
    return {
      locationFocus: "Origin" as const,
      locationQuery: inquiry.origin?.trim() ?? "",
    };
  }

  return { locationFocus: "Any" as const, locationQuery: "" };
}

export function shouldUseExwClubbedTemplate(
  inquiry?: Pick<Inquiry, "tradeLane" | "incoterm" | "customerRole"> | null,
) {
  if (!inquiry) {
    return false;
  }

  const tradeLane = normalizeValue(inquiry.tradeLane);
  const incoterm = normalizeValue(inquiry.incoterm);
  const customerRole = (inquiry.customerRole ?? "").trim().toLowerCase();

  return (
    tradeLane === "EXPORT" &&
    incoterm === "EXW" &&
    customerRole === "consignee/agent"
  );
}
