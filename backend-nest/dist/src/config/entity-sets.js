"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUSINESS_DB_ENTITIES = exports.APP_DB_ENTITIES = void 0;
const audit_log_entity_1 = require("../modules/audit/entities/audit-log.entity");
const consumed_sso_token_entity_1 = require("../modules/auth/entities/consumed-sso-token.entity");
const customer_draft_entity_1 = require("../modules/customer-quotes/entities/customer-draft.entity");
const external_thread_ref_entity_1 = require("../modules/inquiries/entities/external-thread-ref.entity");
const inquiry_entity_1 = require("../modules/inquiries/entities/inquiry.entity");
const job_entity_1 = require("../modules/inquiries/entities/job.entity");
const job_service_part_entity_1 = require("../modules/inquiries/entities/job-service-part.entity");
const ownership_assignment_entity_1 = require("../modules/inquiries/entities/ownership-assignment.entity");
const outlook_connection_entity_1 = require("../modules/outlook/entities/outlook-connection.entity");
const outlook_subscription_entity_1 = require("../modules/outlook/entities/outlook-subscription.entity");
const rate_sheet_entity_1 = require("../modules/shipments/entities/rate-sheet.entity");
const freight_quote_entity_1 = require("../modules/shipments/entities/freight-quote.entity");
const quote_ignore_rule_entity_1 = require("../modules/shipments/entities/quote-ignore-rule.entity");
const quote_inbound_message_entity_1 = require("../modules/shipments/entities/quote-inbound-message.entity");
const quote_mailbox_scan_state_entity_1 = require("../modules/shipments/entities/quote-mailbox-scan-state.entity");
const rfq_entity_1 = require("../modules/rfqs/entities/rfq.entity");
const rfq_field_spec_entity_1 = require("../modules/rfqs/entities/rfq-field-spec.entity");
const app_role_entity_1 = require("../modules/users/entities/app-role.entity");
const role_permission_entity_1 = require("../modules/users/entities/role-permission.entity");
const role_scope_rule_entity_1 = require("../modules/users/entities/role-scope-rule.entity");
const user_entity_1 = require("../modules/users/entities/user.entity");
const user_department_entity_1 = require("../modules/users/entities/user-department.entity");
const user_role_assignment_entity_1 = require("../modules/users/entities/user-role-assignment.entity");
const country_region_map_entity_1 = require("../modules/vendors/entities/country-region-map.entity");
const import_source_audit_entity_1 = require("../modules/vendors/entities/import-source-audit.entity");
const port_master_entity_1 = require("../modules/vendors/entities/port-master.entity");
const port_alias_entity_1 = require("../modules/vendors/entities/port-alias.entity");
const region_master_entity_1 = require("../modules/vendors/entities/region-master.entity");
const service_location_alias_entity_1 = require("../modules/vendors/entities/service-location-alias.entity");
const service_location_master_entity_1 = require("../modules/vendors/entities/service-location-master.entity");
const vendor_cc_recipient_entity_1 = require("../modules/vendors/entities/vendor-cc-recipient.entity");
const vendor_contact_entity_1 = require("../modules/vendors/entities/vendor-contact.entity");
const vendor_master_entity_1 = require("../modules/vendors/entities/vendor-master.entity");
const vendor_office_port_entity_1 = require("../modules/vendors/entities/vendor-office-port.entity");
const vendor_office_service_location_entity_1 = require("../modules/vendors/entities/vendor-office-service-location.entity");
const vendor_office_type_map_entity_1 = require("../modules/vendors/entities/vendor-office-type-map.entity");
const vendor_office_entity_1 = require("../modules/vendors/entities/vendor-office.entity");
const vendor_type_master_entity_1 = require("../modules/vendors/entities/vendor-type-master.entity");
exports.APP_DB_ENTITIES = [
    audit_log_entity_1.AuditLog,
    consumed_sso_token_entity_1.ConsumedSsoToken,
    customer_draft_entity_1.CustomerDraft,
    freight_quote_entity_1.FreightQuote,
    outlook_connection_entity_1.OutlookConnection,
    outlook_subscription_entity_1.OutlookSubscription,
    quote_ignore_rule_entity_1.QuoteIgnoreRule,
    quote_inbound_message_entity_1.QuoteInboundMessage,
    quote_mailbox_scan_state_entity_1.QuoteMailboxScanState,
    rfq_entity_1.Rfq,
    rfq_field_spec_entity_1.RfqFieldSpec,
    app_role_entity_1.AppRole,
    role_permission_entity_1.RolePermission,
    role_scope_rule_entity_1.RoleScopeRule,
    user_entity_1.User,
    user_department_entity_1.UserDepartment,
    user_role_assignment_entity_1.UserRoleAssignment,
];
exports.BUSINESS_DB_ENTITIES = [
    country_region_map_entity_1.CountryRegionMap,
    external_thread_ref_entity_1.ExternalThreadRef,
    import_source_audit_entity_1.ImportSourceAudit,
    inquiry_entity_1.Inquiry,
    job_entity_1.Job,
    job_service_part_entity_1.JobServicePart,
    ownership_assignment_entity_1.OwnershipAssignment,
    port_master_entity_1.PortMaster,
    port_alias_entity_1.PortAlias,
    rate_sheet_entity_1.RateSheet,
    region_master_entity_1.RegionMaster,
    service_location_alias_entity_1.ServiceLocationAlias,
    service_location_master_entity_1.ServiceLocationMaster,
    vendor_cc_recipient_entity_1.VendorCcRecipient,
    vendor_contact_entity_1.VendorContact,
    vendor_master_entity_1.VendorMaster,
    vendor_office_entity_1.VendorOffice,
    vendor_office_port_entity_1.VendorOfficePort,
    vendor_office_service_location_entity_1.VendorOfficeServiceLocation,
    vendor_office_type_map_entity_1.VendorOfficeTypeMap,
    vendor_type_master_entity_1.VendorTypeMaster,
];
//# sourceMappingURL=entity-sets.js.map