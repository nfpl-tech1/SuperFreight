"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerQuotesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const audit_module_1 = require("../audit/audit.module");
const inquiry_entity_1 = require("../inquiries/entities/inquiry.entity");
const freight_quote_entity_1 = require("../shipments/entities/freight-quote.entity");
const customer_quotes_controller_1 = require("./customer-quotes.controller");
const customer_quotes_service_1 = require("./customer-quotes.service");
const customer_draft_entity_1 = require("./entities/customer-draft.entity");
let CustomerQuotesModule = class CustomerQuotesModule {
};
exports.CustomerQuotesModule = CustomerQuotesModule;
exports.CustomerQuotesModule = CustomerQuotesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([customer_draft_entity_1.CustomerDraft, freight_quote_entity_1.FreightQuote]),
            typeorm_1.TypeOrmModule.forFeature([inquiry_entity_1.Inquiry], 'business'),
            audit_module_1.AuditModule,
        ],
        controllers: [customer_quotes_controller_1.CustomerQuotesController],
        providers: [customer_quotes_service_1.CustomerQuotesService],
    })
], CustomerQuotesModule);
//# sourceMappingURL=customer-quotes.module.js.map