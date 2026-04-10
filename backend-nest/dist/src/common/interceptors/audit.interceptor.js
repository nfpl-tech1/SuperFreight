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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const operators_1 = require("rxjs/operators");
const audit_decorator_1 = require("../decorators/audit.decorator");
const audit_service_1 = require("../../modules/audit/audit.service");
let AuditInterceptor = class AuditInterceptor {
    reflector;
    auditService;
    constructor(reflector, auditService) {
        this.reflector = reflector;
        this.auditService = auditService;
    }
    intercept(context, next) {
        const meta = this.reflector.getAllAndOverride(audit_decorator_1.AUDIT_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!meta)
            return next.handle();
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        return next.handle().pipe((0, operators_1.tap)((responseBody) => {
            const resourceId = responseBody?.id ||
                request.params?.id ||
                undefined;
            void this.auditService.log({
                userId: user?.id,
                userEmail: user?.email,
                action: meta.action,
                resourceType: meta.resourceType,
                resourceId,
                metadata: { method: request.method, body: request.body },
            });
        }));
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        audit_service_1.AuditService])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map