"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const core_1 = require("@nestjs/core");
const configuration_1 = __importDefault(require("./config/configuration"));
const typeorm_options_1 = require("./database/typeorm-options");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const audit_module_1 = require("./modules/audit/audit.module");
const audit_interceptor_1 = require("./common/interceptors/audit.interceptor");
const outlook_module_1 = require("./modules/outlook/outlook.module");
const inquiries_module_1 = require("./modules/inquiries/inquiries.module");
const rfqs_module_1 = require("./modules/rfqs/rfqs.module");
const customer_quotes_module_1 = require("./modules/customer-quotes/customer-quotes.module");
const shipments_module_1 = require("./modules/shipments/shipments.module");
const vendors_module_1 = require("./modules/vendors/vendors.module");
const health_controller_1 = require("./health.controller");
const health_service_1 = require("./health.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        controllers: [health_controller_1.HealthController],
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                name: 'default',
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: typeorm_options_1.getAppTypeOrmModuleOptions,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                name: 'business',
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: typeorm_options_1.getBusinessTypeOrmModuleOptions,
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            audit_module_1.AuditModule,
            outlook_module_1.OutlookModule,
            inquiries_module_1.InquiriesModule,
            rfqs_module_1.RfqsModule,
            customer_quotes_module_1.CustomerQuotesModule,
            shipments_module_1.ShipmentsModule,
            vendors_module_1.VendorsModule,
        ],
        providers: [
            health_service_1.HealthService,
            { provide: core_1.APP_INTERCEPTOR, useClass: audit_interceptor_1.AuditInterceptor },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map