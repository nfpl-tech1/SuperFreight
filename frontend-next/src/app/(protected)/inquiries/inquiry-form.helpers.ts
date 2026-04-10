"use client";

import type { Inquiry } from "@/lib/api";
import { planQuoteTypesForInquiry } from "@/lib/inquiryQuotePlanning";

export const TRADE_LANE_OPTIONS = ["Import", "Export", "Cross Trade"] as const;
export const SHIPMENT_MODE_OPTIONS = ["AIR", "FCL", "LCL"] as const;

export type InquiryFormState = {
  customerName: string;
  customerRole: Inquiry["customerRole"] | "";
  tradeLane: string;
  origin: string;
  destination: string;
  shipmentMode: string;
  incoterm: string;
  cargoSummary: string;
};

export function createEmptyInquiryForm(): InquiryFormState {
  return {
    customerName: "",
    customerRole: "",
    tradeLane: "Export",
    origin: "",
    destination: "",
    shipmentMode: "FCL",
    incoterm: "",
    cargoSummary: "",
  };
}

export function createInquiryFormFromInquiry(inquiry: Inquiry): InquiryFormState {
  return {
    customerName: inquiry.customerName,
    customerRole: inquiry.customerRole ?? "",
    tradeLane: inquiry.tradeLane ?? "Export",
    origin: inquiry.origin ?? "",
    destination: inquiry.destination ?? "",
    shipmentMode: inquiry.shipmentMode ?? "FCL",
    incoterm: inquiry.incoterm ?? "",
    cargoSummary: inquiry.cargoSummary ?? "",
  };
}

export function deriveInquiryType(form: InquiryFormState): Inquiry["inquiryType"] {
  const recommendations = planQuoteTypesForInquiry({
    tradeLane: form.tradeLane,
    shipmentMode: form.shipmentMode,
    incoterm: form.incoterm || null,
    customerRole: form.customerRole || null,
    inquiryType: "FREIGHT_ONLY",
  }).recommendations;
  const hasCha = recommendations.some(
    (recommendation) => recommendation.departmentId === "cha_services",
  );
  const hasFreight = recommendations.some(
    (recommendation) => recommendation.departmentId !== "cha_services",
  );

  if (hasCha && hasFreight) {
    return "CHA_FREIGHT";
  }

  if (hasCha) {
    return "CHA_ONLY";
  }

  return "FREIGHT_ONLY";
}

export function isCustomerRoleRequired(form: Pick<InquiryFormState, "tradeLane">) {
  return form.tradeLane === "Export";
}

export function getPortModeForShipmentMode(
  shipmentMode: InquiryFormState["shipmentMode"],
) {
  return shipmentMode === "AIR" ? "AIRPORT" : "SEAPORT";
}

export function getLocationPlaceholder(
  shipmentMode: InquiryFormState["shipmentMode"],
  role: "origin" | "destination",
) {
  const locationType =
    getPortModeForShipmentMode(shipmentMode) === "AIRPORT"
      ? "airport"
      : "seaport";

  return `Search ${role} ${locationType}`;
}

export function buildInquiryPayload(form: InquiryFormState) {
  return {
    ...form,
    inquiryType: deriveInquiryType(form),
    customerRole: form.customerRole || undefined,
    incoterm: form.incoterm || undefined,
  };
}
