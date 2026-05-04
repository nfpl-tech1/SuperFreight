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
exports.RfqsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const audit_decorator_1 = require("../../common/decorators/audit.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const module_access_decorator_1 = require("../../common/decorators/module-access.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const user_entity_1 = require("../users/entities/user.entity");
const create_rfq_dto_1 = require("./dto/create-rfq.dto");
const rfqs_service_1 = require("./rfqs.service");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const CREATE_RFQ_DTO_VALIDATION_OPTIONS = {
    whitelist: true,
    forbidNonWhitelisted: true,
};
function parseJsonField(value, fieldName) {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }
    if (typeof value !== 'string') {
        return value;
    }
    try {
        return JSON.parse(value);
    }
    catch {
        throw new common_1.BadRequestException(`${fieldName} must be valid JSON.`);
    }
}
function parseBooleanField(value) {
    if (typeof value === 'boolean') {
        return value;
    }
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (normalized === 'true') {
            return true;
        }
        if (normalized === 'false') {
            return false;
        }
    }
    return undefined;
}
function parseOptionalStringField(value) {
    if (typeof value !== 'string') {
        return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}
function buildCreateRfqDtoPayload(rawBody) {
    return {
        inquiryId: rawBody.inquiryId,
        inquiryNumber: rawBody.inquiryNumber,
        departmentId: rawBody.departmentId,
        formValues: parseJsonField(rawBody.formValues, 'formValues') ?? {},
        vendorIds: parseJsonField(rawBody.vendorIds, 'vendorIds') ?? [],
        officeSelections: parseJsonField(rawBody.officeSelections, 'officeSelections') ?? [],
        responseFields: parseJsonField(rawBody.responseFields, 'responseFields') ?? [],
        mscFields: parseJsonField(rawBody.mscFields, 'mscFields'),
        customCcEmail: parseOptionalStringField(rawBody.customCcEmail),
        sendNow: parseBooleanField(rawBody.sendNow),
        mailSubject: rawBody.mailSubject,
        mailBodyHtml: rawBody.mailBodyHtml,
    };
}
function getFirstValidationMessage(validationErrors) {
    return Object.values(validationErrors[0]?.constraints ?? {})[0];
}
let RfqsController = class RfqsController {
    rfqsService;
    constructor(rfqsService) {
        this.rfqsService = rfqsService;
    }
    list(inquiryId) {
        return this.rfqsService.list(inquiryId);
    }
    create(rawBody, files, user) {
        return this.rfqsService.create(this.parseCreateRfqDto(rawBody), user, files);
    }
    parseCreateRfqDto(rawBody) {
        const dto = (0, class_transformer_1.plainToInstance)(create_rfq_dto_1.CreateRfqDto, buildCreateRfqDtoPayload(rawBody));
        const validationErrors = (0, class_validator_1.validateSync)(dto, CREATE_RFQ_DTO_VALIDATION_OPTIONS);
        if (validationErrors.length > 0) {
            throw new common_1.BadRequestException(getFirstValidationMessage(validationErrors) || 'Invalid RFQ payload.');
        }
        return dto;
    }
};
exports.RfqsController = RfqsController;
__decorate([
    (0, common_1.Get)(),
    (0, module_access_decorator_1.AnyModuleAccess)([
        { moduleKey: 'rfq', action: 'view' },
        { moduleKey: 'comparison', action: 'view' },
    ]),
    __param(0, (0, common_1.Query)('inquiryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RfqsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, module_access_decorator_1.ModuleAccess)('rfq', 'edit'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('attachments', 10)),
    (0, audit_decorator_1.Audit)('RFQ_CREATED', 'rfq'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], RfqsController.prototype, "create", null);
exports.RfqsController = RfqsController = __decorate([
    (0, common_1.Controller)('rfqs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [rfqs_service_1.RfqsService])
], RfqsController);
//# sourceMappingURL=rfqs.controller.js.map