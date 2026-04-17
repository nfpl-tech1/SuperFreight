/**
 * Email templates derived from the company's Outlook .oft/.msg mail formats.
 *
 * Each template defines:
 *  - which department / trade lane / mode / variant it applies to
 *  - the field mapping from form keys to the labels used in the email
 *  - an optional pre-filled rate table (for CHA/CC&Tp quotes)
 *  - preamble / postamble text
 *
 * The template resolver picks the best match for a given
 * (departmentId, tradeLane, mode, variant) tuple.
 */

import type { FormValues } from "@/types/rfq";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface EmailFieldRow {
  /** Label shown in the left column of the email table */
  label: string;
  /** Form field key to pull the value from, OR a static string prefixed with "=" */
  source: string;
}

export interface RateTableRow {
  particular: string;
  /** keyed by container size or a single "rate" key */
  rates: Record<string, string>;
}

export interface EmailTemplate {
  key: string;
  name: string;
  departmentId: string;
  tradeLane: "EXPORT" | "IMPORT" | null;
  mode: "AIR" | "FCL" | "LCL" | null;
  variant: string | null;
  preamble: string;
  postamble: string;
  fieldRows: EmailFieldRow[];
  rateTable?: {
    columnHeaders: string[];
    rows: RateTableRow[];
  };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function row(label: string, source: string): EmailFieldRow {
  return { label, source };
}

function staticRow(label: string, value: string): EmailFieldRow {
  return { label, source: `=${value}` };
}

/* ================================================================== */
/*                                                                     */
/*  EXPORT TEMPLATES                                                   */
/*                                                                     */
/* ================================================================== */

/* ------------------------------------------------------------------ */
/*  Export — Ocean Freight                                              */
/* ------------------------------------------------------------------ */

const EXPORT_OCEAN_FCL: EmailTemplate = {
  key: "export_ocean_fcl",
  name: "Export FCL Enquiry",
  departmentId: "ocean_freight",
  tradeLane: "EXPORT",
  mode: "FCL",
  variant: null,
  preamble: "Kindly advise your best for below enquiry.",
  postamble: "",
  fieldRows: [
    row("POL", "source"),
    row("POD", "destination"),
    row("Commodity", "commodity_description"),
    row("Qty & Type", "container_mix"),
    row("Gross Weight", "gross_weight_kg"),
    row("Free Days Required", "free_days"),
  ],
};

const EXPORT_OCEAN_LCL: EmailTemplate = {
  key: "export_ocean_lcl",
  name: "Export LCL Enquiry",
  departmentId: "ocean_freight",
  tradeLane: "EXPORT",
  mode: "LCL",
  variant: null,
  preamble: "Kindly advise your best for below enquiry",
  postamble: "",
  fieldRows: [
    staticRow("Type", "Sea LCL"),
    row("POL", "source"),
    row("POD", "destination"),
    row("Commodity", "commodity_description"),
    row("No. of Packages", "num_packages"),
    row("Dimensions per Package", "dimensions"),
    row("Volume", "volume_cbm"),
    row("Gross Weight", "gross_weight_kg"),
  ],
};

/* ------------------------------------------------------------------ */
/*  Export — Air Freight                                                */
/* ------------------------------------------------------------------ */

const EXPORT_AIR_FREIGHT: EmailTemplate = {
  key: "export_air_freight",
  name: "Export Air Enquiry",
  departmentId: "air_freight",
  tradeLane: "EXPORT",
  mode: "AIR",
  variant: null,
  preamble: "Kindly advise your best for below enquiry",
  postamble: "",
  fieldRows: [
    staticRow("Type", "Air"),
    row("POL", "source"),
    row("POD", "destination"),
    row("Commodity", "commodity_description"),
    row("No. of Packages", "num_packages"),
    row("Dimensions per Package", "dimensions"),
    row("Gross Weight", "gross_weight_kg"),
  ],
};

/* ------------------------------------------------------------------ */
/*  Export — Road Freight / Transport                                   */
/* ------------------------------------------------------------------ */

const EXPORT_TRANSPORT_FCL_FACTORY: EmailTemplate = {
  key: "export_transport_fcl_factory",
  name: "Export Transportation FCL - Factory Stuffing",
  departmentId: "road_freight",
  tradeLane: "EXPORT",
  mode: "FCL",
  variant: "factory_stuffing",
  preamble: "Kindly advise your best for below enquiry",
  postamble: "",
  fieldRows: [
    staticRow("Type", "FCL-Export"),
    staticRow("Stuffing Type", "Factory Stuffing"),
    row("Empty Pick up Address", "empty_pickup_address"),
    row("Factory Address", "source"),
    row("Loaded Return Address", "loaded_return_address"),
    row("No. & Type of Containers", "container_mix"),
    row("Gross Weight per Container", "gross_weight_kg"),
    row("Commodity", "cargo_summary"),
  ],
};

const EXPORT_TRANSPORT_FCL_DOCK: EmailTemplate = {
  key: "export_transport_fcl_dock",
  name: "Export Transportation FCL - Dock Stuffing",
  departmentId: "road_freight",
  tradeLane: "EXPORT",
  mode: "FCL",
  variant: "dock_stuffing",
  preamble: "Kindly advise your best for below enquiry",
  postamble: "",
  fieldRows: [
    staticRow("Type", "FCL-Export"),
    staticRow("Stuffing Type", "Dock Stuffing"),
    row("Pick up Address", "source"),
    row("Delivery Address", "destination"),
    row("No. & Type of Packages", "num_packages"),
    row("Dimensions per package", "dimensions"),
    row("Gross Weight per Package", "gross_weight_pkg"),
    row("Total Gross Weight", "gross_weight_kg"),
    row("Commodity", "cargo_summary"),
  ],
};

const EXPORT_TRANSPORT_LCL: EmailTemplate = {
  key: "export_transport_lcl",
  name: "Export Transportation LCL",
  departmentId: "road_freight",
  tradeLane: "EXPORT",
  mode: "LCL",
  variant: null,
  preamble: "Kindly advise your best for below enquiry",
  postamble: "",
  fieldRows: [
    staticRow("Type", "FCL-Export"),
    staticRow("Stuffing Type", "Dock Stuffing"),
    row("Pick up Address", "source"),
    row("Delivery Address", "destination"),
    row("No. & Type of Packages", "num_packages"),
    row("Dimensions per package", "dimensions"),
    row("Gross Weight per Package", "gross_weight_pkg"),
    row("Total Gross Weight", "gross_weight_kg"),
    row("Commodity", "cargo_summary"),
  ],
};

const EXPORT_TRANSPORT_AIR: EmailTemplate = {
  key: "export_transport_air",
  name: "Export Transportation Air",
  departmentId: "road_freight",
  tradeLane: "EXPORT",
  mode: "AIR",
  variant: null,
  preamble: "Kindly advise your best for below enquiry",
  postamble: "",
  fieldRows: [
    staticRow("Type", "Air"),
    row("Pick up Address", "source"),
    row("Delivery Address", "destination"),
    row("No. & Type of Packages", "num_packages"),
    row("Dimensions per package", "dimensions"),
    row("Gross Weight per Package", "gross_weight_pkg"),
    row("Total Gross Weight", "gross_weight_kg"),
    row("Commodity", "cargo_summary"),
  ],
};

/* ------------------------------------------------------------------ */
/*  Export — CHA / CC & Transport Charges                              */
/* ------------------------------------------------------------------ */

const EXPORT_CHA_AIR: EmailTemplate = {
  key: "export_cha_air",
  name: "Export CC & Tp Charges - AIR",
  departmentId: "cha_services",
  tradeLane: "EXPORT",
  mode: "AIR",
  variant: null,
  preamble: "Kindly advise your best for below enquiry",
  postamble: "",
  fieldRows: [
    staticRow("Type", "Air"),
    row("POL", "source"),
    row("POD", "destination"),
    row("Commodity", "commodity_description"),
    row("Cargo Value", "cargo_value"),
    row("No. of Packages", "num_packages"),
    row("Dimensions per Package", "dimensions"),
    row("Gross Weight", "gross_weight_kg"),
  ],
  rateTable: {
    columnHeaders: ["Particulars", "Rate"],
    rows: [
      {
        particular: "1st time Exporter registration",
        rates: { Rate: "INR 4500/ 1st time expense" },
      },
      { particular: "Agency Charges", rates: { Rate: "INR 3500" } },
      { particular: "Examination Charges", rates: { Rate: "INR 750" } },
      { particular: "Opening/Repacking", rates: { Rate: "INR 750" } },
      {
        particular: "Loading/Unloading",
        rates: { Rate: "INR 750 per vehicle" },
      },
      { particular: "Transportation charges", rates: { Rate: "" } },
      {
        particular: "IF fumigation, Palletization",
        rates: { Rate: "At actual" },
      },
      { particular: "Insurances Charges", rates: { Rate: "At actual" } },
    ],
  },
};

const EXPORT_CHA_LCL: EmailTemplate = {
  key: "export_cha_lcl",
  name: "Export CC & Tp Charges - LCL",
  departmentId: "cha_services",
  tradeLane: "EXPORT",
  mode: "LCL",
  variant: null,
  preamble: "Kindly advise your best for below enquiry",
  postamble: "",
  fieldRows: [
    staticRow("Type", "Sea-LCL"),
    row("POL", "source"),
    row("POD", "destination"),
    row("Commodity", "commodity_description"),
    row("Cargo Value", "cargo_value"),
    row("No. of Packages", "num_packages"),
    row("Dimensions per Package", "dimensions"),
    row("Gross Weight", "gross_weight_kg"),
  ],
  rateTable: {
    columnHeaders: ["Particulars", "Rate"],
    rows: [
      {
        particular: "1st time Exporter registration",
        rates: { Rate: "INR 4500/ 1st time expense" },
      },
      { particular: "Agency Charges", rates: { Rate: "INR 3500" } },
      { particular: "Examination Charges", rates: { Rate: "INR 750" } },
      { particular: "Opening/Repacking", rates: { Rate: "INR 750" } },
      {
        particular: "Loading/Unloading",
        rates: { Rate: "INR 750 per vehicle" },
      },
      { particular: "Transportation charges", rates: { Rate: "" } },
      {
        particular: "IF fumigation, Palletization",
        rates: { Rate: "At actual" },
      },
      { particular: "Insurances Charges", rates: { Rate: "At actual" } },
    ],
  },
};

const EXPORT_CHA_FCL_DOCK: EmailTemplate = {
  key: "export_cha_fcl_dock",
  name: "Export CC & Tp Charges - FCL Dock Stuffing",
  departmentId: "cha_services",
  tradeLane: "EXPORT",
  mode: "FCL",
  variant: "dock_stuffing",
  preamble: "Kindly advise your best for below enquiry",
  postamble: "",
  fieldRows: [
    staticRow("Type", "Sea-FCL"),
    staticRow("Stuffing Type", "Dock Stuffing"),
    row("POL", "source"),
    row("POD", "destination"),
    row("Commodity", "commodity_description"),
    row("Cargo Value", "cargo_value"),
    row("No. & Type of Containers", "container_mix"),
    row("Gross Weight per Container", "gross_weight_kg"),
  ],
  rateTable: {
    columnHeaders: ["Particular", "20FT", "40FT"],
    rows: [
      {
        particular: "Agency Charges",
        rates: { "20FT": "INR 3000/20FT", "40FT": "INR 4500/40FT" },
      },
      {
        particular: "Examination Charges",
        rates: { "20FT": "INR 500/20FT", "40FT": "INR 750/40FT" },
      },
      {
        particular: "Opening repacking Charges",
        rates: { "20FT": "INR 500/20FT", "40FT": "INR 500/40FT" },
      },
      {
        particular: "Loading unloading Charges",
        rates: { "20FT": "INR 750/truck", "40FT": "INR 750/truck" },
      },
      {
        particular: "CFS Charges",
        rates: { "20FT": "INR 11000/20FT", "40FT": "INR 14500/40FT" },
      },
    ],
  },
};

const EXPORT_CHA_FCL_FACTORY: EmailTemplate = {
  key: "export_cha_fcl_factory",
  name: "Export CC & Tp Charges - FCL Factory Stuffing",
  departmentId: "cha_services",
  tradeLane: "EXPORT",
  mode: "FCL",
  variant: "factory_stuffing",
  preamble: "Kindly advise your best for below enquiry",
  postamble: "",
  fieldRows: [
    staticRow("Type", "Sea-FCL"),
    staticRow("Stuffing Type", "Factory Stuffing-On Wheel Basis"),
    row("POL", "source"),
    row("POD", "destination"),
    row("Commodity", "commodity_description"),
    row("Cargo Value", "cargo_value"),
    row("No. & Type of Containers", "container_mix"),
    row("Gross Weight per Container", "gross_weight_kg"),
  ],
  rateTable: {
    columnHeaders: ["Particulars", "20FT", "40FT"],
    rows: [
      {
        particular: "Agency Charges",
        rates: { "20FT": "INR 3000/20FT", "40FT": "INR 4500/40FT" },
      },
      {
        particular: "Examination Charges",
        rates: { "20FT": "INR 500/20FT", "40FT": "INR 750/40FT" },
      },
      {
        particular: "Opening repacking Charges",
        rates: { "20FT": "INR 500/20FT", "40FT": "INR 500/40FT" },
      },
      {
        particular: "Loading unloading Charges",
        rates: { "20FT": "INR 750/truck", "40FT": "INR 750/truck" },
      },
      {
        particular: "CFS Charges",
        rates: { "20FT": "INR 11000/20FT", "40FT": "INR 14500/40FT" },
      },
      {
        particular: "On wheel Charges",
        rates: { "20FT": "INR 6000/20FT", "40FT": "INR 8000/40FT" },
      },
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Export — DDP / DDU Destination                                     */
/* ------------------------------------------------------------------ */

const EXPORT_DDP_AIR: EmailTemplate = {
  key: "export_ddp_air",
  name: "Export DDP Enquiry - AIR",
  departmentId: "destination_charges",
  tradeLane: "EXPORT",
  mode: "AIR",
  variant: "ddp",
  preamble: "Kindly advise your best for below enquiry",
  postamble: "",
  fieldRows: [
    staticRow("Type", "Air"),
    staticRow("Terms", "DDP/DDU"),
    row("POL", "source"),
    row("POD", "destination"),
    row("Delivery Address", "delivery_address"),
    row("Commodity with HS Code", "commodity_description"),
    row("Cargo Value", "cargo_value"),
    row("No. of Packages", "num_packages"),
    row("Dimensions per Package", "dimensions"),
    row("Gross Weight", "gross_weight_kg"),
  ],
};

const EXPORT_DDP_FCL: EmailTemplate = {
  key: "export_ddp_fcl",
  name: "Export DDP Enquiry - FCL",
  departmentId: "destination_charges",
  tradeLane: "EXPORT",
  mode: "FCL",
  variant: "ddp",
  preamble: "Kindly advise your best for below enquiry",
  postamble: "",
  fieldRows: [
    staticRow("Type", "Sea-FCL"),
    staticRow("Terms", "DDP/DDU"),
    row("POL", "source"),
    row("POD", "destination"),
    row("Delivery Address", "delivery_address"),
    row("Commodity with HS Code", "commodity_description"),
    row("Cargo Value", "cargo_value"),
    row("No. & Type of Containers", "container_mix"),
    row("Gross Weight per container", "gross_weight_kg"),
  ],
};

const EXPORT_DDP_LCL: EmailTemplate = {
  key: "export_ddp_lcl",
  name: "Export DDP Enquiry - LCL",
  departmentId: "destination_charges",
  tradeLane: "EXPORT",
  mode: "LCL",
  variant: "ddp",
  preamble: "Kindly advise your best for below enquiry",
  postamble: "",
  fieldRows: [
    staticRow("Type", "Sea-LCL"),
    staticRow("Terms", "DDP/DDU"),
    row("POL", "source"),
    row("POD", "destination"),
    row("Delivery Address", "delivery_address"),
    row("Commodity with HS Code", "commodity_description"),
    row("Cargo Value", "cargo_value"),
    row("No. of Packages", "num_packages"),
    row("Dimensions per Package", "dimensions"),
    row("Volume (CBM)", "volume_cbm"),
    row("Gross Weight", "gross_weight_kg"),
  ],
};

/* ------------------------------------------------------------------ */
/*  Export — EXW "Other Location" clubbed templates                    */
/* ------------------------------------------------------------------ */

const EXPORT_EXW_CLUBBED_AIR: EmailTemplate = {
  key: "export_exw_clubbed_air",
  name: "Export Other Location - AIR",
  departmentId: "air_freight",
  tradeLane: "EXPORT",
  mode: "AIR",
  variant: "exw_clubbed",
  preamble:
    "Kindly advise your best freight, transportation, clearance, airport charges and any other charges applicable for below enquiry",
  postamble: "",
  fieldRows: [
    staticRow("Type", "Air"),
    staticRow("Terms", "Ex Works"),
    row("Pick up Address", "pickup_address"),
    row("POL", "source"),
    row("POD", "destination"),
    row("Commodity", "commodity_description"),
    row("No. & Type of Packages", "num_packages"),
    row("Dimensions per package", "dimensions"),
    row("Gross Weight per Package", "gross_weight_pkg"),
    row("Total Gross Weight", "gross_weight_kg"),
  ],
};

const EXPORT_EXW_CLUBBED_LCL: EmailTemplate = {
  key: "export_exw_clubbed_lcl",
  name: "Export Other Location - LCL",
  departmentId: "ocean_freight",
  tradeLane: "EXPORT",
  mode: "LCL",
  variant: "exw_clubbed",
  preamble:
    "Kindly advise your best freight, transportation, clearance, port charges and any other charges applicable for below enquiry",
  postamble: "",
  fieldRows: [
    staticRow("Type", "LCL"),
    staticRow("Terms", "Ex Works"),
    row("Pick up Address", "pickup_address"),
    row("POL", "source"),
    row("POD", "destination"),
    row("Commodity", "commodity_description"),
    row("No. & Type of Packages", "num_packages"),
    row("Dimensions per package", "dimensions"),
    row("Gross Weight per Package", "gross_weight_pkg"),
    row("Total Gross Weight", "gross_weight_kg"),
  ],
};

const EXPORT_EXW_CLUBBED_FCL: EmailTemplate = {
  key: "export_exw_clubbed_fcl",
  name: "Export Other Location CC & Tp - FCL",
  departmentId: "ocean_freight",
  tradeLane: "EXPORT",
  mode: "FCL",
  variant: "exw_clubbed",
  preamble:
    "Kindly advise your transportation, clearance, Port/ICD charges and any other charges applicable for below enquiry",
  postamble: "",
  fieldRows: [
    staticRow("Type", "FCL"),
    staticRow("Terms", "Ex Works"),
    row("Pick up Address", "pickup_address"),
    row("POL", "source"),
    row("POD", "destination"),
    row("Commodity", "commodity_description"),
    row("No. & Type of Containers", "container_mix"),
    row("Gross Weight per Container", "gross_weight_kg"),
  ],
};

/* ================================================================== */
/*                                                                     */
/*  IMPORT TEMPLATES                                                   */
/*                                                                     */
/* ================================================================== */

/* ------------------------------------------------------------------ */
/*  Import — FOB Freight (Ocean + Air)                                 */
/* ------------------------------------------------------------------ */

const IMPORT_FOB_FCL: EmailTemplate = {
  key: "import_fob_fcl",
  name: "Import FOB Enquiry - FCL",
  departmentId: "ocean_freight",
  tradeLane: "IMPORT",
  mode: "FCL",
  variant: "fob",
  preamble: "Kindly advise your best for below enquiry",
  postamble: "",
  fieldRows: [
    staticRow("Type", "Sea-FCL"),
    staticRow("Terms", "FOB"),
    row("POL", "source"),
    row("POD", "destination"),
    row("Commodity", "commodity_description"),
    row("No. & Type of Containers", "container_mix"),
    row("Gross Weight per Container", "gross_weight_kg"),
    row("Free Days Required", "free_days"),
  ],
};

const IMPORT_FOB_LCL: EmailTemplate = {
  key: "import_fob_lcl",
  name: "Import FOB Enquiry - LCL",
  departmentId: "ocean_freight",
  tradeLane: "IMPORT",
  mode: "LCL",
  variant: "fob",
  preamble: "Kindly advise your best for below enquiry",
  postamble: "",
  fieldRows: [
    staticRow("Type", "Sea-LCL"),
    staticRow("Terms", "FOB"),
    row("POL", "source"),
    row("POD", "destination"),
    row("Commodity", "commodity_description"),
    row("No. of Packages", "num_packages"),
    row("Dimensions per package", "dimensions"),
    row("Gross Weight per Package", "gross_weight_pkg"),
    row("Total Gross Weight", "gross_weight_kg"),
    row("Volume (CBM)", "volume_cbm"),
  ],
};

const IMPORT_FOB_AIR: EmailTemplate = {
  key: "import_fob_air",
  name: "Import FOB Enquiry - AIR",
  departmentId: "air_freight",
  tradeLane: "IMPORT",
  mode: "AIR",
  variant: "fob",
  preamble: "Kindly advise your best for below enquiry",
  postamble: "",
  fieldRows: [
    staticRow("Type", "Air"),
    staticRow("Terms", "FOB"),
    row("AOL", "source"),
    row("AOD", "destination"),
    row("Commodity", "commodity_description"),
    row("No. & Type of Packages", "num_packages"),
    row("Dimensions per package", "dimensions"),
    row("Gross Weight per Package", "gross_weight_pkg"),
    row("Total Gross Weight", "gross_weight_kg"),
    row("Volume Weight", "volume_weight"),
  ],
};

/* ------------------------------------------------------------------ */
/*  Import — EXW Freight (Ocean + Air)                                 */
/* ------------------------------------------------------------------ */

const IMPORT_EXW_FCL: EmailTemplate = {
  key: "import_exw_fcl",
  name: "Import Ex-Works Enquiry - FCL",
  departmentId: "ocean_freight",
  tradeLane: "IMPORT",
  mode: "FCL",
  variant: "exw",
  preamble: "Kindly advise your best for below enquiry",
  postamble: "",
  fieldRows: [
    staticRow("Type", "Sea-FCL"),
    staticRow("Terms", "Ex Works"),
    row("Pick up Address", "pickup_address"),
    row("POL", "source"),
    row("POD", "destination"),
    row("Commodity", "commodity_description"),
    row("No. & Type of Containers", "container_mix"),
    row("Gross Weight per Container", "gross_weight_kg"),
    row("Free Days Required", "free_days"),
  ],
};

const IMPORT_EXW_LCL: EmailTemplate = {
  key: "import_exw_lcl",
  name: "Import Ex-Works Enquiry - LCL",
  departmentId: "ocean_freight",
  tradeLane: "IMPORT",
  mode: "LCL",
  variant: "exw",
  preamble: "Kindly advise your best for below enquiry",
  postamble: "",
  fieldRows: [
    staticRow("Type", "Sea-LCL"),
    staticRow("Terms", "Ex Works"),
    row("Pick up Address", "pickup_address"),
    row("POL", "source"),
    row("POD", "destination"),
    row("Commodity", "commodity_description"),
    row("No. & Type of Packages", "num_packages"),
    row("Dimensions per package", "dimensions"),
    row("Gross Weight per Package", "gross_weight_pkg"),
    row("Total Gross Weight", "gross_weight_kg"),
    row("Volume (CBM)", "volume_cbm"),
  ],
};

const IMPORT_EXW_AIR: EmailTemplate = {
  key: "import_exw_air",
  name: "Import Ex-Works Enquiry - AIR",
  departmentId: "air_freight",
  tradeLane: "IMPORT",
  mode: "AIR",
  variant: "exw",
  preamble: "Kindly advise your best for below enquiry",
  postamble: "",
  fieldRows: [
    staticRow("Type", "Air"),
    staticRow("Terms", "Ex Works"),
    row("Pick up Address", "pickup_address"),
    row("AOL", "source"),
    row("AOD", "destination"),
    row("Commodity", "commodity_description"),
    row("No. & Type of Packages", "num_packages"),
    row("Dimensions per package", "dimensions"),
    row("Gross Weight per Package", "gross_weight_pkg"),
    row("Total Gross Weight", "gross_weight_kg"),
    row("Volume Weight", "volume_weight"),
  ],
};

/* ------------------------------------------------------------------ */
/*  Import — Road Freight / Transport                                  */
/* ------------------------------------------------------------------ */

const IMPORT_TRANSPORT_FCL_FACTORY: EmailTemplate = {
  key: "import_transport_fcl_factory",
  name: "Import Transportation FCL - Factory Destuff",
  departmentId: "road_freight",
  tradeLane: "IMPORT",
  mode: "FCL",
  variant: "factory_destuffing",
  preamble: "Kindly advise your best for below enquiry",
  postamble: "",
  fieldRows: [
    staticRow("Type", "FCL-Import"),
    staticRow("Stuffing Type", "Factory Destuffing"),
    row("Pick up Address", "source"),
    row("Factory Address", "destination"),
    row("Empty Return Address", "empty_return_address"),
    row("No. & Type of Containers", "container_mix"),
    row("Gross Weight per Container", "gross_weight_kg"),
    row("Commodity", "cargo_summary"),
  ],
};

const IMPORT_TRANSPORT_FCL_DOCK: EmailTemplate = {
  key: "import_transport_fcl_dock",
  name: "Import Transportation FCL - Dock Destuff",
  departmentId: "road_freight",
  tradeLane: "IMPORT",
  mode: "FCL",
  variant: "dock_destuffing",
  preamble: "Kindly advise your best for below enquiry",
  postamble: "",
  fieldRows: [
    staticRow("Type", "FCL-Import"),
    staticRow("Stuffing Type", "Dock Destuffing"),
    row("Pick up Address", "source"),
    row("Delivery Address", "destination"),
    row("No. & Type of Packages", "num_packages"),
    row("Dimensions per package", "dimensions"),
    row("Gross Weight per Package", "gross_weight_pkg"),
    row("Total Gross Weight", "gross_weight_kg"),
    row("Commodity", "cargo_summary"),
  ],
};

const IMPORT_TRANSPORT_LCL: EmailTemplate = {
  key: "import_transport_lcl",
  name: "Import Transportation LCL",
  departmentId: "road_freight",
  tradeLane: "IMPORT",
  mode: "LCL",
  variant: null,
  preamble: "Kindly advise your best for below enquiry",
  postamble: "",
  fieldRows: [
    staticRow("Type", "Sea LCL-Import"),
    row("Pick up Address", "source"),
    row("Delivery Address", "destination"),
    row("No. & Type of Packages", "num_packages"),
    row("Dimensions per package", "dimensions"),
    row("Gross Weight per Package", "gross_weight_pkg"),
    row("Total Gross Weight", "gross_weight_kg"),
    row("Volume (CBM)", "volume_cbm"),
    row("Commodity", "cargo_summary"),
  ],
};

const IMPORT_TRANSPORT_AIR: EmailTemplate = {
  key: "import_transport_air",
  name: "Import Transportation Air",
  departmentId: "road_freight",
  tradeLane: "IMPORT",
  mode: "AIR",
  variant: null,
  preamble: "Kindly advise your best for below enquiry",
  postamble: "",
  fieldRows: [
    staticRow("Type", "Air"),
    row("Pick up Address", "source"),
    row("Delivery Address", "destination"),
    row("No. & Type of Packages", "num_packages"),
    row("Dimensions per package", "dimensions"),
    row("Gross Weight per Package", "gross_weight_pkg"),
    row("Total Gross Weight", "gross_weight_kg"),
    row("Volume (CBM)", "volume_cbm"),
    row("Commodity", "cargo_summary"),
  ],
};

/* ------------------------------------------------------------------ */
/*  Import — CHA / Custom Clearance Charges                            */
/* ------------------------------------------------------------------ */

const IMPORT_CHA_AIR: EmailTemplate = {
  key: "import_cha_air",
  name: "Import Custom Clearance - AIR",
  departmentId: "cha_services",
  tradeLane: "IMPORT",
  mode: "AIR",
  variant: null,
  preamble: "Kindly advise your best for below enquiry",
  postamble: "",
  fieldRows: [
    staticRow("Type", "Air"),
    row("AOL", "source"),
    row("AOD", "destination"),
    row("Commodity with HS Code", "commodity_description"),
    row("Cargo Value", "cargo_value"),
    row("No. & Type of Packages", "num_packages"),
    row("Dimensions per package", "dimensions"),
    row("Gross Weight per Package", "gross_weight_pkg"),
    row("Total Gross Weight", "gross_weight_kg"),
    row("Volume Weight", "volume_weight"),
  ],
  rateTable: {
    columnHeaders: ["Particulars", "Air"],
    rows: [
      {
        particular: "First time import registration (if required)",
        rates: { Air: "" },
      },
      { particular: "Agency Charges", rates: { Air: "" } },
      { particular: "Documentation Charges", rates: { Air: "" } },
      { particular: "Examination Charges", rates: { Air: "" } },
      { particular: "Unloading & loading Charges", rates: { Air: "" } },
      { particular: "Opening & repacking Charges", rates: { Air: "" } },
      { particular: "Receipted Charges", rates: { Air: "" } },
      { particular: "Transportation Charges", rates: { Air: "" } },
      { particular: "GST", rates: { Air: "" } },
    ],
  },
};

const IMPORT_CHA_FCL: EmailTemplate = {
  key: "import_cha_fcl",
  name: "Import Custom Clearance - FCL",
  departmentId: "cha_services",
  tradeLane: "IMPORT",
  mode: "FCL",
  variant: null,
  preamble: "Kindly advise your best for below enquiry",
  postamble: "",
  fieldRows: [
    staticRow("Type", "Sea-FCL-Import"),
    row("POL", "source"),
    row("POD", "destination"),
    row("Commodity with HS Code", "commodity_description"),
    row("Cargo Value", "cargo_value"),
    row("No. & Type of Containers", "container_mix"),
    row("Gross Weight per Container", "gross_weight_kg"),
  ],
  rateTable: {
    columnHeaders: ["Particulars", "20FT", "40FT"],
    rows: [
      {
        particular: "First time import registration (if required)",
        rates: { "20FT": "", "40FT": "" },
      },
      { particular: "Agency Charges", rates: { "20FT": "", "40FT": "" } },
      {
        particular: "Documentation Charges",
        rates: { "20FT": "", "40FT": "" },
      },
      { particular: "Examination Charges", rates: { "20FT": "", "40FT": "" } },
      {
        particular: "Unloading & loading Charges",
        rates: { "20FT": "", "40FT": "" },
      },
      {
        particular: "Opening & repacking Charges",
        rates: { "20FT": "", "40FT": "" },
      },
      { particular: "Receipted Charges", rates: { "20FT": "", "40FT": "" } },
      { particular: "CFS charges", rates: { "20FT": "", "40FT": "" } },
      {
        particular: "Transportation Charges",
        rates: { "20FT": "", "40FT": "" },
      },
      { particular: "GST", rates: { "20FT": "", "40FT": "" } },
    ],
  },
};

const IMPORT_CHA_LCL: EmailTemplate = {
  key: "import_cha_lcl",
  name: "Import Custom Clearance - LCL",
  departmentId: "cha_services",
  tradeLane: "IMPORT",
  mode: "LCL",
  variant: null,
  preamble: "Kindly advise your best for below enquiry",
  postamble: "",
  fieldRows: [
    staticRow("Type", "Sea-LCL-Import"),
    row("POL", "source"),
    row("POD", "destination"),
    row("Commodity with HS Code", "commodity_description"),
    row("Cargo Value", "cargo_value"),
    row("No. of Packages", "num_packages"),
    row("Dimensions per Package", "dimensions"),
    row("Gross Weight per Package", "gross_weight_pkg"),
    row("Total Gross Weight", "gross_weight_kg"),
    row("Volume (CBM)", "volume_cbm"),
  ],
  rateTable: {
    columnHeaders: ["Particulars", "Rate"],
    rows: [
      {
        particular: "First time import registration (if required)",
        rates: { Rate: "" },
      },
      { particular: "Agency Charges", rates: { Rate: "" } },
      { particular: "Documentation Charges", rates: { Rate: "" } },
      { particular: "Examination Charges", rates: { Rate: "" } },
      { particular: "Unloading & loading Charges", rates: { Rate: "" } },
      { particular: "Opening & repacking Charges", rates: { Rate: "" } },
      { particular: "Receipted Charges", rates: { Rate: "" } },
      { particular: "Transportation Charges", rates: { Rate: "" } },
      { particular: "GST", rates: { Rate: "" } },
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Import — "Other Location" clubbed templates                        */
/*  (transport + clearance + local charges from one vendor)            */
/* ------------------------------------------------------------------ */

const IMPORT_CLUBBED_AIR: EmailTemplate = {
  key: "import_clubbed_air",
  name: "Import Other Location CC & Tp - AIR",
  departmentId: "air_freight",
  tradeLane: "IMPORT",
  mode: "AIR",
  variant: "import_clubbed",
  preamble:
    "Kindly advise your best Transportation, Clearance, Airline charges, Airport Charges and any other charges applicable for below enquiry",
  postamble: "",
  fieldRows: [
    staticRow("Type", "Air"),
    row("AOL", "source"),
    row("AOD", "destination"),
    row("Delivery Address", "delivery_address"),
    row("Commodity with HS Code", "commodity_description"),
    row("Cargo Value", "cargo_value"),
    row("No. & Type of Packages", "num_packages"),
    row("Gross Weight per Package", "gross_weight_pkg"),
    row("Total Gross Weight", "gross_weight_kg"),
    row("Volume Weight", "volume_weight"),
  ],
};

const IMPORT_CLUBBED_FCL: EmailTemplate = {
  key: "import_clubbed_fcl",
  name: "Import Other Location CC & Tp - FCL",
  departmentId: "ocean_freight",
  tradeLane: "IMPORT",
  mode: "FCL",
  variant: "import_clubbed",
  preamble:
    "Kindly advise your best transportation, clearance, Shipping line charges, CFS/ICD Charges and any other charges applicable for below enquiry",
  postamble: "",
  fieldRows: [
    staticRow("Type", "Sea FCL-Import"),
    staticRow("Destuff Type", "Dock & Factory Destuff"),
    row("POL", "source"),
    row("POD", "destination"),
    row("Delivery Address", "delivery_address"),
    row("Commodity with HS Code", "commodity_description"),
    row("Cargo Value", "cargo_value"),
    row("No. & Type of Containers", "container_mix"),
    row("Gross Weight per Container", "gross_weight_kg"),
  ],
};

const IMPORT_CLUBBED_LCL: EmailTemplate = {
  key: "import_clubbed_lcl",
  name: "Import Other Location CC & Tp - LCL",
  departmentId: "ocean_freight",
  tradeLane: "IMPORT",
  mode: "LCL",
  variant: "import_clubbed",
  preamble:
    "Kindly advise your best Transportation, CFS charges, Clearance and any other charges applicable for below enquiry",
  postamble: "",
  fieldRows: [
    staticRow("Type", "Sea LCL-Import"),
    row("POL", "source"),
    row("POD", "destination"),
    row("Delivery Address", "delivery_address"),
    row("Commodity with HS Code", "commodity_description"),
    row("Cargo Value", "cargo_value"),
    row("No. & Type of Packages", "num_packages"),
    row("Dimensions per Package", "dimensions"),
    row("Gross Weight per Package", "gross_weight_pkg"),
    row("Total Gross Weight", "gross_weight_kg"),
    row("Volume (CBM)", "volume_cbm"),
  ],
};

/* ================================================================== */
/*  Template registry                                                  */
/* ================================================================== */

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  // ── Export ──
  EXPORT_OCEAN_FCL,
  EXPORT_OCEAN_LCL,
  EXPORT_AIR_FREIGHT,
  EXPORT_TRANSPORT_FCL_FACTORY,
  EXPORT_TRANSPORT_FCL_DOCK,
  EXPORT_TRANSPORT_LCL,
  EXPORT_TRANSPORT_AIR,
  EXPORT_CHA_AIR,
  EXPORT_CHA_LCL,
  EXPORT_CHA_FCL_DOCK,
  EXPORT_CHA_FCL_FACTORY,
  EXPORT_DDP_AIR,
  EXPORT_DDP_FCL,
  EXPORT_DDP_LCL,
  EXPORT_EXW_CLUBBED_AIR,
  EXPORT_EXW_CLUBBED_LCL,
  EXPORT_EXW_CLUBBED_FCL,
  // ── Import ──
  IMPORT_FOB_FCL,
  IMPORT_FOB_LCL,
  IMPORT_FOB_AIR,
  IMPORT_EXW_FCL,
  IMPORT_EXW_LCL,
  IMPORT_EXW_AIR,
  IMPORT_TRANSPORT_FCL_FACTORY,
  IMPORT_TRANSPORT_FCL_DOCK,
  IMPORT_TRANSPORT_LCL,
  IMPORT_TRANSPORT_AIR,
  IMPORT_CHA_AIR,
  IMPORT_CHA_LCL,
  IMPORT_CHA_FCL,
  IMPORT_CLUBBED_AIR,
  IMPORT_CLUBBED_FCL,
  IMPORT_CLUBBED_LCL,
];

/* ================================================================== */
/*  Resolver — picks the best template for a given context             */
/* ================================================================== */

export interface TemplateResolverInput {
  departmentId: string;
  formValues: FormValues;
  /** Trade lane from inquiry or form — "EXPORT" | "IMPORT" */
  tradeLane?: string;
  /** Incoterm from the inquiry or form — used to detect DDP/EXW/FOB variants */
  incoterm?: string;
  /** Stuffing type for FCL transport / CHA */
  stuffingType?: string;
  /** If true, use the EXW clubbed template (export) or import clubbed template */
  isExwClubbed?: boolean;
}

export function resolveEmailTemplate(
  input: TemplateResolverInput,
): EmailTemplate | null {
  const {
    departmentId,
    formValues,
    tradeLane,
    incoterm,
    stuffingType,
    isExwClubbed,
  } = input;
  const mode = normalizeMode(formValues);
  const normalizedTradeLane = (tradeLane ?? "").trim().toUpperCase();
  const normalizedIncoterm = (incoterm ?? "").trim().toUpperCase();
  const isImport = normalizedTradeLane === "IMPORT";

  // Clubbed templates override department-level templates
  if (isExwClubbed) {
    const clubbedVariant = isImport ? "import_clubbed" : "exw_clubbed";
    const clubbed = EMAIL_TEMPLATES.find(
      (t) => t.variant === clubbedVariant && matchesMode(t, mode),
    );
    if (clubbed) return clubbed;
  }

  // Import freight templates — select by incoterm (FOB vs EXW)
  if (
    isImport &&
    (departmentId === "ocean_freight" || departmentId === "air_freight")
  ) {
    const variant = normalizedIncoterm === "EXW" ? "exw" : "fob";
    const match = EMAIL_TEMPLATES.find(
      (t) =>
        t.departmentId === departmentId &&
        t.tradeLane === "IMPORT" &&
        t.variant === variant &&
        matchesMode(t, mode),
    );
    if (match) return match;
  }

  // Export DDP/DDU destination templates
  if (
    !isImport &&
    departmentId === "destination_charges" &&
    ["DAP", "DDU", "DDP"].includes(normalizedIncoterm)
  ) {
    const ddp = EMAIL_TEMPLATES.find(
      (t) =>
        t.departmentId === departmentId &&
        t.variant === "ddp" &&
        matchesMode(t, mode),
    );
    if (ddp) return ddp;
  }

  // Variant-specific match (stuffing / destuffing type)
  if (stuffingType) {
    const variantMatch = EMAIL_TEMPLATES.find(
      (t) =>
        t.departmentId === departmentId &&
        t.variant === stuffingType &&
        matchesTradeLane(t, normalizedTradeLane) &&
        matchesMode(t, mode),
    );
    if (variantMatch) return variantMatch;
  }

  // Default match — department + trade lane + mode, no variant
  const defaultMatch = EMAIL_TEMPLATES.find(
    (t) =>
      t.departmentId === departmentId &&
      t.variant === null &&
      matchesTradeLane(t, normalizedTradeLane) &&
      matchesMode(t, mode),
  );
  if (defaultMatch) return defaultMatch;

  // Fallback — department + mode, ignore trade lane
  return (
    EMAIL_TEMPLATES.find(
      (t) =>
        t.departmentId === departmentId &&
        t.variant === null &&
        matchesMode(t, mode),
    ) ?? null
  );
}

function normalizeMode(formValues: FormValues): string {
  const raw = formValues.mode;
  return (typeof raw === "string" ? raw : "FCL").trim().toUpperCase();
}

function matchesMode(template: EmailTemplate, mode: string): boolean {
  if (template.mode === null) return true;
  return template.mode === mode;
}

function matchesTradeLane(template: EmailTemplate, tradeLane: string): boolean {
  if (template.tradeLane === null) return true;
  return template.tradeLane === tradeLane;
}

/* ================================================================== */
/*  Email HTML builder from template                                   */
/* ================================================================== */

export function resolveFieldValue(
  fieldRow: EmailFieldRow,
  formValues: FormValues,
): string {
  if (fieldRow.source.startsWith("=")) {
    return fieldRow.source.slice(1);
  }
  const raw = formValues[fieldRow.source];
  if (raw === undefined || raw === null) return "";
  const formattedValue = Array.isArray(raw) ? raw.join(", ") : String(raw);
  if (!formattedValue.trim()) {
    return "";
  }

  const rawUnit = formValues[`${fieldRow.source}_unit`];
  const formattedUnit = typeof rawUnit === "string" ? rawUnit.trim() : "";

  return formattedUnit ? `${formattedValue} ${formattedUnit}` : formattedValue;
}

export function buildRateTableHtml(
  rateTable: EmailTemplate["rateTable"],
): string {
  if (!rateTable || rateTable.rows.length === 0) return "";

  const headers = rateTable.columnHeaders;
  const rateKeys = headers.slice(1);

  return `
<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:13px;margin:12px 0;">
  <thead>
    <tr>
      ${headers.map((h) => `<th style="background:#f0f4f8;padding:6px 12px;border:1px solid #ccc;font-weight:bold;text-align:left;">${h}</th>`).join("\n      ")}
    </tr>
  </thead>
  <tbody>
    ${rateTable.rows
      .map(
        (tableRow) =>
          `<tr><td style="padding:6px 12px;border:1px solid #ccc;font-weight:bold;background:#f0f4f8;">${tableRow.particular}</td>${rateKeys
            .map(
              (key) =>
                `<td style="padding:6px 12px;border:1px solid #ccc;" contenteditable="true">${tableRow.rates[key] ?? ""}</td>`,
            )
            .join("")}</tr>`,
      )
      .join("\n    ")}
  </tbody>
</table>`;
}

export function buildTemplateEmailHtml(
  template: EmailTemplate,
  formValues: FormValues,
): { subject: string; html: string } {
  const rows = template.fieldRows
    .map((fieldRow) => ({
      label: fieldRow.label,
      value: resolveFieldValue(fieldRow, formValues),
    }))
    .filter((r) => r.value !== "" || r.label !== "");

  const columnWidth = Math.max(
    ...rows.map((r) => r.label.length * 8 + 24),
    150,
  );
  const constrainedColumnWidth = Math.min(columnWidth, 260);
  const tableWidth = constrainedColumnWidth * 2;

  const fieldTableHtml =
    rows.length > 0
      ? `
<table border="1" cellpadding="0" cellspacing="0" width="${tableWidth}" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:13px;margin:12px 0;table-layout:fixed;max-width:100%;">
  <tbody>
    ${rows
      .map(
        (r) =>
          `<tr><td width="${constrainedColumnWidth}" style="width:${constrainedColumnWidth}px;font-weight:bold;background:#f0f4f8;padding:6px 10px;border:1px solid #ccc;vertical-align:top;word-break:break-word;">${r.label}</td><td width="${constrainedColumnWidth}" style="width:${constrainedColumnWidth}px;padding:6px 10px;border:1px solid #ccc;vertical-align:top;word-break:break-word;white-space:normal;">${r.value}</td></tr>`,
      )
      .join("\n    ")}
  </tbody>
</table>`
      : "";

  const rateTableHtml = template.rateTable
    ? buildRateTableHtml(template.rateTable)
    : "";

  const html = `
<div style="font-family:Arial,sans-serif;font-size:13px;color:#333;line-height:1.5;">
<p style="margin:0;">Dear [Person Name],</p>
<br/>
<p style="margin:0;">Good day!</p>
<br/>
<p style="margin:0;">${template.preamble}</p>
<br/>
<div id="rfq-dynamic-table-container">${fieldTableHtml}</div>
<br/>
${rateTableHtml ? `<div id="rfq-rate-table-container">${rateTableHtml}</div><br/>` : ""}
${template.postamble ? `<p style="margin:0;">${template.postamble}</p><br/>` : ""}
</div>`;

  // Build subject from form values
  const origin = (formValues.source ||
    formValues.origin ||
    "[Origin]") as string;
  const destination = (formValues.destination || "[Destination]") as string;
  const inquiryRef = "[Inquiry Number]";

  const subject =
    template.departmentId === "road_freight"
      ? `${inquiryRef} || Transport Rate Request || ${origin}`
      : `${inquiryRef} // ${origin} // ${destination}`;

  return { subject, html };
}
