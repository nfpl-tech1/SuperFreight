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
exports.InquiriesController = void 0;
const common_1 = require("@nestjs/common");
const audit_decorator_1 = require("../../common/decorators/audit.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const user_entity_1 = require("../users/entities/user.entity");
const create_inquiry_dto_1 = require("./dto/create-inquiry.dto");
const transfer_inquiry_dto_1 = require("./dto/transfer-inquiry.dto");
const update_inquiry_dto_1 = require("./dto/update-inquiry.dto");
const inquiries_service_1 = require("./inquiries.service");
let InquiriesController = class InquiriesController {
    inquiriesService;
    constructor(inquiriesService) {
        this.inquiriesService = inquiriesService;
    }
    list(user) {
        return this.inquiriesService.list(user);
    }
    create(dto, user) {
        return this.inquiriesService.create(dto, user);
    }
    update(id, dto, user) {
        return this.inquiriesService.update(id, dto, user);
    }
    remove(id, user) {
        return this.inquiriesService.remove(id, user);
    }
    transfer(id, dto, user) {
        return this.inquiriesService.transfer(id, dto, user);
    }
};
exports.InquiriesController = InquiriesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], InquiriesController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, audit_decorator_1.Audit)('INQUIRY_CREATED', 'inquiry'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_inquiry_dto_1.CreateInquiryDto, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], InquiriesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, audit_decorator_1.Audit)('INQUIRY_UPDATED', 'inquiry'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_inquiry_dto_1.UpdateInquiryDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], InquiriesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, audit_decorator_1.Audit)('INQUIRY_DELETED', 'inquiry'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], InquiriesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/transfer'),
    (0, audit_decorator_1.Audit)('INQUIRY_TRANSFERRED', 'inquiry'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, transfer_inquiry_dto_1.TransferInquiryDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], InquiriesController.prototype, "transfer", null);
exports.InquiriesController = InquiriesController = __decorate([
    (0, common_1.Controller)('inquiries'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [inquiries_service_1.InquiriesService])
], InquiriesController);
//# sourceMappingURL=inquiries.controller.js.map