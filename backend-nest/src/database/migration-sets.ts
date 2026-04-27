import { AppInitialSchema2026032100000 } from './migrations/app/2026032100000-AppInitialSchema';
import { AppSchemaHardening2026032100100 } from './migrations/app/2026032100100-AppSchemaHardening';
import { AppUserEmailSignature2026040901400 } from './migrations/app/2026040901400-AppUserEmailSignature';
import { AppQuoteInboxFoundation2026041810000 } from './migrations/app/2026041810000-AppQuoteInboxFoundation';
import { BusinessInitialSchema2026032100200 } from './migrations/business/2026032100200-BusinessInitialSchema';
import { BusinessSchemaHardening2026032100300 } from './migrations/business/2026032100300-BusinessSchemaHardening';
import { BusinessVendorMasterPhase12026032400400 } from './migrations/business/2026032400400-BusinessVendorMasterPhase1';
import { BusinessTradeLaneAndModeRefresh2026032400500 } from './migrations/business/2026032400500-BusinessTradeLaneAndModeRefresh';
import { BusinessInquiryIncoterm2026032500600 } from './migrations/business/2026032500600-BusinessInquiryIncoterm';
import { BusinessInquiryCustomerRole2026032500700 } from './migrations/business/2026032500700-BusinessInquiryCustomerRole';
import { BusinessVendorLocationSourcing2026032700800 } from './migrations/business/2026032700800-BusinessVendorLocationSourcing';
import { BusinessDropVendorSchema2026032700900 } from './migrations/business/2026032700900-BusinessDropVendorSchema';
import { BusinessMinimalPortMaster2026032701000 } from './migrations/business/2026032701000-BusinessMinimalPortMaster';
import { BusinessDemoVendorAndInquirySeed2026032701100 } from './migrations/business/2026032701100-BusinessDemoVendorAndInquirySeed';
import { BusinessPortMasterDemoAdditions2026032701200 } from './migrations/business/2026032701200-BusinessPortMasterDemoAdditions';
import { BusinessComprehensivePortMaster2026032801300 } from './migrations/business/2026032801300-BusinessComprehensivePortMaster';
import { BusinessSyntheticLocationReconciliation2026041009000 } from './migrations/business/2026041009000-BusinessSyntheticLocationReconciliation';

export const APP_DB_MIGRATIONS = [
  AppInitialSchema2026032100000,
  AppSchemaHardening2026032100100,
  AppUserEmailSignature2026040901400,
  AppQuoteInboxFoundation2026041810000,
];

export const BUSINESS_DB_MIGRATIONS = [
  BusinessInitialSchema2026032100200,
  BusinessSchemaHardening2026032100300,
  BusinessVendorMasterPhase12026032400400,
  BusinessTradeLaneAndModeRefresh2026032400500,
  BusinessInquiryIncoterm2026032500600,
  BusinessInquiryCustomerRole2026032500700,
  BusinessVendorLocationSourcing2026032700800,
  BusinessDropVendorSchema2026032700900,
  BusinessMinimalPortMaster2026032701000,
  BusinessDemoVendorAndInquirySeed2026032701100,
  BusinessPortMasterDemoAdditions2026032701200,
  BusinessComprehensivePortMaster2026032801300,
  BusinessSyntheticLocationReconciliation2026041009000,
];
