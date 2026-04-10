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
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const user_entity_1 = require("../users/entities/user.entity");
const create_freight_quote_dto_1 = require("./dto/create-freight-quote.dto");
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
    listQuotes(inquiryId) {
        return this.shipmentsService.listQuotes(inquiryId);
    }
    createQuote(dto) {
        return this.shipmentsService.createQuote(dto);
    }
};
exports.ShipmentsController = ShipmentsController;
__decorate([
    (0, common_1.Get)('rate-sheets'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "listRateSheets", null);
__decorate([
    (0, common_1.Post)('rate-sheets'),
    (0, roles_decorator_1.Roles)(user_entity_1.Role.ADMIN),
    (0, audit_decorator_1.Audit)('RATE_SHEET_CREATED', 'rate_sheet'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [upsert_rate_sheet_dto_1.UpsertRateSheetDto]),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "createRateSheet", null);
__decorate([
    (0, common_1.Get)('quotes'),
    __param(0, (0, common_1.Query)('inquiryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "listQuotes", null);
__decorate([
    (0, common_1.Post)('quotes'),
    (0, audit_decorator_1.Audit)('QUOTE_CREATED', 'quote'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_freight_quote_dto_1.CreateFreightQuoteDto]),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "createQuote", null);
exports.ShipmentsController = ShipmentsController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [shipments_service_1.ShipmentsService])
], ShipmentsController);
//# sourceMappingURL=shipments.controller.js.map