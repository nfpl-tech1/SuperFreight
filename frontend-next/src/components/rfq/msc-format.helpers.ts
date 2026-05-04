import type { Inquiry } from "@/lib/api";
import type {
  FilterableVendor,
  FormValues,
  MscFieldKey,
  MscFieldOverrides,
  MscFields,
  ResponseField,
} from "@/types/rfq";

export type MscFieldDefinition = {
  key: MscFieldKey;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  portSearch?: boolean;
};

export const MSC_FIELD_DEFINITIONS: MscFieldDefinition[] = [
  { key: "shipper", label: "Shipper" },
  { key: "forwarder", label: "Forwarder", placeholder: "Forwarder / company name" },
  { key: "por", label: "POR", placeholder: "Place of receipt", portSearch: true },
  { key: "pol", label: "POL", placeholder: "Port of loading", portSearch: true },
  { key: "pod", label: "POD", placeholder: "Port of discharge", portSearch: true },
  { key: "commodity", label: "Commodity", multiline: true },
  { key: "cargoWeight", label: "Cargo Weight" },
  { key: "volume", label: "Volume" },
  {
    key: "requestedRates",
    label: "Requested Rates",
    multiline: true,
    placeholder: "Freight, local charges, surcharges, transit time, etc.",
  },
  { key: "freeTimeIfAny", label: "Freetime If Any" },
  { key: "validity", label: "Validity", placeholder: "Required quotation validity" },
  {
    key: "termsOfShipment",
    label: "Terms of Shipment",
    multiline: true,
    placeholder: "Incoterm, mode, equipment, and any shipment terms",
  },
  {
    key: "specificRemarks",
    label: "Specific Remarks If Any",
    multiline: true,
    placeholder: "Special remarks or handling instructions",
  },
];

export const EMPTY_MSC_FIELDS: MscFields = {
  shipper: "",
  forwarder: "",
  por: "",
  pol: "",
  pod: "",
  commodity: "",
  cargoWeight: "",
  volume: "",
  requestedRates: "",
  freeTimeIfAny: "",
  validity: "",
  termsOfShipment: "",
  specificRemarks: "",
};

function normalizeVendorName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function isMscVendorName(value: string | null | undefined) {
  const normalized = normalizeVendorName(value ?? "");
  if (!normalized) {
    return false;
  }

  return (
    normalized.includes("mediterranean shipping company") ||
    /(^| )msc( |$)/.test(normalized)
  );
}

export function getMscVendors<T extends Pick<FilterableVendor, "name">>(vendors: T[]): T[] {
  return vendors.filter((vendor) => isMscVendorName(vendor.name));
}

function resolveTextValue(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item ?? "").trim())
      .filter(Boolean)
      .join(", ");
  }

  return String(value ?? "").trim();
}

function resolveValueWithUnit(formValues: FormValues, key: string) {
  const value = resolveTextValue(formValues[key]);
  if (!value) {
    return "";
  }

  const unit = resolveTextValue(formValues[`${key}_unit`]);
  return unit ? `${value} ${unit}` : value;
}

function buildTermsOfShipment(formValues: FormValues) {
  const parts = [
    resolveTextValue(formValues.trade_lane),
    resolveTextValue(formValues.incoterm),
    resolveTextValue(formValues.mode),
    resolveTextValue(formValues.container_mix),
  ].filter(Boolean);

  return parts.join(" | ");
}

type ResolveMscFieldsInput = {
  inquiry?: Pick<Inquiry, "customerName"> | null;
  formValues: FormValues;
  responseFields: ResponseField[];
};

export function buildDefaultMscFields({
  inquiry,
  formValues,
  responseFields,
}: ResolveMscFieldsInput): MscFields {
  const requestedRates = responseFields
    .filter((field) => field.selected)
    .map((field) => field.label.trim())
    .filter(Boolean)
    .join(", ");

  return {
    shipper: inquiry?.customerName?.trim() ?? "",
    forwarder: "",
    por:
      resolveTextValue(formValues.pickup_address) ||
      resolveTextValue(formValues.source),
    pol: resolveTextValue(formValues.source),
    pod: resolveTextValue(formValues.destination),
    commodity:
      resolveTextValue(formValues.commodity_description) ||
      resolveTextValue(formValues.cargo_summary),
    cargoWeight:
      resolveValueWithUnit(formValues, "gross_weight_kg") ||
      resolveValueWithUnit(formValues, "gross_weight_pkg"),
    volume:
      resolveValueWithUnit(formValues, "volume_cbm") ||
      resolveValueWithUnit(formValues, "volume_weight"),
    requestedRates,
    freeTimeIfAny: resolveTextValue(formValues.free_days),
    validity: "",
    termsOfShipment: buildTermsOfShipment(formValues),
    specificRemarks: resolveTextValue(formValues.other_notes),
  };
}

export function resolveMscFields(
  overrides: MscFieldOverrides | undefined,
  input: ResolveMscFieldsInput,
): MscFields {
  const defaults = buildDefaultMscFields(input);

  return (
    Object.keys(EMPTY_MSC_FIELDS) as MscFieldKey[]
  ).reduce<MscFields>((resolved, key) => {
    if (overrides && Object.prototype.hasOwnProperty.call(overrides, key)) {
      resolved[key] = String(overrides[key] ?? "");
      return resolved;
    }

    resolved[key] = defaults[key];
    return resolved;
  }, { ...EMPTY_MSC_FIELDS });
}

export function getMissingMscFieldLabels(fields: MscFields) {
  return MSC_FIELD_DEFINITIONS.filter((field) => !fields[field.key].trim()).map(
    (field) => field.label,
  );
}
