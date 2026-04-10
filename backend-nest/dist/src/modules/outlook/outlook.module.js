"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutlookModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const users_module_1 = require("../users/users.module");
const outlook_connection_entity_1 = require("./entities/outlook-connection.entity");
const outlook_subscription_entity_1 = require("./entities/outlook-subscription.entity");
const outlook_controller_1 = require("./outlook.controller");
const outlook_service_1 = require("./outlook.service");
let OutlookModule = class OutlookModule {
};
exports.OutlookModule = OutlookModule;
exports.OutlookModule = OutlookModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([outlook_connection_entity_1.OutlookConnection, outlook_subscription_entity_1.OutlookSubscription]),
            users_module_1.UsersModule,
        ],
        controllers: [outlook_controller_1.OutlookController],
        providers: [outlook_service_1.OutlookService],
        exports: [outlook_service_1.OutlookService],
    })
], OutlookModule);
//# sourceMappingURL=outlook.module.js.map