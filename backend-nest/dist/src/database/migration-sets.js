"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUSINESS_DB_MIGRATIONS = exports.APP_DB_MIGRATIONS = void 0;
const _2026032100000_AppInitialSchema_1 = require("./migrations/app/2026032100000-AppInitialSchema");
const _2026032100100_AppSchemaHardening_1 = require("./migrations/app/2026032100100-AppSchemaHardening");
const _2026040901400_AppUserEmailSignature_1 = require("./migrations/app/2026040901400-AppUserEmailSignature");
const _2026041810000_AppQuoteInboxFoundation_1 = require("./migrations/app/2026041810000-AppQuoteInboxFoundation");
const _2026032100200_BusinessInitialSchema_1 = require("./migrations/business/2026032100200-BusinessInitialSchema");
const _2026032100300_BusinessSchemaHardening_1 = require("./migrations/business/2026032100300-BusinessSchemaHardening");
const _2026032400400_BusinessVendorMasterPhase1_1 = require("./migrations/business/2026032400400-BusinessVendorMasterPhase1");
const _2026032400500_BusinessTradeLaneAndModeRefresh_1 = require("./migrations/business/2026032400500-BusinessTradeLaneAndModeRefresh");
const _2026032500600_BusinessInquiryIncoterm_1 = require("./migrations/business/2026032500600-BusinessInquiryIncoterm");
const _2026032500700_BusinessInquiryCustomerRole_1 = require("./migrations/business/2026032500700-BusinessInquiryCustomerRole");
const _2026032700800_BusinessVendorLocationSourcing_1 = require("./migrations/business/2026032700800-BusinessVendorLocationSourcing");
const _2026032700900_BusinessDropVendorSchema_1 = require("./migrations/business/2026032700900-BusinessDropVendorSchema");
const _2026032701000_BusinessMinimalPortMaster_1 = require("./migrations/business/2026032701000-BusinessMinimalPortMaster");
const _2026032701100_BusinessDemoVendorAndInquirySeed_1 = require("./migrations/business/2026032701100-BusinessDemoVendorAndInquirySeed");
const _2026032701200_BusinessPortMasterDemoAdditions_1 = require("./migrations/business/2026032701200-BusinessPortMasterDemoAdditions");
const _2026032801300_BusinessComprehensivePortMaster_1 = require("./migrations/business/2026032801300-BusinessComprehensivePortMaster");
const _2026041009000_BusinessSyntheticLocationReconciliation_1 = require("./migrations/business/2026041009000-BusinessSyntheticLocationReconciliation");
exports.APP_DB_MIGRATIONS = [
    _2026032100000_AppInitialSchema_1.AppInitialSchema2026032100000,
    _2026032100100_AppSchemaHardening_1.AppSchemaHardening2026032100100,
    _2026040901400_AppUserEmailSignature_1.AppUserEmailSignature2026040901400,
    _2026041810000_AppQuoteInboxFoundation_1.AppQuoteInboxFoundation2026041810000,
];
exports.BUSINESS_DB_MIGRATIONS = [
    _2026032100200_BusinessInitialSchema_1.BusinessInitialSchema2026032100200,
    _2026032100300_BusinessSchemaHardening_1.BusinessSchemaHardening2026032100300,
    _2026032400400_BusinessVendorMasterPhase1_1.BusinessVendorMasterPhase12026032400400,
    _2026032400500_BusinessTradeLaneAndModeRefresh_1.BusinessTradeLaneAndModeRefresh2026032400500,
    _2026032500600_BusinessInquiryIncoterm_1.BusinessInquiryIncoterm2026032500600,
    _2026032500700_BusinessInquiryCustomerRole_1.BusinessInquiryCustomerRole2026032500700,
    _2026032700800_BusinessVendorLocationSourcing_1.BusinessVendorLocationSourcing2026032700800,
    _2026032700900_BusinessDropVendorSchema_1.BusinessDropVendorSchema2026032700900,
    _2026032701000_BusinessMinimalPortMaster_1.BusinessMinimalPortMaster2026032701000,
    _2026032701100_BusinessDemoVendorAndInquirySeed_1.BusinessDemoVendorAndInquirySeed2026032701100,
    _2026032701200_BusinessPortMasterDemoAdditions_1.BusinessPortMasterDemoAdditions2026032701200,
    _2026032801300_BusinessComprehensivePortMaster_1.BusinessComprehensivePortMaster2026032801300,
    _2026041009000_BusinessSyntheticLocationReconciliation_1.BusinessSyntheticLocationReconciliation2026041009000,
];
//# sourceMappingURL=migration-sets.js.map