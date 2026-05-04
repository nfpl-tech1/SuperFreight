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
exports.OutlookController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const module_access_decorator_1 = require("../../common/decorators/module-access.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const user_entity_1 = require("../users/entities/user.entity");
const complete_outlook_connect_dto_1 = require("./dto/complete-outlook-connect.dto");
const outlook_service_1 = require("./outlook.service");
let OutlookController = class OutlookController {
    outlookService;
    constructor(outlookService) {
        this.outlookService = outlookService;
    }
    getStatus(user) {
        return this.outlookService.getStatus(user);
    }
    getConnectUrl(user) {
        return this.outlookService.getConnectUrl(user);
    }
    complete(dto, user) {
        return this.outlookService.completeConnection(user, dto.code);
    }
    reconnect(user) {
        return this.outlookService.reconnect(user);
    }
};
exports.OutlookController = OutlookController;
__decorate([
    (0, common_1.Get)('status'),
    (0, module_access_decorator_1.ModuleAccess)('profile', 'view'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], OutlookController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)('connect-url'),
    (0, module_access_decorator_1.ModuleAccess)('profile', 'edit'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], OutlookController.prototype, "getConnectUrl", null);
__decorate([
    (0, common_1.Post)('complete'),
    (0, module_access_decorator_1.ModuleAccess)('profile', 'edit'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [complete_outlook_connect_dto_1.CompleteOutlookConnectDto, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], OutlookController.prototype, "complete", null);
__decorate([
    (0, common_1.Post)('reconnect'),
    (0, module_access_decorator_1.ModuleAccess)('profile', 'edit'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], OutlookController.prototype, "reconnect", null);
exports.OutlookController = OutlookController = __decorate([
    (0, common_1.Controller)('outlook'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [outlook_service_1.OutlookService])
], OutlookController);
//# sourceMappingURL=outlook.controller.js.map