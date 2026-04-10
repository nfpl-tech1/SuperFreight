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
exports.CustomerQuotesController = void 0;
const common_1 = require("@nestjs/common");
const audit_decorator_1 = require("../../common/decorators/audit.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const user_entity_1 = require("../users/entities/user.entity");
const customer_quotes_service_1 = require("./customer-quotes.service");
const generate_customer_draft_dto_1 = require("./dto/generate-customer-draft.dto");
let CustomerQuotesController = class CustomerQuotesController {
    customerQuotesService;
    constructor(customerQuotesService) {
        this.customerQuotesService = customerQuotesService;
    }
    list() {
        return this.customerQuotesService.list();
    }
    generate(dto, user) {
        return this.customerQuotesService.generate(dto, user);
    }
};
exports.CustomerQuotesController = CustomerQuotesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CustomerQuotesController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('generate'),
    (0, audit_decorator_1.Audit)('CUSTOMER_DRAFT_GENERATED', 'customer_draft'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_customer_draft_dto_1.GenerateCustomerDraftDto, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], CustomerQuotesController.prototype, "generate", null);
exports.CustomerQuotesController = CustomerQuotesController = __decorate([
    (0, common_1.Controller)('customer-drafts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [customer_quotes_service_1.CustomerQuotesService])
], CustomerQuotesController);
//# sourceMappingURL=customer-quotes.controller.js.map