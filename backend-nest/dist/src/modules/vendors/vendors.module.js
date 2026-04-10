"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const country_region_map_entity_1 = require("./entities/country-region-map.entity");
const import_source_audit_entity_1 = require("./entities/import-source-audit.entity");
const port_master_entity_1 = require("./entities/port-master.entity");
const port_alias_entity_1 = require("./entities/port-alias.entity");
const region_master_entity_1 = require("./entities/region-master.entity");
const service_location_alias_entity_1 = require("./entities/service-location-alias.entity");
const service_location_master_entity_1 = require("./entities/service-location-master.entity");
const vendor_cc_recipient_entity_1 = require("./entities/vendor-cc-recipient.entity");
const vendor_contact_entity_1 = require("./entities/vendor-contact.entity");
const vendor_master_entity_1 = require("./entities/vendor-master.entity");
const vendor_office_port_entity_1 = require("./entities/vendor-office-port.entity");
const vendor_office_service_location_entity_1 = require("./entities/vendor-office-service-location.entity");
const vendor_office_type_map_entity_1 = require("./entities/vendor-office-type-map.entity");
const vendor_office_entity_1 = require("./entities/vendor-office.entity");
const vendor_type_master_entity_1 = require("./entities/vendor-type-master.entity");
const vendors_controller_1 = require("./vendors.controller");
const vendors_service_1 = require("./vendors.service");
let VendorsModule = class VendorsModule {
};
exports.VendorsModule = VendorsModule;
exports.VendorsModule = VendorsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                country_region_map_entity_1.CountryRegionMap,
                import_source_audit_entity_1.ImportSourceAudit,
                port_master_entity_1.PortMaster,
                port_alias_entity_1.PortAlias,
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
            ], 'business'),
        ],
        controllers: [vendors_controller_1.VendorsController],
        providers: [vendors_service_1.VendorsService],
        exports: [vendors_service_1.VendorsService],
    })
], VendorsModule);
//# sourceMappingURL=vendors.module.js.map