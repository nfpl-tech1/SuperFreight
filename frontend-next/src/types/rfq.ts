export type FieldType =
  | "text"
  | "number"
  | "currency"
  | "date"
  | "select"
  | "radio"
  | "multiline"
  | "multiselect";

export interface FieldRule {
  visible_if?: Record<string, string | string[]>;
  min?: number;
  max?: number;
  pattern?: string;
}

export interface FieldUI {
  placeholder?: string;
  helpText?: string;
  hideInPreview?: boolean;
}

export interface FieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  default?: string | string[];
  options?: string[];
  unitOptions?: string[];
  defaultUnit?: string;
  rules?: FieldRule;
  ui?: FieldUI;
  halfWidth?: boolean;
}

export interface DepartmentDefinition {
  id: string;
  name: string;
  group: string;
  fields: FieldDefinition[];
}

export interface ValidationResult {
  errors: Record<string, string>;
  warnings: string[];
  isValid: boolean;
}

export type FormValues = Record<string, string | string[]>;

export type YesNoAny = "Yes" | "No" | "Any";
export type VendorLocationFocus = "Any" | "Origin" | "Destination";
export type VendorLocationKind = "PORT" | "SERVICE_LOCATION";
export type VendorLocationScope = "EXACT" | "COUNTRY";
export type VendorLocationRole = "ORIGIN" | "DESTINATION";
export type VendorQuoteTypeContext =
  | "road_freight"
  | "cha_services"
  | "ocean_freight"
  | "air_freight"
  | "local_port_charges"
  | "destination_charges";
export type VendorAdvancedFilterKey =
  | "status"
  | "iataCertified"
  | "seaFreight"
  | "projectCargo"
  | "ownConsolidation"
  | "ownTransport"
  | "ownWarehouse"
  | "ownCustoms";

export interface FilterableVendor {
  id: string;
  name: string;
  locationMaster: string;
  country: string | null;
  primaryContactName: string;
  primaryContactEmail: string;
  tradeDirections: string[];
  categories: string[];
  status: "Active" | "Inactive";
  wcaYears: number;
  iataCertified: boolean;
  seaFreight: boolean;
  projectCargo: boolean;
  ownConsolidation: boolean;
  ownTransport: boolean;
  ownWarehouse: boolean;
  ownCustoms: boolean;
}

export type VendorDispatchResolution =
  | "MANUAL"
  | "EXACT_LOCATION"
  | "COUNTRY_MATCH"
  | "PRIMARY_OFFICE"
  | "FIRST_AVAILABLE"
  | "UNRESOLVED";

export interface VendorDispatchOfficeOption {
  officeId: string;
  officeName: string;
  locationLabel: string;
  contactName: string;
  contactEmail: string;
  ccEmails: string[];
  resolutionLabel: string;
  isPrimary: boolean;
}

export interface VendorDispatchTarget {
  vendorId: string;
  vendorName: string;
  officeId: string | null;
  selectedOfficeIds: string[];
  officeName: string;
  officeLocation: string;
  contactName: string;
  contactEmail: string;
  ccEmails: string[];
  selectedOffices: VendorDispatchOfficeOption[];
  resolution: VendorDispatchResolution;
  resolutionLabel: string;
  needsAttention: boolean;
  isLoading: boolean;
  availableOffices: VendorDispatchOfficeOption[];
}

export interface VendorFilterCriteria {
  tradeDirections: string[];
  categories: string[];
  vendorTypeMode: string;
  searchMode: string;
  locationFocus: VendorLocationFocus;
  locationQuery: string;
  selectedLocationId: string;
  selectedLocationKind: VendorLocationKind | "";
  selectedLocationLabel: string;
  selectedLocationCountryName: string;
  locationScope: VendorLocationScope;
  status: "Active" | "Inactive" | "Any";
  minWcaYears: number;
  iataCertified: YesNoAny;
  seaFreight: YesNoAny;
  projectCargo: YesNoAny;
  ownConsolidation: YesNoAny;
  ownTransport: YesNoAny;
  ownWarehouse: YesNoAny;
  ownCustoms: YesNoAny;
}

export interface VendorLookupBundle {
  tradeDirections: string[];
  categories: string[];
  showWcaYears: boolean;
}

export interface VendorSelectionProfile {
  quoteTypeContext: VendorQuoteTypeContext;
  scopeLabel: string;
  scopeSummary: string;
  scopedCategories: string[];
  quickCategoryNames: string[];
  recommendedLocationFocus: VendorLocationFocus;
  locationRole: VendorLocationRole;
  locationKind: VendorLocationKind;
  locationLabel: string;
  portMode: "AIRPORT" | "SEAPORT" | null;
  searchPlaceholder: string;
  qualificationTitle: string;
  qualificationDescription: string;
  qualificationFilters: VendorAdvancedFilterKey[];
  operationalTitle: string;
  operationalDescription: string;
  operationalFilters: VendorAdvancedFilterKey[];
  categoryDescription: string;
}

export interface VendorLocationOption {
  id: string;
  kind: VendorLocationKind;
  label: string;
  subLabel: string;
  countryName: string;
  portMode: string | null;
  recommended: boolean;
}

export interface ResponseField {
  id: string;
  label: string;
  isCustom: boolean;
  selected: boolean;
}

export type MscFieldKey =
  | "shipper"
  | "forwarder"
  | "por"
  | "pol"
  | "pod"
  | "commodity"
  | "cargoWeight"
  | "volume"
  | "requestedRates"
  | "freeTimeIfAny"
  | "validity"
  | "termsOfShipment"
  | "specificRemarks";

export type MscFields = Record<MscFieldKey, string>;
export type MscFieldOverrides = Partial<MscFields>;

export interface InquiryData {
  id: string;
  label: string;
  customer: string;
  departmentId: string;
}

export type WizardStep = 1 | 2 | 3 | 4;
