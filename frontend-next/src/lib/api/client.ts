import { request } from "@/lib/api/request";
import type {
  AppRoleDefinition,
  AuthTokenResponse,
  CustomerDraft,
  FreightQuote,
  Inquiry,
  OutlookStatus,
  RateSheet,
  Rfq,
  RolePermission,
  ScopeRule,
  SessionResponse,
  User,
  PortMasterDetail,
  PortMasterListQuery,
  PortMasterPage,
  UpsertPortMasterPayload,
  UpsertVendorOfficePayload,
  UpsertVendorPayload,
  VendorCatalogPage,
  VendorDetail,
  VendorListQuery,
  VendorLocationOptionPage,
  VendorLocationOptionsQuery,
  VendorLookups,
  VendorSummary,
} from "@/lib/api/types";

function buildQueryString(query: VendorListQuery) {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  if (query.search) params.set("search", query.search);
  if (query.isActive !== undefined)
    params.set("isActive", String(query.isActive));
  if (query.countryName) params.set("countryName", query.countryName);
  if (query.cityName) params.set("cityName", query.cityName);
  if (query.quoteTypeContext)
    params.set("quoteTypeContext", query.quoteTypeContext);
  if (query.shipmentMode) params.set("shipmentMode", query.shipmentMode);
  if (query.locationKind) params.set("locationKind", query.locationKind);
  if (query.locationId) params.set("locationId", query.locationId);
  if (query.locationCountryName)
    params.set("locationCountryName", query.locationCountryName);
  if (query.locationRole) params.set("locationRole", query.locationRole);
  if (query.locationScope) params.set("locationScope", query.locationScope);
  if (query.typeCodes && query.typeCodes.length > 0) {
    params.set("typeCodes", query.typeCodes.join(","));
  }
  if (query.isIataCertified !== undefined)
    params.set("isIataCertified", String(query.isIataCertified));
  if (query.doesSeaFreight !== undefined)
    params.set("doesSeaFreight", String(query.doesSeaFreight));
  if (query.doesProjectCargo !== undefined)
    params.set("doesProjectCargo", String(query.doesProjectCargo));
  if (query.doesOwnConsolidation !== undefined)
    params.set("doesOwnConsolidation", String(query.doesOwnConsolidation));
  if (query.doesOwnTransportation !== undefined)
    params.set("doesOwnTransportation", String(query.doesOwnTransportation));
  if (query.doesOwnWarehousing !== undefined)
    params.set("doesOwnWarehousing", String(query.doesOwnWarehousing));
  if (query.doesOwnCustomClearance !== undefined)
    params.set("doesOwnCustomClearance", String(query.doesOwnCustomClearance));
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

function buildLocationOptionsQueryString(query: VendorLocationOptionsQuery) {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  if (query.quoteTypeContext)
    params.set("quoteTypeContext", query.quoteTypeContext);
  if (query.shipmentMode) params.set("shipmentMode", query.shipmentMode);
  if (query.locationKind) params.set("locationKind", query.locationKind);
  if (query.locationRole) params.set("locationRole", query.locationRole);
  if (query.portMode) params.set("portMode", query.portMode);
  if (query.countryName) params.set("countryName", query.countryName);
  if (query.search) params.set("search", query.search);
  if (query.typeCodes && query.typeCodes.length > 0) {
    params.set("typeCodes", query.typeCodes.join(","));
  }
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

function buildPortMasterQueryString(query: PortMasterListQuery) {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  if (query.search) params.set("search", query.search);
  if (query.countryName) params.set("countryName", query.countryName);
  if (query.portMode) params.set("portMode", query.portMode);
  if (query.isActive !== undefined)
    params.set("isActive", String(query.isActive));
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

export const api = {
  login: (email: string, password: string) =>
    request<AuthTokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  consumeSsoToken: (token: string) =>
    request<AuthTokenResponse>("/auth/sso", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),

  refreshAuth: () =>
    request<AuthTokenResponse>("/auth/refresh", {
      method: "POST",
    }),

  logout: () =>
    request<{ success: boolean }>("/auth/logout", {
      method: "POST",
    }),

  getSession: () => request<SessionResponse>("/auth/me"),

  updateMySignature: (signature: string | null) =>
    request<User>("/users/me/signature", {
      method: "PATCH",
      body: JSON.stringify({ signature }),
    }),

  getUsers: () => request<User[]>("/users"),
  updateDepartments: (id: string, departments: string[]) =>
    request<User>(`/users/${id}/departments`, {
      method: "POST",
      body: JSON.stringify({ departments }),
    }),
  assignUserRoles: (id: string, roleIds: string[]) =>
    request<User>(`/users/${id}/roles`, {
      method: "POST",
      body: JSON.stringify({ roleIds }),
    }),

  getRoles: () => request<AppRoleDefinition[]>("/roles"),
  createRole: (body: {
    name: string;
    description?: string;
    permissions: RolePermission[];
    scopeRules: ScopeRule[];
  }) =>
    request<AppRoleDefinition>("/roles", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateRole: (
    id: string,
    body: {
      name: string;
      description?: string;
      permissions: RolePermission[];
      scopeRules: ScopeRule[];
    },
  ) =>
    request<AppRoleDefinition>(`/roles/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deleteRole: (id: string) =>
    request<{ success: boolean }>(`/roles/${id}`, {
      method: "DELETE",
    }),

  getVendorSummary: () => request<VendorSummary>("/vendors/summary"),
  getVendorLookups: () => request<VendorLookups>("/vendors/lookups"),
  getVendorLocationOptions: (query: VendorLocationOptionsQuery = {}) =>
    request<VendorLocationOptionPage>(
      `/vendors/location-options${buildLocationOptionsQueryString(query)}`,
    ),
  getVendors: (query: VendorListQuery = {}) =>
    request<VendorCatalogPage>(`/vendors${buildQueryString(query)}`),
  getVendorDetail: (id: string) => request<VendorDetail>(`/vendors/${id}`),
  createVendor: (body: UpsertVendorPayload) =>
    request<VendorDetail>("/vendors", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateVendor: (id: string, body: UpsertVendorPayload) =>
    request<VendorDetail>(`/vendors/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deleteVendor: (id: string) =>
    request<{ success: boolean; id: string }>(`/vendors/${id}`, {
      method: "DELETE",
    }),
  createVendorOffice: (vendorId: string, body: UpsertVendorOfficePayload) =>
    request<VendorDetail>(`/vendors/${vendorId}/offices`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateVendorOffice: (officeId: string, body: UpsertVendorOfficePayload) =>
    request<VendorDetail>(`/vendors/offices/${officeId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  getPortMaster: (query: PortMasterListQuery = {}) =>
    request<PortMasterPage>(
      `/vendors/port-master${buildPortMasterQueryString(query)}`,
    ),
  getPortMasterDetail: (id: string) =>
    request<PortMasterDetail>(`/vendors/port-master/${id}`),
  createPortMaster: (body: UpsertPortMasterPayload) =>
    request<PortMasterDetail>("/vendors/port-master", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updatePortMaster: (id: string, body: UpsertPortMasterPayload) =>
    request<PortMasterDetail>(`/vendors/port-master/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  getOutlookStatus: () => request<OutlookStatus>("/outlook/status"),
  getOutlookConnectUrl: () => request<{ url: string }>("/outlook/connect-url"),
  completeOutlookConnect: (code: string) =>
    request<OutlookStatus>("/outlook/complete", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),
  reconnectOutlook: () =>
    request<OutlookStatus>("/outlook/reconnect", { method: "POST" }),

  getInquiries: () => request<Inquiry[]>("/inquiries"),
  createInquiry: (body: {
    inquiryNumber?: string;
    customerName: string;
    inquiryType: Inquiry["inquiryType"];
    customerRole?: Inquiry["customerRole"];
    tradeLane?: string;
    origin?: string;
    destination?: string;
    shipmentMode?: string;
    incoterm?: string;
    cargoSummary?: string;
  }) =>
    request<Inquiry>("/inquiries", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateInquiry: (
    id: string,
    body: {
      inquiryNumber?: string;
      customerName?: string;
      inquiryType?: Inquiry["inquiryType"];
      customerRole?: Inquiry["customerRole"];
      tradeLane?: string;
      origin?: string;
      destination?: string;
      shipmentMode?: string;
      incoterm?: string;
      cargoSummary?: string;
    },
  ) =>
    request<Inquiry>(`/inquiries/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deleteInquiry: (id: string) =>
    request<{ success: boolean; id: string }>(`/inquiries/${id}`, {
      method: "DELETE",
    }),
  transferInquiry: (id: string, newOwnerUserId: string, reason?: string) =>
    request<Inquiry>(`/inquiries/${id}/transfer`, {
      method: "POST",
      body: JSON.stringify({ newOwnerUserId, reason }),
    }),

  getRateSheets: () => request<RateSheet[]>("/rate-sheets"),
  createRateSheet: (body: Omit<RateSheet, "id">) =>
    request<RateSheet>("/rate-sheets", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getQuotes: (inquiryId?: string) =>
    request<FreightQuote[]>(
      `/quotes${inquiryId ? `?inquiryId=${encodeURIComponent(inquiryId)}` : ""}`,
    ),
  createQuote: (body: {
    inquiryId: string;
    vendorId?: string;
    vendorName: string;
    currency?: string;
    totalRate?: number;
    freightRate?: number;
    localCharges?: number;
    documentation?: number;
    transitDays?: number;
    validUntil?: string;
    remarks?: string;
    extractedFields?: Record<string, unknown>;
  }) =>
    request<FreightQuote>("/quotes", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getRfqs: () => request<Rfq[]>("/rfqs"),
  createRfq: (body: {
    inquiryId: string;
    inquiryNumber: string;
    departmentId: string;
    formValues: Record<string, unknown>;
    vendorIds: string[];
    officeSelections?: { vendorId: string; officeId: string }[];
    responseFields: {
      fieldKey: string;
      fieldLabel: string;
      isCustom: boolean;
    }[];
    sendNow?: boolean;
    mailSubject?: string;
    mailBodyHtml?: string;
    attachments?: File[];
  }) =>
    (() => {
      const formData = new FormData();
      formData.set("inquiryId", body.inquiryId);
      formData.set("inquiryNumber", body.inquiryNumber);
      formData.set("departmentId", body.departmentId);
      formData.set("formValues", JSON.stringify(body.formValues));
      formData.set("vendorIds", JSON.stringify(body.vendorIds));
      formData.set(
        "officeSelections",
        JSON.stringify(body.officeSelections ?? []),
      );
      formData.set("responseFields", JSON.stringify(body.responseFields));

      if (body.sendNow !== undefined) {
        formData.set("sendNow", String(body.sendNow));
      }
      if (body.mailSubject !== undefined) {
        formData.set("mailSubject", body.mailSubject);
      }
      if (body.mailBodyHtml !== undefined) {
        formData.set("mailBodyHtml", body.mailBodyHtml);
      }

      for (const attachment of body.attachments ?? []) {
        formData.append("attachments", attachment);
      }

      return request<Rfq>("/rfqs", {
        method: "POST",
        body: formData,
      });
    })(),

  getCustomerDrafts: () => request<CustomerDraft[]>("/customer-drafts"),
  generateCustomerDraft: (body: {
    inquiryId: string;
    quoteId: string;
    marginPercent?: number;
  }) =>
    request<CustomerDraft>("/customer-drafts/generate", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
