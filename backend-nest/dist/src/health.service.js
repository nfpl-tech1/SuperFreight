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
exports.HealthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let HealthService = class HealthService {
    appDataSource;
    businessDataSource;
    constructor(appDataSource, businessDataSource) {
        this.appDataSource = appDataSource;
        this.businessDataSource = businessDataSource;
    }
    async getStatus() {
        const [appDatabase, businessDatabase] = await Promise.all([
            this.checkDataSource(this.appDataSource),
            this.checkDataSource(this.businessDataSource),
        ]);
        const status = appDatabase.status === 'up' && businessDatabase.status === 'up'
            ? 'ok'
            : 'degraded';
        return {
            status,
            timestamp: new Date().toISOString(),
            dependencies: {
                appDatabase,
                businessDatabase,
            },
        };
    }
    async checkDataSource(dataSource) {
        try {
            await dataSource.query('SELECT 1');
            return { status: 'up' };
        }
        catch (error) {
            return {
                status: 'down',
                details: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __param(1, (0, typeorm_1.InjectDataSource)('business')),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        typeorm_2.DataSource])
], HealthService);
//# sourceMappingURL=health.service.js.map