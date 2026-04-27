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
exports.OutlookService = void 0;
const common_1 = require("@nestjs/common");
const outlook_auth_service_1 = require("./outlook-auth.service");
const outlook_mail_service_1 = require("./outlook-mail.service");
let OutlookService = class OutlookService {
    outlookAuthService;
    outlookMailService;
    constructor(outlookAuthService, outlookMailService) {
        this.outlookAuthService = outlookAuthService;
        this.outlookMailService = outlookMailService;
    }
    async getStatus(user) {
        return this.outlookAuthService.getStatus(user);
    }
    getConnectUrl(user) {
        return this.outlookAuthService.getConnectUrl(user);
    }
    async completeConnection(user, code) {
        return this.outlookAuthService.completeConnection(user, code);
    }
    async reconnect(user) {
        return this.outlookAuthService.reconnect(user);
    }
    async sendMail(user, payload) {
        return this.outlookMailService.sendMail(user, payload);
    }
    async sendMailTracked(user, payload) {
        return this.outlookMailService.sendMailTracked(user, payload);
    }
    async listInboxMessagesForUser(userId, options = {}) {
        return this.outlookMailService.listInboxMessagesForUser(userId, options);
    }
    async listMessageAttachmentsForUser(userId, messageId) {
        return this.outlookMailService.listMessageAttachmentsForUser(userId, messageId);
    }
    async getMessageDetailsForUser(userId, messageId) {
        return this.outlookMailService.getMessageDetailsForUser(userId, messageId);
    }
};
exports.OutlookService = OutlookService;
exports.OutlookService = OutlookService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [outlook_auth_service_1.OutlookAuthService,
        outlook_mail_service_1.OutlookMailService])
], OutlookService);
//# sourceMappingURL=outlook.service.js.map