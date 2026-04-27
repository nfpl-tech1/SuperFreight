import { AuditLog } from '../modules/audit/entities/audit-log.entity';
import { ConsumedSsoToken } from '../modules/auth/entities/consumed-sso-token.entity';
import { CustomerDraft } from '../modules/customer-quotes/entities/customer-draft.entity';
import { ExternalThreadRef } from '../modules/inquiries/entities/external-thread-ref.entity';
import { Inquiry } from '../modules/inquiries/entities/inquiry.entity';
import { Job } from '../modules/inquiries/entities/job.entity';
import { JobServicePart } from '../modules/inquiries/entities/job-service-part.entity';
import { OwnershipAssignment } from '../modules/inquiries/entities/ownership-assignment.entity';
import { OutlookConnection } from '../modules/outlook/entities/outlook-connection.entity';
import { OutlookSubscription } from '../modules/outlook/entities/outlook-subscription.entity';
import { RateSheet } from '../modules/shipments/entities/rate-sheet.entity';
import { FreightQuote } from '../modules/shipments/entities/freight-quote.entity';
import { QuoteIgnoreRule } from '../modules/shipments/entities/quote-ignore-rule.entity';
import { QuoteInboundMessage } from '../modules/shipments/entities/quote-inbound-message.entity';
import { QuoteMailboxScanState } from '../modules/shipments/entities/quote-mailbox-scan-state.entity';
import { Rfq } from '../modules/rfqs/entities/rfq.entity';
import { RfqFieldSpec } from '../modules/rfqs/entities/rfq-field-spec.entity';
import { AppRole } from '../modules/users/entities/app-role.entity';
import { RolePermission } from '../modules/users/entities/role-permission.entity';
import { RoleScopeRule } from '../modules/users/entities/role-scope-rule.entity';
import { User } from '../modules/users/entities/user.entity';
import { UserDepartment } from '../modules/users/entities/user-department.entity';
import { UserRoleAssignment } from '../modules/users/entities/user-role-assignment.entity';
import { CountryRegionMap } from '../modules/vendors/entities/country-region-map.entity';
import { ImportSourceAudit } from '../modules/vendors/entities/import-source-audit.entity';
import { PortMaster } from '../modules/vendors/entities/port-master.entity';
import { PortAlias } from '../modules/vendors/entities/port-alias.entity';
import { RegionMaster } from '../modules/vendors/entities/region-master.entity';
import { ServiceLocationAlias } from '../modules/vendors/entities/service-location-alias.entity';
import { ServiceLocationMaster } from '../modules/vendors/entities/service-location-master.entity';
import { VendorCcRecipient } from '../modules/vendors/entities/vendor-cc-recipient.entity';
import { VendorContact } from '../modules/vendors/entities/vendor-contact.entity';
import { VendorMaster } from '../modules/vendors/entities/vendor-master.entity';
import { VendorOfficePort } from '../modules/vendors/entities/vendor-office-port.entity';
import { VendorOfficeServiceLocation } from '../modules/vendors/entities/vendor-office-service-location.entity';
import { VendorOfficeTypeMap } from '../modules/vendors/entities/vendor-office-type-map.entity';
import { VendorOffice } from '../modules/vendors/entities/vendor-office.entity';
import { VendorTypeMaster } from '../modules/vendors/entities/vendor-type-master.entity';

export const APP_DB_ENTITIES = [
  AuditLog,
  ConsumedSsoToken,
  CustomerDraft,
  FreightQuote,
  OutlookConnection,
  OutlookSubscription,
  QuoteIgnoreRule,
  QuoteInboundMessage,
  QuoteMailboxScanState,
  Rfq,
  RfqFieldSpec,
  AppRole,
  RolePermission,
  RoleScopeRule,
  User,
  UserDepartment,
  UserRoleAssignment,
];

export const BUSINESS_DB_ENTITIES = [
  CountryRegionMap,
  ExternalThreadRef,
  ImportSourceAudit,
  Inquiry,
  Job,
  JobServicePart,
  OwnershipAssignment,
  PortMaster,
  PortAlias,
  RateSheet,
  RegionMaster,
  ServiceLocationAlias,
  ServiceLocationMaster,
  VendorCcRecipient,
  VendorContact,
  VendorMaster,
  VendorOffice,
  VendorOfficePort,
  VendorOfficeServiceLocation,
  VendorOfficeTypeMap,
  VendorTypeMaster,
];
