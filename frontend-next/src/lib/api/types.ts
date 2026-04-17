export interface RolePermission {
  id?: number;
  moduleKey: string;
  canView: boolean;
  canEdit: boolean;
}

export interface ScopeRule {
  id?: number;
  scopeType: string;
  scopeValue: string;
}

export interface AppRoleDefinition {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: RolePermission[];
  scopeRules: ScopeRule[];
}

export interface User {
  id: string;
  osUserId: string | null;
  email: string;
  name: string | null;
  role: "ADMIN" | "USER";
  isActive: boolean;
  isAppAdmin: boolean;
  isTeamLead: boolean;
  userType: string | null;
  departmentSlug: string | null;
  departmentName: string | null;
  orgId: string | null;
  orgName: string | null;
  outlookConnected: boolean;
  outlookConnectedAt: string | null;
  emailSignature: string | null;
  departments: string[];
  customRoles: AppRoleDefinition[];
}

export interface SessionResponse {
  user: User;
  onboarding_required: boolean;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: "bearer";
  user: User;
}

export interface Inquiry {
  id: string;
  inquiryNumber: string;
  inquiryType: "CHA_ONLY" | "FREIGHT_ONLY" | "CHA_FREIGHT";
  status:
    | "PENDING"
    | "RFQ_SENT"
    | "QUOTES_RECEIVED"
    | "QUOTED_TO_CUSTOMER"
    | "CLOSED";
  customerName: string;
  customerRole: "Consignee/Agent" | "Shipper" | null;
  tradeLane: string | null;
  origin: string | null;
  destination: string | null;
  shipmentMode: string | null;
  incoterm: string | null;
  cargoSummary: string | null;
  ownerUserId: string | null;
  mailboxOwnerUserId: string | null;
  createdAt: string;
}

export interface FreightQuote {
  id: string;
  inquiryId: string;
  rfqId: string | null;
  vendorId: string | null;
  vendorName: string;
  currency: string | null;
  totalRate: number | null;
  freightRate: number | null;
  localCharges: number | null;
  documentation: number | null;
  transitDays: number | null;
  validUntil: string | null;
  remarks: string | null;
  extractedFields: Record<string, unknown> | null;
}

export interface RateSheet {
  id: string;
  shippingLine: string;
  tradeLane: string | null;
  currency: string | null;
  amount: number | null;
  effectiveMonth: string | null;
  notes: string | null;
}

export interface Rfq {
  id: string;
  inquiryId: string;
  inquiryNumber: string;
  departmentId: string;
  formValues: Record<string, unknown>;
  vendorIds: string[];
  sent: boolean;
  subjectLine: string | null;
  promptTemplateMeta: { selectedFields?: string[] } | null;
}

export interface CustomerDraft {
  id: string;
  inquiryId: string;
  quoteId: string;
  subjectLine: string | null;
  draftBody: string;
  marginPercent: number | null;
  createdAt: string;
}

export interface OutlookStatus {
  isConnected: boolean;
  connectedAt: string | null;
  mailbox: string | null;
  reconnectRequired: boolean;
  subscription: {
    id: string;
    subscriptionId: string | null;
    resource: string | null;
    expiresAt: string | null;
    isActive: boolean;
  } | null;
}

export interface VendorTypeDefinition {
  id: string;
  typeCode: string;
  typeName: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface VendorSummary {
  vendors: number;
  offices: number;
  contacts: number;
  ccRecipients: number;
}

export interface VendorLookups {
  vendorTypes: VendorTypeDefinition[];
  countries: string[];
}

export interface VendorContact {
  id: string;
  contactName: string;
  salutation: string | null;
  designation: string | null;
  emailPrimary: string | null;
  emailSecondary: string | null;
  mobile1: string | null;
  mobile2: string | null;
  landline: string | null;
  whatsappNumber: string | null;
  isPrimary: boolean;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VendorCcRecipient {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VendorPort {
  id: string;
  code: string;
  name: string;
  cityName: string | null;
  stateName: string | null;
  countryName: string;
  portMode: string;
  isActive: boolean;
  notes: string | null;
}

export interface VendorServiceLocation {
  id: string;
  name: string;
  cityName: string | null;
  stateName: string | null;
  countryName: string;
  locationKind: string;
  isActive: boolean;
  notes: string | null;
}

export interface VendorCapabilityFlags {
  isIataCertified: boolean;
  doesSeaFreight: boolean;
  doesProjectCargo: boolean;
  doesOwnConsolidation: boolean;
  doesOwnTransportation: boolean;
  doesOwnWarehousing: boolean;
  doesOwnCustomClearance: boolean;
}

export interface VendorOfficeSummary {
  id: string;
  officeName: string;
  cityName: string | null;
  stateName: string | null;
  countryName: string | null;
  externalCode: string | null;
  isPrimary: boolean;
  isActive: boolean;
}

export interface VendorOfficeDetail {
  id: string;
  vendorId: string;
  officeName: string;
  cityName: string | null;
  stateName: string | null;
  countryName: string | null;
  addressRaw: string | null;
  externalCode: string | null;
  specializationRaw: string | null;
  isActive: boolean;
  isPrimary: boolean;
  capabilities: VendorCapabilityFlags;
  vendorTypes: VendorTypeDefinition[];
  ports: VendorPort[];
  serviceLocations: VendorServiceLocation[];
  contacts: VendorContact[];
  ccRecipients: VendorCcRecipient[];
  createdAt: string;
  updatedAt: string;
}

export interface VendorListItem {
  id: string;
  companyName: string;
  normalizedName: string;
  isActive: boolean;
  notes: string | null;
  primaryOfficeId: string | null;
  officeCount: number;
  contactCount: number;
  countries: string[];
  capabilities: VendorCapabilityFlags;
  vendorTypes: VendorTypeDefinition[];
  primaryOffice: VendorOfficeSummary | null;
  primaryContact: VendorContact | null;
  createdAt: string;
  updatedAt: string;
}

export interface VendorDetail {
  id: string;
  companyName: string;
  normalizedName: string;
  isActive: boolean;
  notes: string | null;
  primaryOfficeId: string | null;
  countries: string[];
  vendorTypes: VendorTypeDefinition[];
  officeCount: number;
  offices: VendorOfficeDetail[];
  createdAt: string;
  updatedAt: string;
}

export interface VendorCatalogPage {
  items: VendorListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

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

export interface VendorLocationOption {
  id: string;
  kind: VendorLocationKind;
  label: string;
  subLabel: string;
  countryName: string;
  portMode: string | null;
  recommended: boolean;
}

export interface VendorLocationOptionPage {
  items: VendorLocationOption[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface VendorLocationOptionsQuery {
  page?: number;
  pageSize?: number;
  quoteTypeContext?: VendorQuoteTypeContext;
  shipmentMode?: string;
  locationKind?: VendorLocationKind;
  locationRole?: VendorLocationRole;
  portMode?: string;
  countryName?: string;
  search?: string;
  typeCodes?: string[];
}

export interface VendorListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
  countryName?: string;
  cityName?: string;
  quoteTypeContext?: VendorQuoteTypeContext;
  shipmentMode?: string;
  locationKind?: VendorLocationKind;
  locationId?: string;
  locationCountryName?: string;
  locationRole?: VendorLocationRole;
  locationScope?: VendorLocationScope;
  typeCodes?: string[];
  isIataCertified?: boolean;
  doesSeaFreight?: boolean;
  doesProjectCargo?: boolean;
  doesOwnConsolidation?: boolean;
  doesOwnTransportation?: boolean;
  doesOwnWarehousing?: boolean;
  doesOwnCustomClearance?: boolean;
}

export interface UpsertVendorPayload {
  companyName?: string;
  isActive?: boolean;
  notes?: string;
  primaryOfficeId?: string;
}

export interface UpsertVendorContactPayload {
  contactName: string;
  salutation?: string;
  designation?: string;
  emailPrimary?: string;
  emailSecondary?: string;
  mobile1?: string;
  mobile2?: string;
  landline?: string;
  whatsappNumber?: string;
  isPrimary?: boolean;
  isActive?: boolean;
  notes?: string;
}

export interface UpsertVendorCcRecipientPayload {
  email: string;
  isActive?: boolean;
}

export interface UpsertVendorOfficePayload {
  officeName?: string;
  cityName?: string;
  stateName?: string;
  countryName?: string;
  addressRaw?: string;
  externalCode?: string;
  specializationRaw?: string;
  isActive?: boolean;
  isIataCertified?: boolean;
  doesSeaFreight?: boolean;
  doesProjectCargo?: boolean;
  doesOwnConsolidation?: boolean;
  doesOwnTransportation?: boolean;
  doesOwnWarehousing?: boolean;
  doesOwnCustomClearance?: boolean;
  isPrimary?: boolean;
  typeIds?: string[];
  portIds?: string[];
  contacts?: UpsertVendorContactPayload[];
  ccRecipients?: UpsertVendorCcRecipientPayload[];
}

export type PortMode = "AIRPORT" | "SEAPORT";

export interface PortMasterAlias {
  id: string;
  alias: string;
  normalizedAlias: string;
  countryName: string | null;
  portMode: PortMode | null;
  isPrimary: boolean;
  sourceWorkbook: string | null;
  sourceSheet: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PortMasterListItem {
  id: string;
  code: string;
  name: string;
  cityName: string | null;
  stateName: string | null;
  countryName: string;
  portMode: PortMode;
  unlocode: string | null;
  sourceConfidence: string | null;
  isActive: boolean;
  notes: string | null;
  aliasCount: number;
  linkedOfficeCount: number;
  aliases: PortMasterAlias[];
  createdAt: string;
  updatedAt: string;
}

export interface PortMasterDetail extends PortMasterListItem {
  normalizedName: string | null;
  normalizedCityName: string | null;
  normalizedCountryName: string | null;
  regionId: string | null;
}

export interface PortMasterPage {
  items: PortMasterListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PortMasterListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  countryName?: string;
  portMode?: PortMode;
  isActive?: boolean;
}

export interface UpsertPortMasterAliasPayload {
  alias: string;
  countryName?: string;
  isPrimary?: boolean;
  sourceWorkbook?: string;
  sourceSheet?: string;
}

export interface UpsertPortMasterPayload {
  code?: string;
  name?: string;
  cityName?: string;
  stateName?: string;
  countryName?: string;
  portMode?: PortMode;
  unlocode?: string;
  sourceConfidence?: string;
  isActive?: boolean;
  notes?: string;
  aliases?: UpsertPortMasterAliasPayload[];
}
