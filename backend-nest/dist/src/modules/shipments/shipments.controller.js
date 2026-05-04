"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipmentsController = void 0;
const common_1 = require("@nestjs/common");
const audit_decorator_1 = require("../../common/decorators/audit.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const module_access_decorator_1 = require("../../common/decorators/module-access.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const user_entity_1 = require("../users/entities/user.entity");
const create_freight_quote_dto_1 = require("./dto/create-freight-quote.dto");
const link_quote_inbox_message_dto_1 = require("./dto/link-quote-inbox-message.dto");
const list_quote_inbox_dto_1 = require("./dto/list-quote-inbox.dto");
const list_quotes_dto_1 = require("./dto/list-quotes.dto");
const update_freight_quote_dto_1 = require("./dto/update-freight-quote.dto");
const upsert_rate_sheet_dto_1 = require("./dto/upsert-rate-sheet.dto");
const shipments_service_1 = require("./shipments.service");
let ShipmentsController = class ShipmentsController {
    shipmentsService;
    constructor(shipmentsService) {
        this.shipmentsService = shipmentsService;
    }
    listRateSheets() {
        return this.shipmentsService.listRateSheets();
    }
    createRateSheet(dto) {
        return this.shipmentsService.createRateSheet(dto);
    }
    listQuotes(query) {
        return this.shipmentsService.listQuotes(query);
    }
    listQuoteInbox(query) {
        return this.shipmentsService.listQuoteInbox(query);
    }
    triggerQuoteInboxScan() {
        return this.shipmentsService.triggerQuoteInboxScan();
    }
    reprocessQuoteInboxMessage(id) {
        return this.shipmentsService.reprocessQuoteInboxMessage(id);
    }
    ignoreQuoteInboxMessage(id) {
        return this.shipmentsService.ignoreQuoteInboxMessage(id);
    }
    linkQuoteInboxMessage(id, dto) {
        return this.shipmentsService.linkQuoteInboxMessage(id, dto);
    }
    createQuote(dto) {
        return this.shipmentsService.createQuote(dto);
    }
    updateQuote(id, dto, user) {
        return this.shipmentsService.updateQuote(id, dto, user);
    }
};
exports.ShipmentsController = ShipmentsController;
__decorate([
    (0, common_1.Get)('rate-sheets'),
    (0, module_access_decorator_1.ModuleAccess)('rate-sheets', 'view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "listRateSheets", null);
__decorate([
    (0, common_1.Post)('rate-sheets'),
    (0, module_access_decorator_1.ModuleAccess)('rate-sheets', 'edit'),
    (0, audit_decorator_1.Audit)('RATE_SHEET_CREATED', 'rate_sheet'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [upsert_rate_sheet_dto_1.UpsertRateSheetDto]),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "createRateSheet", null);
__decorate([
    (0, common_1.Get)('quotes'),
    (0, module_access_decorator_1.AnyModuleAccess)([
        { moduleKey: 'comparison', action: 'view' },
        { moduleKey: 'customer-quote', action: 'view' },
    ]),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_quotes_dto_1.ListQuotesDto]),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "listQuotes", null);
__decorate([
    (0, common_1.Get)('quote-inbox'),
    (0, module_access_decorator_1.ModuleAccess)('comparison', 'view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_quote_inbox_dto_1.ListQuoteInboxDto]),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "listQuoteInbox", null);
__decorate([
    (0, common_1.Post)('quote-inbox/scan'),
    (0, module_access_decorator_1.ModuleAccess)('comparison', 'edit'),
    (0, audit_decorator_1.Audit)('QUOTE_INBOX_SCAN_TRIGGERED', 'quote_inbox'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "triggerQuoteInboxScan", null);
__decorate([
    (0, common_1.Post)('quote-inbox/:id/reprocess'),
    (0, module_access_decorator_1.ModuleAccess)('comparison', 'edit'),
    (0, audit_decorator_1.Audit)('QUOTE_INBOX_REPROCESSED', 'quote_inbox'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "reprocessQuoteInboxMessage", null);
__decorate([
    (0, common_1.Post)('quote-inbox/:id/ignore'),
    (0, module_access_decorator_1.ModuleAccess)('comparison', 'edit'),
    (0, audit_decorator_1.Audit)('QUOTE_INBOX_IGNORED', 'quote_inbox'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "ignoreQuoteInboxMessage", null);
__decorate([
    (0, common_1.Post)('quote-inbox/:id/link'),
    (0, module_access_decorator_1.ModuleAccess)('comparison', 'edit'),
    (0, audit_decorator_1.Audit)('QUOTE_INBOX_LINKED', 'quote_inbox'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, link_quote_inbox_message_dto_1.LinkQuoteInboxMessageDto]),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "linkQuoteInboxMessage", null);
__decorate([
    (0, common_1.Post)('quotes'),
    (0, module_access_decorator_1.ModuleAccess)('comparison', 'edit'),
    (0, audit_decorator_1.Audit)('QUOTE_CREATED', 'quote'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_freight_quote_dto_1.CreateFreightQuoteDto]),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "createQuote", null);
__decorate([
    (0, common_1.Patch)('quotes/:id'),
    (0, module_access_decorator_1.ModuleAccess)('comparison', 'edit'),
    (0, audit_decorator_1.Audit)('QUOTE_UPDATED', 'quote'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_freight_quote_dto_1.UpdateFreightQuoteDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "updateQuote", null);
exports.ShipmentsController = ShipmentsController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [shipments_service_1.ShipmentsService])
], ShipmentsController);
//# sourceMappingURL=shipments.controller.js.map