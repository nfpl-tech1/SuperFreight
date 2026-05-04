import { buildQueryString } from "@/lib/api/query-builder";
import { request } from "@/lib/api/request";
import type { MscFields } from "@/types/rfq";
import type {
  AppRoleDefinition,
  AuthTokenResponse,
  CustomerDraft,
  FreightQuote,
  Inquiry,
  OutlookStatus,
  QuoteInboxMessage,
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
      `/vendors/location-options${buildQueryString({
        page: query.page,
        pageSize: query.pageSize,
        quoteTypeContext: query.quoteTypeContext,
        shipmentMode: query.shipmentMode,
        locationKind: query.locationKind,
        locationRole: query.locationRole,
        portMode: query.portMode,
        countryName: query.countryName,
        search: query.search,
        typeCodes: query.typeCodes,
      })}`,
    ),
  getVendors: (query: VendorListQuery = {}) =>
    request<VendorCatalogPage>(
      `/vendors${buildQueryString({
        page: query.page,
        pageSize: query.pageSize,
        search: query.search,
        isActive: query.isActive,
        countryName: query.countryName,
        cityName: query.cityName,
        quoteTypeContext: query.quoteTypeContext,
        shipmentMode: query.shipmentMode,
        locationKind: query.locationKind,
        locationId: query.locationId,
        locationCountryName: query.locationCountryName,
        locationRole: query.locationRole,
        locationScope: query.locationScope,
        typeCodes: query.typeCodes,
        isIataCertified: query.isIataCertified,
        doesSeaFreight: query.doesSeaFreight,
        doesProjectCargo: query.doesProjectCargo,
        doesOwnConsolidation: query.doesOwnConsolidation,
        doesOwnTransportation: query.doesOwnTransportation,
        doesOwnWarehousing: query.doesOwnWarehousing,
        doesOwnCustomClearance: query.doesOwnCustomClearance,
      })}`,
    ),
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
      `/vendors/port-master${buildQueryString({
        page: query.page,
        pageSize: query.pageSize,
        search: query.search,
        countryName: query.countryName,
        portMode: query.portMode,
        isActive: query.isActive,
      })}`,
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

  getQuotes: (inquiryId?: string, includeHistory?: boolean) =>
    request<FreightQuote[]>(
      `/quotes${buildQueryString({ inquiryId, includeHistory })}`,
    ),
  getQuotesByRfq: (
    query: { inquiryId?: string; rfqId?: string; includeHistory?: boolean } = {},
  ) =>
    request<FreightQuote[]>(
      `/quotes${buildQueryString({
        inquiryId: query.inquiryId,
        rfqId: query.rfqId,
        includeHistory: query.includeHistory,
      })}`,
    ),
  updateQuote: (
    id: string,
    body: Partial<{
      vendorName: string;
      currency: string;
      totalRate: number;
      freightRate: number;
      localCharges: number;
      documentation: number;
      transitDays: number;
      validUntil: string;
      remarks: string;
      reviewStatus: string;
      extractedFields: Record<string, unknown>;
      comparisonFields: Record<string, unknown>;
    }>,
  ) =>
    request<FreightQuote>(`/quotes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  getQuoteInbox: (query: { inquiryId?: string; rfqId?: string; status?: string } = {}) =>
    request<QuoteInboxMessage[]>(
      `/quote-inbox${buildQueryString({
        inquiryId: query.inquiryId,
        rfqId: query.rfqId,
        status: query.status,
      })}`,
    ),
  triggerQuoteInboxScan: () =>
    request<{ started: boolean; reason?: string }>("/quote-inbox/scan", {
      method: "POST",
    }),
  reprocessQuoteInboxMessage: (id: string) =>
    request<FreightQuote | null>(`/quote-inbox/${id}/reprocess`, {
      method: "POST",
    }),
  ignoreQuoteInboxMessage: (id: string) =>
    request<QuoteInboxMessage>(`/quote-inbox/${id}/ignore`, {
      method: "POST",
    }),
  linkQuoteInboxMessage: (
    id: string,
    body: {
      rfqId: string;
      vendorId: string;
    },
  ) =>
    request<FreightQuote | null>(`/quote-inbox/${id}/link`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
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

  getRfqs: (inquiryId?: string) =>
    request<Rfq[]>(`/rfqs${buildQueryString({ inquiryId })}`),
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
    mscFields?: MscFields;
    customCcEmail?: string;
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
      if (body.mscFields !== undefined) {
        formData.set("mscFields", JSON.stringify(body.mscFields));
      }
      if (body.customCcEmail !== undefined) {
        formData.set("customCcEmail", body.customCcEmail);
      }

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
