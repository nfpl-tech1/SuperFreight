"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipmentsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const audit_module_1 = require("../audit/audit.module");
const inquiry_entity_1 = require("../inquiries/entities/inquiry.entity");
const outlook_module_1 = require("../outlook/outlook.module");
const outlook_connection_entity_1 = require("../outlook/entities/outlook-connection.entity");
const rfq_entity_1 = require("../rfqs/entities/rfq.entity");
const rfq_field_spec_entity_1 = require("../rfqs/entities/rfq-field-spec.entity");
const vendor_cc_recipient_entity_1 = require("../vendors/entities/vendor-cc-recipient.entity");
const vendor_contact_entity_1 = require("../vendors/entities/vendor-contact.entity");
const vendor_master_entity_1 = require("../vendors/entities/vendor-master.entity");
const vendor_office_entity_1 = require("../vendors/entities/vendor-office.entity");
const freight_quote_entity_1 = require("./entities/freight-quote.entity");
const quote_ignore_rule_entity_1 = require("./entities/quote-ignore-rule.entity");
const quote_inbound_message_entity_1 = require("./entities/quote-inbound-message.entity");
const quote_mailbox_scan_state_entity_1 = require("./entities/quote-mailbox-scan-state.entity");
const rate_sheet_entity_1 = require("./entities/rate-sheet.entity");
const shipments_controller_1 = require("./shipments.controller");
const quote_extraction_service_1 = require("./services/quote-extraction.service");
const quote_ignore_service_1 = require("./services/quote-ignore.service");
const quote_intake_service_1 = require("./services/quote-intake.service");
const quote_matching_service_1 = require("./services/quote-matching.service");
const shipments_service_1 = require("./shipments.service");
let ShipmentsModule = class ShipmentsModule {
};
exports.ShipmentsModule = ShipmentsModule;
exports.ShipmentsModule = ShipmentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                freight_quote_entity_1.FreightQuote,
                outlook_connection_entity_1.OutlookConnection,
                quote_ignore_rule_entity_1.QuoteIgnoreRule,
                quote_inbound_message_entity_1.QuoteInboundMessage,
                quote_mailbox_scan_state_entity_1.QuoteMailboxScanState,
                rfq_entity_1.Rfq,
                rfq_field_spec_entity_1.RfqFieldSpec,
            ]),
            typeorm_1.TypeOrmModule.forFeature([inquiry_entity_1.Inquiry, vendor_cc_recipient_entity_1.VendorCcRecipient, vendor_contact_entity_1.VendorContact, vendor_master_entity_1.VendorMaster, vendor_office_entity_1.VendorOffice], 'business'),
            typeorm_1.TypeOrmModule.forFeature([rate_sheet_entity_1.RateSheet], 'business'),
            audit_module_1.AuditModule,
            outlook_module_1.OutlookModule,
        ],
        controllers: [shipments_controller_1.ShipmentsController],
        providers: [
            shipments_service_1.ShipmentsService,
            quote_extraction_service_1.QuoteExtractionService,
            quote_ignore_service_1.QuoteIgnoreService,
            quote_intake_service_1.QuoteIntakeService,
            quote_matching_service_1.QuoteMatchingService,
        ],
        exports: [shipments_service_1.ShipmentsService],
    })
], ShipmentsModule);
//# sourceMappingURL=shipments.module.js.map