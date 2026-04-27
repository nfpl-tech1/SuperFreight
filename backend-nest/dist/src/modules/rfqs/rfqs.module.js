"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RfqsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const audit_module_1 = require("../audit/audit.module");
const external_thread_ref_entity_1 = require("../inquiries/entities/external-thread-ref.entity");
const inquiry_entity_1 = require("../inquiries/entities/inquiry.entity");
const outlook_module_1 = require("../outlook/outlook.module");
const vendor_cc_recipient_entity_1 = require("../vendors/entities/vendor-cc-recipient.entity");
const vendor_contact_entity_1 = require("../vendors/entities/vendor-contact.entity");
const vendor_master_entity_1 = require("../vendors/entities/vendor-master.entity");
const vendor_office_entity_1 = require("../vendors/entities/vendor-office.entity");
const rfq_field_spec_entity_1 = require("./entities/rfq-field-spec.entity");
const rfq_entity_1 = require("./entities/rfq.entity");
const rfqs_controller_1 = require("./rfqs.controller");
const rfqs_service_1 = require("./rfqs.service");
let RfqsModule = class RfqsModule {
};
exports.RfqsModule = RfqsModule;
exports.RfqsModule = RfqsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([rfq_entity_1.Rfq, rfq_field_spec_entity_1.RfqFieldSpec]),
            typeorm_1.TypeOrmModule.forFeature([
                external_thread_ref_entity_1.ExternalThreadRef,
                inquiry_entity_1.Inquiry,
                vendor_master_entity_1.VendorMaster,
                vendor_office_entity_1.VendorOffice,
                vendor_contact_entity_1.VendorContact,
                vendor_cc_recipient_entity_1.VendorCcRecipient,
            ], 'business'),
            audit_module_1.AuditModule,
            outlook_module_1.OutlookModule,
        ],
        controllers: [rfqs_controller_1.RfqsController],
        providers: [rfqs_service_1.RfqsService],
        exports: [rfqs_service_1.RfqsService],
    })
], RfqsModule);
//# sourceMappingURL=rfqs.module.js.map