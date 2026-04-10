import type { ResponseField } from "@/types/rfq";

export const defaultResponseFields: ResponseField[] = [
    // Freight & Rate
    { id: "freight_charges", label: "Freight Charges", isCustom: false, selected: true },
    { id: "all_in_rate", label: "All-in Rate", isCustom: false, selected: false },
    { id: "rate_per_cbm", label: "Rate per CBM", isCustom: false, selected: false },
    { id: "rate_per_ton", label: "Rate per Ton (W/M)", isCustom: false, selected: false },
    { id: "rate_per_container", label: "Rate per Container", isCustom: false, selected: false },
    { id: "rate_per_kg", label: "Rate per Kg", isCustom: false, selected: false },

    // Port & Terminal
    { id: "port_charges", label: "Port Charges", isCustom: false, selected: false },
    { id: "thc_origin", label: "THC Origin", isCustom: false, selected: false },
    { id: "thc_destination", label: "THC Destination", isCustom: false, selected: false },
    { id: "bl_fee", label: "BL Fee", isCustom: false, selected: false },

    // Origin / Destination
    { id: "origin_charges", label: "Origin Charges", isCustom: false, selected: true },
    { id: "destination_charges", label: "Destination Charges", isCustom: false, selected: true },
    { id: "ex_works_charges", label: "Ex Works Charges", isCustom: false, selected: false },

    // Services
    { id: "cfs_charges", label: "CFS Charges", isCustom: false, selected: false },
    { id: "cha_charges", label: "CHA Charges", isCustom: false, selected: false },
    { id: "transport_charges", label: "Transport Charges", isCustom: false, selected: false },
    { id: "customs_clearance", label: "Customs Clearance", isCustom: false, selected: false },
    { id: "documentation_fee", label: "Documentation Fee", isCustom: false, selected: false },
    { id: "insurance", label: "Insurance", isCustom: false, selected: false },

    // Surcharges
    { id: "fuel_surcharge", label: "Fuel Surcharge", isCustom: false, selected: false },
    { id: "war_risk_surcharge", label: "War Risk Surcharge", isCustom: false, selected: false },
    { id: "peak_season_surcharge", label: "Peak Season Surcharge", isCustom: false, selected: false },

    // Logistics
    { id: "transit_time", label: "Transit Time", isCustom: false, selected: true },
    { id: "routing", label: "Routing", isCustom: false, selected: false },
    { id: "carrier", label: "Carrier / Airline / Shipping Line", isCustom: false, selected: false },
    { id: "free_time", label: "Free Time (Demurrage/Detention)", isCustom: false, selected: false },
    { id: "vessel_schedule", label: "Vessel / Flight Schedule", isCustom: false, selected: false },

    // Commercial
    { id: "validity", label: "Validity", isCustom: false, selected: true },
    { id: "payment_terms", label: "Payment Terms", isCustom: false, selected: false },
    { id: "currency", label: "Currency", isCustom: false, selected: false },
    { id: "remarks", label: "Remarks", isCustom: false, selected: false },
];

const departmentResponseFieldDefaults: Record<string, string[]> = {
    air_freight: ["freight_charges", "rate_per_kg", "transit_time", "carrier", "validity"],
    ocean_freight: ["freight_charges", "rate_per_container", "transit_time", "carrier", "validity"],
    road_freight: ["transport_charges", "transit_time", "validity", "payment_terms", "remarks"],
    cha_services: ["cha_charges", "customs_clearance", "documentation_fee", "validity", "remarks"],
    local_port_charges: ["port_charges", "thc_origin", "bl_fee", "documentation_fee", "validity"],
    destination_charges: ["destination_charges", "thc_destination", "free_time", "validity", "remarks"],
    overseas_agents: ["destination_charges", "remarks", "validity"],
};

export function getDefaultResponseFields(departmentId?: string): ResponseField[] {
    const selectedFieldIds = new Set(
        departmentId ? departmentResponseFieldDefaults[departmentId] ?? [] : [],
    );

    return defaultResponseFields.map((field) => ({
        ...field,
        selected: selectedFieldIds.size > 0 ? selectedFieldIds.has(field.id) : field.selected,
    }));
}
