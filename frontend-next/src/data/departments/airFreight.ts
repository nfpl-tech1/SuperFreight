import type { DepartmentDefinition } from "@/types/rfq";
import { INCOTERM_OPTIONS } from "@/lib/inquiryQuotePlanning";

export const airFreight: DepartmentDefinition = {
    id: "air_freight",
    name: "Air Freight",
    group: "Air Freight",
    fields: [
        { key: "trade_lane", label: "Trade Lane", type: "select", required: true, options: ["Export", "Import", "Cross Trade"], ui: { hideInPreview: true }, halfWidth: true },
        { key: "source", label: "Origin", type: "text", required: true, halfWidth: true },
        { key: "destination", label: "Destination", type: "text", required: true, halfWidth: true },
        { key: "incoterm", label: "Incoterm", type: "select", required: true, options: [...INCOTERM_OPTIONS], halfWidth: true },
        { key: "pickup_address", label: "Pick up Address", type: "text", required: false, rules: { visible_if: { incoterm: "EXW" } }, ui: { placeholder: "Required for Ex Works shipments" } },
        { key: "mode", label: "Mode", type: "select", required: true, options: ["AIR"], default: "AIR", halfWidth: true },
        { key: "num_packages", label: "No. of Packages", type: "text", required: true, halfWidth: true },
        { key: "stackable", label: "Stackable", type: "radio", required: true, options: ["Yes", "No"], ui: { helpText: "Enter stackable yes or no" }, rules: { visible_if: { mode: "AIR" } }, halfWidth: true },
        { key: "dimensions", label: "Dimensions (L x W x H in cm)", type: "multiline", required: true, ui: { placeholder: "Example: 120 x 80 x 95 cm, 2 packages" }, rules: { visible_if: { mode: "AIR" } } },
        { key: "gross_weight_kg", label: "Gross Weight (kg)", type: "number", required: true, rules: { min: 1 }, halfWidth: true },
        { key: "volume_weight", label: "Volume Weight", type: "text", required: false, halfWidth: true },
        { key: "commodity_description", label: "Commodity", type: "multiline", required: true },
        { key: "haz_type", label: "Haz Type", type: "radio", required: true, options: ["Non Haz", "Haz"], default: "Non Haz" },
        { key: "hazardous_imdg_class", label: "IMDG Class", type: "text", required: true, rules: { visible_if: { haz_type: "Haz" } }, halfWidth: true },
        { key: "hazardous_un_number", label: "UN Number", type: "text", required: true, rules: { visible_if: { haz_type: "Haz" } }, halfWidth: true },
        { key: "reefer_required", label: "Reefer Required", type: "radio", required: true, options: ["Yes", "No"], default: "No" },
        { key: "reefer_temperature_range", label: "Reefer Temp Range", type: "text", required: true, ui: { placeholder: "Example: -5 C to 0 C" }, rules: { visible_if: { reefer_required: "Yes" } }, halfWidth: true },
        { key: "other_notes", label: "Other Notes", type: "multiline", required: false },
    ],
};
