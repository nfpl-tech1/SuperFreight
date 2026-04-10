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
exports.ShipmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const freight_quote_entity_1 = require("./entities/freight-quote.entity");
const rate_sheet_entity_1 = require("./entities/rate-sheet.entity");
let ShipmentsService = class ShipmentsService {
    rateSheetRepo;
    quoteRepo;
    constructor(rateSheetRepo, quoteRepo) {
        this.rateSheetRepo = rateSheetRepo;
        this.quoteRepo = quoteRepo;
    }
    listRateSheets() {
        return this.rateSheetRepo.find({
            order: { effectiveMonth: 'DESC', shippingLine: 'ASC' },
        });
    }
    createRateSheet(dto) {
        return this.rateSheetRepo.save(this.rateSheetRepo.create(dto));
    }
    listQuotes(inquiryId) {
        return this.quoteRepo.find({
            where: inquiryId ? { inquiryId } : {},
            order: { createdAt: 'DESC' },
        });
    }
    createQuote(dto) {
        return this.quoteRepo.save(this.quoteRepo.create({
            ...dto,
            currency: dto.currency ?? 'USD',
            extractedFields: dto.extractedFields ?? null,
        }));
    }
};
exports.ShipmentsService = ShipmentsService;
exports.ShipmentsService = ShipmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(rate_sheet_entity_1.RateSheet, 'business')),
    __param(1, (0, typeorm_1.InjectRepository)(freight_quote_entity_1.FreightQuote)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ShipmentsService);
//# sourceMappingURL=shipments.service.js.map