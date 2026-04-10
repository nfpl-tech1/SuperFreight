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
exports.VendorsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const vendor_selection_context_1 = require("./domain/vendor-selection-context");
const vendor_normalization_1 = require("./domain/vendor-normalization");
const vendor_validation_1 = require("./domain/vendor-validation");
const port_alias_entity_1 = require("./entities/port-alias.entity");
const port_master_entity_1 = require("./entities/port-master.entity");
const service_location_master_entity_1 = require("./entities/service-location-master.entity");
const vendor_cc_recipient_entity_1 = require("./entities/vendor-cc-recipient.entity");
const vendor_contact_entity_1 = require("./entities/vendor-contact.entity");
const vendor_master_entity_1 = require("./entities/vendor-master.entity");
const vendor_office_port_entity_1 = require("./entities/vendor-office-port.entity");
const vendor_office_service_location_entity_1 = require("./entities/vendor-office-service-location.entity");
const vendor_office_type_map_entity_1 = require("./entities/vendor-office-type-map.entity");
const vendor_office_entity_1 = require("./entities/vendor-office.entity");
const vendor_type_master_entity_1 = require("./entities/vendor-type-master.entity");
let VendorsService = class VendorsService {
    vendorRepo;
    officeRepo;
    contactRepo;
    ccRepo;
    vendorTypeRepo;
    officeTypeMapRepo;
    officePortRepo;
    officeServiceLocationRepo;
    portRepo;
    portAliasRepo;
    serviceLocationRepo;
    constructor(vendorRepo, officeRepo, contactRepo, ccRepo, vendorTypeRepo, officeTypeMapRepo, officePortRepo, officeServiceLocationRepo, portRepo, portAliasRepo, serviceLocationRepo) {
        this.vendorRepo = vendorRepo;
        this.officeRepo = officeRepo;
        this.contactRepo = contactRepo;
        this.ccRepo = ccRepo;
        this.vendorTypeRepo = vendorTypeRepo;
        this.officeTypeMapRepo = officeTypeMapRepo;
        this.officePortRepo = officePortRepo;
        this.officeServiceLocationRepo = officeServiceLocationRepo;
        this.portRepo = portRepo;
        this.portAliasRepo = portAliasRepo;
        this.serviceLocationRepo = serviceLocationRepo;
    }
    listVendorTypes() {
        return this.vendorTypeRepo.find({
            where: { isActive: true },
            order: { sortOrder: 'ASC', typeName: 'ASC' },
        });
    }
    async getCatalogSummary() {
        const [vendors, offices, contacts, ccRecipients] = await Promise.all([
            this.vendorRepo.count(),
            this.officeRepo.count(),
            this.contactRepo.count(),
            this.ccRepo.count(),
        ]);
        return {
            vendors,
            offices,
            contacts,
            ccRecipients,
        };
    }
    async getCatalogLookups() {
        const [vendorTypes, countryRows] = await Promise.all([
            this.listVendorTypes(),
            this.officeRepo
                .createQueryBuilder('office')
                .select('DISTINCT office.countryName', 'countryName')
                .where('office.countryName IS NOT NULL')
                .andWhere("TRIM(office.countryName) <> ''")
                .orderBy('office.countryName', 'ASC')
                .getRawMany(),
        ]);
        return {
            vendorTypes: vendorTypes.map((vendorType) => this.formatVendorType(vendorType)),
            countries: countryRows.map((row) => row.countryName),
        };
    }
    async getLocationOptions(query) {
        const page = Math.max(query.page ?? 1, 1);
        const pageSize = Math.min(Math.max(query.pageSize ?? 20, 1), 100);
        const context = (0, vendor_selection_context_1.resolveVendorSelectionContext)({
            quoteTypeContext: query.quoteTypeContext,
            shipmentMode: query.shipmentMode,
        });
        const useContextDefaults = Boolean(query.quoteTypeContext);
        const locationKind = query.locationKind ??
            (useContextDefaults
                ? context.locationKind
                : vendor_selection_context_1.VendorLocationKind.PORT);
        const typeCodes = query.typeCodes && query.typeCodes.length > 0
            ? query.typeCodes
            : useContextDefaults
                ? context.defaultTypeCodes
                : [];
        if (locationKind === vendor_selection_context_1.VendorLocationKind.PORT) {
            return this.listPortLocationOptions({
                page,
                pageSize,
                countryName: query.countryName,
                portMode: query.portMode ??
                    (useContextDefaults ? context.portMode ?? undefined : undefined),
                search: query.search,
                typeCodes,
            });
        }
        return this.listServiceLocationOptions({
            page,
            pageSize,
            countryName: query.countryName,
            search: query.search,
            typeCodes,
        });
    }
    async listPortMaster(query) {
        const page = Math.max(query.page ?? 1, 1);
        const pageSize = Math.min(Math.max(query.pageSize ?? 25, 1), 100);
        const baseQuery = this.buildPortMasterListQuery(query);
        const totalResult = await baseQuery
            .clone()
            .select('COUNT(DISTINCT port.id)', 'count')
            .getRawOne();
        const total = Number(totalResult?.count ?? 0);
        const idRows = await baseQuery
            .clone()
            .select('port.id', 'id')
            .addSelect('port.isActive', 'sortIsActive')
            .addSelect('port.portMode', 'sortPortMode')
            .addSelect('port.countryName', 'sortCountryName')
            .addSelect('port.name', 'sortName')
            .distinct(true)
            .orderBy('port.isActive', 'DESC')
            .addOrderBy('port.portMode', 'ASC')
            .addOrderBy('port.countryName', 'ASC')
            .addOrderBy('port.name', 'ASC')
            .offset((page - 1) * pageSize)
            .limit(pageSize)
            .getRawMany();
        const portIds = idRows.map((row) => row.id);
        const [ports, aliases, linkedOfficeCounts] = await Promise.all([
            portIds.length === 0
                ? Promise.resolve([])
                : this.portRepo.findBy({ id: (0, typeorm_2.In)(portIds) }),
            portIds.length === 0
                ? Promise.resolve([])
                : this.portAliasRepo.find({
                    where: { portId: (0, typeorm_2.In)(portIds) },
                    order: {
                        isPrimary: 'DESC',
                        alias: 'ASC',
                        createdAt: 'ASC',
                    },
                }),
            this.loadLinkedOfficeCounts(portIds),
        ]);
        const portsById = new Map(ports.map((port) => [port.id, port]));
        const aliasesByPortId = groupBy(aliases, (alias) => alias.portId);
        return {
            items: portIds
                .map((portId) => portsById.get(portId))
                .filter((port) => Boolean(port))
                .map((port) => this.formatPortMasterAdminItem(port, aliasesByPortId.get(port.id) ?? [], linkedOfficeCounts.get(port.id) ?? 0)),
            page,
            pageSize,
            total,
            totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
        };
    }
    async getPortMasterDetail(id) {
        const port = await this.findPortOrThrow(id);
        const [aliases, linkedOfficeCounts] = await Promise.all([
            this.portAliasRepo.find({
                where: { portId: port.id },
                order: {
                    isPrimary: 'DESC',
                    alias: 'ASC',
                    createdAt: 'ASC',
                },
            }),
            this.loadLinkedOfficeCounts([port.id]),
        ]);
        return this.formatPortMasterAdminDetail(port, aliases, linkedOfficeCounts.get(port.id) ?? 0);
    }
    async createPortMaster(dto) {
        const code = requirePortCode(dto.code);
        const portMode = dto.portMode;
        await this.ensurePortCodeUnique(portMode, code);
        const created = await this.portRepo.manager.transaction(async (manager) => {
            const portRepo = manager.getRepository(port_master_entity_1.PortMaster);
            const port = portRepo.create({
                code,
                name: requirePortName(dto.name),
                normalizedName: normalizePortLookupKey(dto.name),
                cityName: normalizePortValue(dto.cityName),
                normalizedCityName: normalizePortLookupKey(dto.cityName),
                stateName: normalizePortValue(dto.stateName),
                countryName: requirePortCountryName(dto.countryName),
                normalizedCountryName: normalizePortLookupKey(dto.countryName),
                portMode,
                regionId: null,
                unlocode: normalizePortCode(dto.unlocode),
                sourceConfidence: normalizePortValue(dto.sourceConfidence),
                isActive: dto.isActive ?? true,
                notes: normalizePortNotes(dto.notes),
            });
            const saved = await portRepo.save(port);
            await this.replacePortAliases(manager, saved, dto.aliases ?? []);
            return saved;
        });
        return this.getPortMasterDetail(created.id);
    }
    async updatePortMaster(id, dto) {
        const port = await this.findPortOrThrow(id);
        const nextCode = dto.code !== undefined ? requirePortCode(dto.code) : port.code;
        const nextPortMode = dto.portMode ?? port.portMode;
        if (nextCode !== port.code || nextPortMode !== port.portMode) {
            await this.ensurePortCodeUnique(nextPortMode, nextCode, port.id);
        }
        port.code = nextCode;
        port.portMode = nextPortMode;
        if (dto.name !== undefined) {
            port.name = requirePortName(dto.name);
            port.normalizedName = normalizePortLookupKey(dto.name);
        }
        if (dto.cityName !== undefined) {
            port.cityName = normalizePortValue(dto.cityName);
            port.normalizedCityName = normalizePortLookupKey(dto.cityName);
        }
        if (dto.stateName !== undefined) {
            port.stateName = normalizePortValue(dto.stateName);
        }
        if (dto.countryName !== undefined) {
            port.countryName = requirePortCountryName(dto.countryName);
            port.normalizedCountryName = normalizePortLookupKey(dto.countryName);
        }
        if (dto.unlocode !== undefined) {
            port.unlocode = normalizePortCode(dto.unlocode);
        }
        if (dto.sourceConfidence !== undefined) {
            port.sourceConfidence = normalizePortValue(dto.sourceConfidence);
        }
        if (dto.isActive !== undefined) {
            port.isActive = dto.isActive;
        }
        if (dto.notes !== undefined) {
            port.notes = normalizePortNotes(dto.notes);
        }
        await this.portRepo.manager.transaction(async (manager) => {
            const portRepo = manager.getRepository(port_master_entity_1.PortMaster);
            await portRepo.save(port);
            if (dto.aliases !== undefined) {
                await this.replacePortAliases(manager, port, dto.aliases);
            }
        });
        return this.getPortMasterDetail(port.id);
    }
    async listVendors(query) {
        const page = Math.max(query.page ?? 1, 1);
        const pageSize = Math.min(Math.max(query.pageSize ?? 25, 1), 100);
        const baseQuery = this.buildVendorListQuery(query);
        const totalResult = await baseQuery
            .clone()
            .select('COUNT(DISTINCT vendor.id)', 'count')
            .getRawOne();
        const total = Number(totalResult?.count ?? 0);
        const rows = await baseQuery
            .clone()
            .select('vendor.id', 'id')
            .addSelect('vendor.companyName', 'companyName')
            .distinct(true)
            .orderBy('vendor.companyName', 'ASC')
            .offset((page - 1) * pageSize)
            .limit(pageSize)
            .getRawMany();
        const vendorIds = rows.map((row) => row.id);
        const graph = await this.loadVendorGraph(vendorIds);
        const items = vendorIds
            .map((vendorId) => graph.vendorsById.get(vendorId))
            .filter((vendor) => Boolean(vendor))
            .map((vendor) => this.formatVendorListItem(vendor, graph));
        return {
            items,
            page,
            pageSize,
            total,
            totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
        };
    }
    async getVendorDetail(id) {
        const vendor = await this.vendorRepo.findOne({ where: { id } });
        if (!vendor) {
            throw new common_1.NotFoundException('Vendor not found');
        }
        const graph = await this.loadVendorGraph([vendor.id]);
        return this.formatVendorDetail(vendor, graph);
    }
    async createVendor(dto) {
        const companyName = (0, vendor_validation_1.requireVendorCompanyName)(dto.companyName);
        const normalizedName = (0, vendor_normalization_1.normalizeVendorNameKey)(companyName);
        if (!normalizedName) {
            throw new common_1.BadRequestException('Company name is required');
        }
        const existing = await this.vendorRepo.findOne({
            where: { normalizedName },
        });
        if (existing) {
            throw new common_1.ConflictException('Vendor already exists');
        }
        const vendor = this.vendorRepo.create({
            companyName,
            normalizedName,
            isActive: dto.isActive ?? true,
            notes: (0, vendor_normalization_1.normalizeVendorNotes)(dto.notes),
            primaryOfficeId: null,
        });
        const saved = await this.vendorRepo.save(vendor);
        return this.getVendorDetail(saved.id);
    }
    async updateVendor(id, dto) {
        const vendor = await this.findVendorOrThrow(id);
        if (dto.companyName !== undefined) {
            const companyName = (0, vendor_validation_1.requireVendorCompanyName)(dto.companyName);
            const normalizedName = (0, vendor_normalization_1.normalizeVendorNameKey)(companyName);
            const existing = await this.vendorRepo.findOne({
                where: { normalizedName },
            });
            if (existing && existing.id !== vendor.id) {
                throw new common_1.ConflictException('Vendor already exists');
            }
            vendor.companyName = companyName;
            vendor.normalizedName = normalizedName;
        }
        if (dto.isActive !== undefined) {
            vendor.isActive = dto.isActive;
        }
        if (dto.notes !== undefined) {
            vendor.notes = (0, vendor_normalization_1.normalizeVendorNotes)(dto.notes);
        }
        if (dto.primaryOfficeId !== undefined) {
            if (dto.primaryOfficeId) {
                await this.ensureOfficeBelongsToVendor(dto.primaryOfficeId, vendor.id);
                vendor.primaryOfficeId = dto.primaryOfficeId;
            }
            else {
                vendor.primaryOfficeId = null;
            }
        }
        await this.vendorRepo.save(vendor);
        return this.getVendorDetail(vendor.id);
    }
    async deleteVendor(id) {
        const vendor = await this.findVendorOrThrow(id);
        await this.vendorRepo.delete(vendor.id);
        return {
            success: true,
            id: vendor.id,
        };
    }
    async createOffice(vendorId, dto) {
        const vendor = await this.findVendorOrThrow(vendorId);
        const cityName = (0, vendor_normalization_1.normalizeVendorLocationName)(dto.cityName);
        const stateName = (0, vendor_normalization_1.normalizeVendorLocationName)(dto.stateName);
        const countryName = (0, vendor_normalization_1.normalizeVendorLocationName)(dto.countryName);
        const externalCode = (0, vendor_normalization_1.normalizeVendorExternalCode)(dto.externalCode);
        const officeName = (0, vendor_validation_1.resolveVendorOfficeName)({
            officeName: dto.officeName,
            cityName,
            stateName,
            countryName,
            externalCode,
        });
        await this.ensureOfficeNameUnique(vendor.id, officeName);
        await this.assertValidOfficeRelations(dto.typeIds, dto.portIds);
        (0, vendor_validation_1.assertSinglePrimaryContact)(dto.contacts);
        const savedOffice = await this.vendorRepo.manager.transaction(async (manager) => {
            const officeRepo = manager.getRepository(vendor_office_entity_1.VendorOffice);
            const vendorRepo = manager.getRepository(vendor_master_entity_1.VendorMaster);
            const office = await officeRepo.save(officeRepo.create({
                vendorId: vendor.id,
                officeName,
                cityName,
                stateName,
                countryName,
                addressRaw: (0, vendor_normalization_1.normalizeVendorAddress)(dto.addressRaw),
                externalCode,
                specializationRaw: (0, vendor_normalization_1.normalizeVendorFreeText)(dto.specializationRaw),
                isActive: dto.isActive ?? true,
                isIataCertified: dto.isIataCertified ?? false,
                doesSeaFreight: dto.doesSeaFreight ?? false,
                doesProjectCargo: dto.doesProjectCargo ?? false,
                doesOwnConsolidation: dto.doesOwnConsolidation ?? false,
                doesOwnTransportation: dto.doesOwnTransportation ?? false,
                doesOwnWarehousing: dto.doesOwnWarehousing ?? false,
                doesOwnCustomClearance: dto.doesOwnCustomClearance ?? false,
            }));
            await this.replaceOfficeTypeLinks(manager, office.id, dto.typeIds ?? []);
            await this.replaceOfficePorts(manager, office.id, dto.portIds ?? []);
            await this.replaceOfficeContacts(manager, office.id, dto.contacts ?? []);
            await this.replaceOfficeCcRecipients(manager, office.id, dto.ccRecipients ?? []);
            if (dto.isPrimary) {
                vendor.primaryOfficeId = office.id;
                await vendorRepo.save(vendor);
            }
            return office;
        });
        return this.getVendorDetail(savedOffice.vendorId);
    }
    async updateOffice(officeId, dto) {
        const office = await this.findOfficeOrThrow(officeId);
        const vendor = await this.findVendorOrThrow(office.vendorId);
        const updatePlan = this.buildOfficeUpdatePlan(office, dto);
        if (updatePlan.shouldRefreshOfficeName) {
            await this.ensureOfficeNameUnique(vendor.id, updatePlan.nextOfficeName, office.id);
        }
        await this.assertValidOfficeRelations(dto.typeIds, dto.portIds);
        (0, vendor_validation_1.assertSinglePrimaryContact)(dto.contacts);
        await this.vendorRepo.manager.transaction(async (manager) => {
            const officeRepo = manager.getRepository(vendor_office_entity_1.VendorOffice);
            const vendorRepo = manager.getRepository(vendor_master_entity_1.VendorMaster);
            this.applyOfficeScalarUpdates(office, dto, updatePlan);
            await officeRepo.save(office);
            await this.syncOfficeRelations(manager, office.id, dto);
            await this.syncVendorPrimaryOffice(vendorRepo, vendor, office.id, dto);
        });
        return this.getVendorDetail(vendor.id);
    }
    buildVendorListQuery(query) {
        const context = (0, vendor_selection_context_1.resolveVendorSelectionContext)({
            quoteTypeContext: query.quoteTypeContext,
            shipmentMode: query.shipmentMode,
        });
        const typeCodes = this.resolveVendorListTypeCodes(query, context.defaultTypeCodes);
        const qb = this.createVendorListBaseQuery();
        this.applyVendorListSearchFilter(qb, query.search);
        this.applyVendorListScalarFilters(qb, query, typeCodes);
        this.applyLocationScope(qb, query, context.locationKind);
        this.applyVendorCapabilityFilters(qb, query);
        return qb;
    }
    buildOfficeUpdatePlan(office, dto) {
        const nextCityName = dto.cityName !== undefined
            ? (0, vendor_normalization_1.normalizeVendorLocationName)(dto.cityName)
            : office.cityName;
        const nextStateName = dto.stateName !== undefined
            ? (0, vendor_normalization_1.normalizeVendorLocationName)(dto.stateName)
            : office.stateName;
        const nextCountryName = dto.countryName !== undefined
            ? (0, vendor_normalization_1.normalizeVendorLocationName)(dto.countryName)
            : office.countryName;
        const nextExternalCode = dto.externalCode !== undefined
            ? (0, vendor_normalization_1.normalizeVendorExternalCode)(dto.externalCode)
            : office.externalCode;
        const shouldRefreshOfficeName = dto.officeName !== undefined ||
            dto.cityName !== undefined ||
            dto.stateName !== undefined ||
            dto.countryName !== undefined ||
            dto.externalCode !== undefined;
        return {
            nextCityName,
            nextStateName,
            nextCountryName,
            nextExternalCode,
            shouldRefreshOfficeName,
            nextOfficeName: shouldRefreshOfficeName
                ? (0, vendor_validation_1.resolveVendorOfficeName)({
                    officeName: dto.officeName,
                    cityName: nextCityName,
                    stateName: nextStateName,
                    countryName: nextCountryName,
                    externalCode: nextExternalCode,
                    fallbackOfficeName: office.officeName,
                })
                : office.officeName,
        };
    }
    applyOfficeScalarUpdates(office, dto, updatePlan) {
        if (updatePlan.shouldRefreshOfficeName) {
            office.officeName = updatePlan.nextOfficeName;
        }
        if (dto.cityName !== undefined) {
            office.cityName = updatePlan.nextCityName;
        }
        if (dto.stateName !== undefined) {
            office.stateName = updatePlan.nextStateName;
        }
        if (dto.countryName !== undefined) {
            office.countryName = updatePlan.nextCountryName;
        }
        if (dto.addressRaw !== undefined) {
            office.addressRaw = (0, vendor_normalization_1.normalizeVendorAddress)(dto.addressRaw);
        }
        if (dto.externalCode !== undefined) {
            office.externalCode = updatePlan.nextExternalCode;
        }
        if (dto.specializationRaw !== undefined) {
            office.specializationRaw = (0, vendor_normalization_1.normalizeVendorFreeText)(dto.specializationRaw);
        }
        if (dto.isActive !== undefined) {
            office.isActive = dto.isActive;
        }
        if (dto.isIataCertified !== undefined) {
            office.isIataCertified = dto.isIataCertified;
        }
        if (dto.doesSeaFreight !== undefined) {
            office.doesSeaFreight = dto.doesSeaFreight;
        }
        if (dto.doesProjectCargo !== undefined) {
            office.doesProjectCargo = dto.doesProjectCargo;
        }
        if (dto.doesOwnConsolidation !== undefined) {
            office.doesOwnConsolidation = dto.doesOwnConsolidation;
        }
        if (dto.doesOwnTransportation !== undefined) {
            office.doesOwnTransportation = dto.doesOwnTransportation;
        }
        if (dto.doesOwnWarehousing !== undefined) {
            office.doesOwnWarehousing = dto.doesOwnWarehousing;
        }
        if (dto.doesOwnCustomClearance !== undefined) {
            office.doesOwnCustomClearance = dto.doesOwnCustomClearance;
        }
    }
    async syncOfficeRelations(manager, officeId, dto) {
        if (dto.typeIds !== undefined) {
            await this.replaceOfficeTypeLinks(manager, officeId, dto.typeIds);
        }
        if (dto.portIds !== undefined) {
            await this.replaceOfficePorts(manager, officeId, dto.portIds);
        }
        if (dto.contacts !== undefined) {
            await this.replaceOfficeContacts(manager, officeId, dto.contacts);
        }
        if (dto.ccRecipients !== undefined) {
            await this.replaceOfficeCcRecipients(manager, officeId, dto.ccRecipients);
        }
    }
    async syncVendorPrimaryOffice(vendorRepo, vendor, officeId, dto) {
        if (dto.isPrimary === true) {
            vendor.primaryOfficeId = officeId;
            await vendorRepo.save(vendor);
            return;
        }
        if (dto.isPrimary === false && vendor.primaryOfficeId === officeId) {
            vendor.primaryOfficeId = null;
            await vendorRepo.save(vendor);
        }
    }
    resolveVendorListTypeCodes(query, defaultTypeCodes) {
        return query.typeCodes && query.typeCodes.length > 0
            ? query.typeCodes
            : defaultTypeCodes;
    }
    createVendorListBaseQuery() {
        return this.vendorRepo
            .createQueryBuilder('vendor')
            .leftJoin(vendor_office_entity_1.VendorOffice, 'office', 'office.vendorId = vendor.id')
            .leftJoin(vendor_contact_entity_1.VendorContact, 'contact', 'contact.officeId = office.id')
            .leftJoin(vendor_office_type_map_entity_1.VendorOfficeTypeMap, 'officeType', 'officeType.officeId = office.id AND officeType.isActive = :officeTypeActive', { officeTypeActive: true })
            .leftJoin(vendor_type_master_entity_1.VendorTypeMaster, 'vendorType', 'vendorType.id = officeType.vendorTypeId AND vendorType.isActive = :vendorTypeActive', { vendorTypeActive: true });
    }
    applyVendorListSearchFilter(qb, search) {
        if (!search) {
            return;
        }
        qb.andWhere(`(
        vendor.companyName ILIKE :search
        OR office.officeName ILIKE :search
        OR office.cityName ILIKE :search
        OR office.countryName ILIKE :search
        OR office.externalCode ILIKE :search
        OR contact.contactName ILIKE :search
        OR contact.emailPrimary ILIKE :search
      )`, { search: `%${search.trim()}%` });
    }
    applyVendorListScalarFilters(qb, query, typeCodes) {
        if (query.isActive !== undefined) {
            qb.andWhere('vendor.isActive = :isActive', { isActive: query.isActive });
        }
        if (query.countryName) {
            qb.andWhere('LOWER(office.countryName) = LOWER(:countryName)', {
                countryName: query.countryName.trim(),
            });
        }
        if (query.cityName) {
            qb.andWhere('LOWER(office.cityName) = LOWER(:cityName)', {
                cityName: query.cityName.trim(),
            });
        }
        if (typeCodes.length > 0) {
            qb.andWhere('vendorType.typeCode IN (:...typeCodes)', {
                typeCodes,
            });
        }
    }
    applyVendorCapabilityFilters(qb, query) {
        const capabilityFilters = [
            {
                alias: 'officeCapabilityIata',
                condition: 'officeCapabilityIata.isIataCertified = true',
                value: query.isIataCertified,
            },
            {
                alias: 'officeCapabilitySeaFreight',
                condition: 'officeCapabilitySeaFreight.doesSeaFreight = true',
                value: query.doesSeaFreight,
            },
            {
                alias: 'officeCapabilityProjectCargo',
                condition: 'officeCapabilityProjectCargo.doesProjectCargo = true',
                value: query.doesProjectCargo,
            },
            {
                alias: 'officeCapabilityOwnConsolidation',
                condition: 'officeCapabilityOwnConsolidation.doesOwnConsolidation = true',
                value: query.doesOwnConsolidation,
            },
            {
                alias: 'officeCapabilityOwnTransportation',
                condition: 'officeCapabilityOwnTransportation.doesOwnTransportation = true',
                value: query.doesOwnTransportation,
            },
            {
                alias: 'officeCapabilityOwnWarehousing',
                condition: 'officeCapabilityOwnWarehousing.doesOwnWarehousing = true',
                value: query.doesOwnWarehousing,
            },
            {
                alias: 'officeCapabilityOwnCustoms',
                condition: 'officeCapabilityOwnCustoms.doesOwnCustomClearance = true',
                value: query.doesOwnCustomClearance,
            },
        ];
        for (const capabilityFilter of capabilityFilters) {
            this.applyCapabilityFilter(qb, capabilityFilter.alias, capabilityFilter.condition, capabilityFilter.value);
        }
    }
    buildPortMasterListQuery(query) {
        const qb = this.portRepo.createQueryBuilder('port');
        if (query.search) {
            const search = `%${query.search.trim()}%`;
            qb.leftJoin(port_alias_entity_1.PortAlias, 'alias', 'alias.portId = port.id');
            qb.andWhere(new typeorm_2.Brackets((subQuery) => {
                subQuery
                    .where('port.code ILIKE :search', { search })
                    .orWhere('port.name ILIKE :search', { search })
                    .orWhere('port.cityName ILIKE :search', { search })
                    .orWhere('port.countryName ILIKE :search', { search })
                    .orWhere('port.unlocode ILIKE :search', { search })
                    .orWhere('alias.alias ILIKE :search', { search });
            }));
        }
        if (query.countryName) {
            qb.andWhere('LOWER(port.countryName) = LOWER(:countryName)', {
                countryName: query.countryName.trim(),
            });
        }
        if (query.portMode) {
            qb.andWhere('port.portMode = :portMode', { portMode: query.portMode });
        }
        if (query.isActive !== undefined) {
            qb.andWhere('port.isActive = :isActive', { isActive: query.isActive });
        }
        return qb;
    }
    applyCapabilityFilter(qb, alias, condition, value) {
        if (value === undefined) {
            return;
        }
        const subQuery = qb
            .subQuery()
            .select('1')
            .from(vendor_office_entity_1.VendorOffice, alias)
            .where(`${alias}.vendorId = vendor.id`)
            .andWhere(condition)
            .getQuery();
        qb.andWhere(`${value ? 'EXISTS' : 'NOT EXISTS'} (${subQuery})`);
    }
    applyLocationScope(qb, query, defaultLocationKind) {
        const locationKind = query.locationKind ?? defaultLocationKind;
        const locationScope = query.locationScope ??
            (query.locationId
                ? vendor_selection_context_1.VendorLocationScope.EXACT
                : query.locationCountryName
                    ? vendor_selection_context_1.VendorLocationScope.COUNTRY
                    : undefined);
        if (!locationScope) {
            return;
        }
        if (locationScope === vendor_selection_context_1.VendorLocationScope.EXACT &&
            query.locationId &&
            locationKind === vendor_selection_context_1.VendorLocationKind.PORT) {
            qb.andWhere(`EXISTS (
          SELECT 1
          FROM "vendor_office_ports" "locationOfficePort"
          WHERE "locationOfficePort"."officeId" = office.id
            AND "locationOfficePort"."portId" = :locationId
        )`, { locationId: query.locationId });
            return;
        }
        if (locationScope === vendor_selection_context_1.VendorLocationScope.EXACT &&
            query.locationId &&
            locationKind === vendor_selection_context_1.VendorLocationKind.SERVICE_LOCATION) {
            const legacyLocation = (0, vendor_selection_context_1.parseLegacyServiceLocationId)(query.locationId);
            if (legacyLocation) {
                qb.andWhere(new typeorm_2.Brackets((locationQb) => {
                    locationQb
                        .where(`LOWER(TRIM(COALESCE(NULLIF(office."cityName", ''), NULLIF(office."officeName", ''), ''))) = :legacyLocationName`, {
                        legacyLocationName: legacyLocation.normalizedName,
                    })
                        .andWhere(`LOWER(TRIM(COALESCE(office."countryName", ''))) = :legacyLocationCountry`, {
                        legacyLocationCountry: legacyLocation.normalizedCountryName,
                    });
                }));
                return;
            }
            qb.andWhere(`EXISTS (
          SELECT 1
          FROM "vendor_office_service_locations" "locationOfficeService"
          WHERE "locationOfficeService"."officeId" = office.id
            AND "locationOfficeService"."serviceLocationId" = :locationId
        )`, { locationId: query.locationId });
            return;
        }
        if (locationScope === vendor_selection_context_1.VendorLocationScope.COUNTRY &&
            query.locationCountryName) {
            qb.andWhere(new typeorm_2.Brackets((countryQb) => {
                countryQb.where('LOWER(TRIM(COALESCE(office."countryName", \'\'))) = LOWER(:locationCountryName)', {
                    locationCountryName: query.locationCountryName?.trim(),
                });
                if (locationKind === vendor_selection_context_1.VendorLocationKind.PORT) {
                    countryQb.orWhere(`EXISTS (
                SELECT 1
                FROM "vendor_office_ports" "countryOfficePort"
                INNER JOIN "port_master" "countryPort"
                  ON "countryPort"."id" = "countryOfficePort"."portId"
                WHERE "countryOfficePort"."officeId" = office.id
                  AND LOWER(TRIM(COALESCE("countryPort"."countryName", ''))) = LOWER(:locationCountryName)
              )`, {
                        locationCountryName: query.locationCountryName?.trim(),
                    });
                }
                else {
                    countryQb.orWhere(`EXISTS (
                SELECT 1
                FROM "vendor_office_service_locations" "countryOfficeService"
                INNER JOIN "service_location_master" "countryServiceLocation"
                  ON "countryServiceLocation"."id" = "countryOfficeService"."serviceLocationId"
                WHERE "countryOfficeService"."officeId" = office.id
                  AND LOWER(TRIM(COALESCE("countryServiceLocation"."countryName", ''))) = LOWER(:locationCountryName)
              )`, {
                        locationCountryName: query.locationCountryName?.trim(),
                    });
                }
            }));
        }
    }
    async listPortLocationOptions(input) {
        const qb = this.portRepo
            .createQueryBuilder('port')
            .where('port.isActive = :portActive', { portActive: true });
        if (input.portMode) {
            qb.andWhere('port.portMode = :portMode', { portMode: input.portMode });
        }
        if (input.countryName?.trim()) {
            qb.andWhere("LOWER(TRIM(COALESCE(port.countryName, ''))) = LOWER(:countryName)", { countryName: input.countryName.trim() });
        }
        if (input.search?.trim()) {
            const search = `%${input.search.trim()}%`;
            qb.andWhere(new typeorm_2.Brackets((searchQb) => {
                searchQb
                    .where('port.name ILIKE :search', { search })
                    .orWhere('port.cityName ILIKE :search', { search })
                    .orWhere('port.countryName ILIKE :search', { search })
                    .orWhere('port.code ILIKE :search', { search })
                    .orWhere(`EXISTS (
                SELECT 1
                FROM "port_alias" "portAlias"
                WHERE "portAlias"."portId" = port.id
                  AND "portAlias"."alias" ILIKE :search
              )`, { search });
            }));
        }
        const total = await qb.clone().getCount();
        const rows = await qb
            .clone()
            .orderBy('port.countryName', 'ASC')
            .addOrderBy('port.cityName', 'ASC')
            .addOrderBy('port.name', 'ASC')
            .offset((input.page - 1) * input.pageSize)
            .limit(input.pageSize)
            .getMany();
        const recommendedPortIds = await this.getRecommendedPortIds(rows.map((port) => port.id), input.typeCodes);
        return {
            items: rows.map((port) => ({
                id: port.id,
                kind: vendor_selection_context_1.VendorLocationKind.PORT,
                label: port.name,
                subLabel: [port.cityName, port.countryName]
                    .filter(isNonEmpty)
                    .join(', '),
                countryName: port.countryName,
                portMode: port.portMode,
                recommended: recommendedPortIds.has(port.id),
            })),
            page: input.page,
            pageSize: input.pageSize,
            total,
            totalPages: total === 0 ? 0 : Math.ceil(total / input.pageSize),
        };
    }
    async listServiceLocationOptions(input) {
        const canonicalQuery = this.serviceLocationRepo
            .createQueryBuilder('serviceLocation')
            .where('serviceLocation.isActive = :serviceLocationActive', {
            serviceLocationActive: true,
        });
        if (input.countryName?.trim()) {
            canonicalQuery.andWhere("LOWER(TRIM(COALESCE(serviceLocation.countryName, ''))) = LOWER(:countryName)", { countryName: input.countryName.trim() });
        }
        if (input.search?.trim()) {
            const search = `%${input.search.trim()}%`;
            canonicalQuery.andWhere(new typeorm_2.Brackets((searchQb) => {
                searchQb
                    .where('serviceLocation.name ILIKE :search', { search })
                    .orWhere('serviceLocation.cityName ILIKE :search', { search })
                    .orWhere('serviceLocation.countryName ILIKE :search', { search });
            }));
        }
        const canonicalTotal = await canonicalQuery.clone().getCount();
        if (canonicalTotal > 0) {
            const rows = await canonicalQuery
                .clone()
                .orderBy('serviceLocation.countryName', 'ASC')
                .addOrderBy('serviceLocation.cityName', 'ASC')
                .addOrderBy('serviceLocation.name', 'ASC')
                .offset((input.page - 1) * input.pageSize)
                .limit(input.pageSize)
                .getMany();
            const recommendedServiceLocationIds = await this.getRecommendedServiceLocationIds(rows.map((serviceLocation) => serviceLocation.id), input.typeCodes);
            return {
                items: rows.map((serviceLocation) => ({
                    id: serviceLocation.id,
                    kind: vendor_selection_context_1.VendorLocationKind.SERVICE_LOCATION,
                    label: serviceLocation.name,
                    subLabel: [serviceLocation.cityName, serviceLocation.countryName]
                        .filter(isNonEmpty)
                        .join(', '),
                    countryName: serviceLocation.countryName,
                    portMode: null,
                    recommended: recommendedServiceLocationIds.has(serviceLocation.id),
                })),
                page: input.page,
                pageSize: input.pageSize,
                total: canonicalTotal,
                totalPages: Math.ceil(canonicalTotal / input.pageSize),
            };
        }
        return this.listLegacyServiceLocationOptions(input);
    }
    async listLegacyServiceLocationOptions(input) {
        const locationNameExpression = `COALESCE(NULLIF(TRIM(office."cityName"), ''), NULLIF(TRIM(office."officeName"), ''), '')`;
        const normalizedLocationExpression = `LOWER(${locationNameExpression})`;
        const normalizedCountryExpression = `LOWER(TRIM(COALESCE(office."countryName", '')))`;
        const qb = this.officeRepo
            .createQueryBuilder('office')
            .select(locationNameExpression, 'label')
            .addSelect(normalizedLocationExpression, 'normalizedName')
            .addSelect(`NULLIF(TRIM(office."stateName"), '')`, 'stateName')
            .addSelect(`TRIM(COALESCE(office."countryName", ''))`, 'countryName')
            .addSelect(normalizedCountryExpression, 'normalizedCountryName')
            .where('office.isActive = :officeActive', { officeActive: true })
            .andWhere(`${locationNameExpression} <> ''`);
        if (input.countryName?.trim()) {
            qb.andWhere(`${normalizedCountryExpression} = LOWER(:countryName)`, {
                countryName: input.countryName.trim(),
            });
        }
        if (input.search?.trim()) {
            const search = `%${input.search.trim()}%`;
            qb.andWhere(new typeorm_2.Brackets((searchQb) => {
                searchQb
                    .where(`${locationNameExpression} ILIKE :search`, { search })
                    .orWhere('office.countryName ILIKE :search', { search })
                    .orWhere('office.stateName ILIKE :search', { search });
            }));
        }
        if (input.typeCodes.length > 0) {
            qb.innerJoin('vendor_office_type_map', 'officeType', 'officeType."officeId" = office.id AND officeType."isActive" = true').innerJoin('vendor_type_master', 'vendorType', 'vendorType.id = officeType."vendorTypeId" AND vendorType."isActive" = true AND vendorType."typeCode" IN (:...typeCodes)', { typeCodes: input.typeCodes });
        }
        const rows = await qb
            .groupBy(locationNameExpression)
            .addGroupBy(normalizedLocationExpression)
            .addGroupBy(`NULLIF(TRIM(office."stateName"), '')`)
            .addGroupBy(`TRIM(COALESCE(office."countryName", ''))`)
            .addGroupBy(normalizedCountryExpression)
            .orderBy(`TRIM(COALESCE(office."countryName", ''))`, 'ASC')
            .addOrderBy(locationNameExpression, 'ASC')
            .getRawMany();
        const total = rows.length;
        const pagedRows = rows.slice((input.page - 1) * input.pageSize, (input.page - 1) * input.pageSize + input.pageSize);
        return {
            items: pagedRows.map((row) => ({
                id: (0, vendor_selection_context_1.buildLegacyServiceLocationId)(row.normalizedName, row.normalizedCountryName),
                kind: vendor_selection_context_1.VendorLocationKind.SERVICE_LOCATION,
                label: row.label,
                subLabel: [row.stateName, row.countryName]
                    .filter(isNonEmpty)
                    .join(', '),
                countryName: row.countryName,
                portMode: null,
                recommended: false,
            })),
            page: input.page,
            pageSize: input.pageSize,
            total,
            totalPages: total === 0 ? 0 : Math.ceil(total / input.pageSize),
        };
    }
    async getRecommendedPortIds(portIds, typeCodes) {
        if (portIds.length === 0 || typeCodes.length === 0) {
            return new Set();
        }
        const rows = await this.officePortRepo
            .createQueryBuilder('officePort')
            .select('officePort.portId', 'portId')
            .innerJoin(vendor_office_entity_1.VendorOffice, 'office', 'office.id = officePort.officeId AND office.isActive = true')
            .innerJoin(vendor_office_type_map_entity_1.VendorOfficeTypeMap, 'officeType', 'officeType.officeId = office.id AND officeType.isActive = true')
            .innerJoin(vendor_type_master_entity_1.VendorTypeMaster, 'vendorType', 'vendorType.id = officeType.vendorTypeId AND vendorType.isActive = true')
            .where('officePort.portId IN (:...portIds)', { portIds })
            .andWhere('vendorType.typeCode IN (:...typeCodes)', { typeCodes })
            .groupBy('officePort.portId')
            .getRawMany();
        return new Set(rows.map((row) => row.portId));
    }
    async getRecommendedServiceLocationIds(serviceLocationIds, typeCodes) {
        if (serviceLocationIds.length === 0 || typeCodes.length === 0) {
            return new Set();
        }
        const rows = await this.officeServiceLocationRepo
            .createQueryBuilder('officeServiceLocation')
            .select('officeServiceLocation.serviceLocationId', 'serviceLocationId')
            .innerJoin(vendor_office_entity_1.VendorOffice, 'office', 'office.id = officeServiceLocation.officeId AND office.isActive = true')
            .innerJoin(vendor_office_type_map_entity_1.VendorOfficeTypeMap, 'officeType', 'officeType.officeId = office.id AND officeType.isActive = true')
            .innerJoin(vendor_type_master_entity_1.VendorTypeMaster, 'vendorType', 'vendorType.id = officeType.vendorTypeId AND vendorType.isActive = true')
            .where('officeServiceLocation.serviceLocationId IN (:...serviceLocationIds)', { serviceLocationIds })
            .andWhere('vendorType.typeCode IN (:...typeCodes)', { typeCodes })
            .groupBy('officeServiceLocation.serviceLocationId')
            .getRawMany();
        return new Set(rows.map((row) => row.serviceLocationId));
    }
    async loadVendorGraph(vendorIds) {
        const emptyGraph = {
            vendorsById: new Map(),
            officesByVendorId: new Map(),
            contactsByOfficeId: new Map(),
            ccRecipientsByOfficeId: new Map(),
            portsByOfficeId: new Map(),
            serviceLocationsByOfficeId: new Map(),
            typesByOfficeId: new Map(),
        };
        if (vendorIds.length === 0) {
            return emptyGraph;
        }
        const [vendors, offices] = await Promise.all([
            this.vendorRepo.findBy({ id: (0, typeorm_2.In)(vendorIds) }),
            this.officeRepo.find({
                where: { vendorId: (0, typeorm_2.In)(vendorIds) },
                order: { officeName: 'ASC', createdAt: 'ASC' },
            }),
        ]);
        const officeIds = offices.map((office) => office.id);
        const [contacts, ccRecipients, officeTypeMaps, officePorts, officeServiceLocations,] = officeIds.length === 0
            ? [[], [], [], [], []]
            : await Promise.all([
                this.contactRepo.find({
                    where: { officeId: (0, typeorm_2.In)(officeIds) },
                    order: {
                        isPrimary: 'DESC',
                        contactName: 'ASC',
                        createdAt: 'ASC',
                    },
                }),
                this.ccRepo.find({
                    where: { officeId: (0, typeorm_2.In)(officeIds) },
                    order: { email: 'ASC' },
                }),
                this.officeTypeMapRepo.find({
                    where: { officeId: (0, typeorm_2.In)(officeIds), isActive: true },
                    order: { createdAt: 'ASC' },
                }),
                this.officePortRepo.find({
                    where: { officeId: (0, typeorm_2.In)(officeIds) },
                    order: { isPrimary: 'DESC', createdAt: 'ASC' },
                }),
                this.officeServiceLocationRepo.find({
                    where: { officeId: (0, typeorm_2.In)(officeIds) },
                    order: { isPrimary: 'DESC', createdAt: 'ASC' },
                }),
            ]);
        const vendorTypeIds = Array.from(new Set(officeTypeMaps.map((row) => row.vendorTypeId)));
        const portIds = Array.from(new Set(officePorts.map((row) => row.portId)));
        const serviceLocationIds = Array.from(new Set(officeServiceLocations.map((row) => row.serviceLocationId)));
        const [vendorTypes, ports, serviceLocations] = await Promise.all([
            vendorTypeIds.length === 0
                ? Promise.resolve([])
                : this.vendorTypeRepo.findBy({ id: (0, typeorm_2.In)(vendorTypeIds) }),
            portIds.length === 0
                ? Promise.resolve([])
                : this.portRepo.findBy({ id: (0, typeorm_2.In)(portIds) }),
            serviceLocationIds.length === 0
                ? Promise.resolve([])
                : this.serviceLocationRepo.findBy({ id: (0, typeorm_2.In)(serviceLocationIds) }),
        ]);
        const vendorTypesById = new Map(vendorTypes.map((row) => [row.id, row]));
        const portsById = new Map(ports.map((row) => [row.id, row]));
        const serviceLocationsById = new Map(serviceLocations.map((row) => [row.id, row]));
        return {
            vendorsById: new Map(vendors.map((vendor) => [vendor.id, vendor])),
            officesByVendorId: groupBy(offices, (office) => office.vendorId),
            contactsByOfficeId: groupBy(contacts, (contact) => contact.officeId),
            ccRecipientsByOfficeId: groupBy(ccRecipients, (recipient) => recipient.officeId),
            portsByOfficeId: groupMappedBy(officePorts, (officePort) => officePort.officeId, (officePort) => portsById.get(officePort.portId)),
            serviceLocationsByOfficeId: groupMappedBy(officeServiceLocations, (officeServiceLocation) => officeServiceLocation.officeId, (officeServiceLocation) => serviceLocationsById.get(officeServiceLocation.serviceLocationId)),
            typesByOfficeId: groupMappedBy(officeTypeMaps, (officeType) => officeType.officeId, (officeType) => vendorTypesById.get(officeType.vendorTypeId)),
        };
    }
    formatVendorType(vendorType) {
        return {
            id: vendorType.id,
            typeCode: vendorType.typeCode,
            typeName: vendorType.typeName,
            description: vendorType.description,
            sortOrder: vendorType.sortOrder,
            isActive: vendorType.isActive,
        };
    }
    formatVendorListItem(vendor, graph) {
        const offices = graph.officesByVendorId.get(vendor.id) ?? [];
        const primaryOffice = this.pickPrimaryOffice(vendor, offices);
        const primaryContact = this.pickPrimaryContact(primaryOffice, offices, graph);
        const vendorTypes = this.collectVendorTypes(offices, graph);
        const capabilities = this.aggregateVendorCapabilities(offices);
        const countries = Array.from(new Set(offices.map((office) => office.countryName).filter(isNonEmpty))).sort((left, right) => left.localeCompare(right));
        const contactCount = offices.reduce((sum, office) => sum + (graph.contactsByOfficeId.get(office.id)?.length ?? 0), 0);
        return {
            id: vendor.id,
            companyName: vendor.companyName,
            normalizedName: vendor.normalizedName,
            isActive: vendor.isActive,
            notes: vendor.notes,
            primaryOfficeId: vendor.primaryOfficeId,
            officeCount: offices.length,
            contactCount,
            countries,
            capabilities,
            vendorTypes,
            primaryOffice: primaryOffice
                ? this.formatOfficeSummary(primaryOffice, vendor.primaryOfficeId)
                : null,
            primaryContact: primaryContact
                ? this.formatContact(primaryContact)
                : null,
            createdAt: vendor.createdAt,
            updatedAt: vendor.updatedAt,
        };
    }
    aggregateVendorCapabilities(offices) {
        return offices.reduce((accumulator, office) => ({
            isIataCertified: accumulator.isIataCertified || office.isIataCertified,
            doesSeaFreight: accumulator.doesSeaFreight || office.doesSeaFreight,
            doesProjectCargo: accumulator.doesProjectCargo || office.doesProjectCargo,
            doesOwnConsolidation: accumulator.doesOwnConsolidation || office.doesOwnConsolidation,
            doesOwnTransportation: accumulator.doesOwnTransportation || office.doesOwnTransportation,
            doesOwnWarehousing: accumulator.doesOwnWarehousing || office.doesOwnWarehousing,
            doesOwnCustomClearance: accumulator.doesOwnCustomClearance || office.doesOwnCustomClearance,
        }), {
            isIataCertified: false,
            doesSeaFreight: false,
            doesProjectCargo: false,
            doesOwnConsolidation: false,
            doesOwnTransportation: false,
            doesOwnWarehousing: false,
            doesOwnCustomClearance: false,
        });
    }
    formatVendorDetail(vendor, graph) {
        const offices = graph.officesByVendorId.get(vendor.id) ?? [];
        const vendorTypes = this.collectVendorTypes(offices, graph);
        const countries = Array.from(new Set(offices.map((office) => office.countryName).filter(isNonEmpty))).sort((left, right) => left.localeCompare(right));
        const officeDetails = offices.map((office) => this.formatOfficeDetail(office, vendor.primaryOfficeId, graph));
        return {
            id: vendor.id,
            companyName: vendor.companyName,
            normalizedName: vendor.normalizedName,
            isActive: vendor.isActive,
            notes: vendor.notes,
            primaryOfficeId: vendor.primaryOfficeId,
            countries,
            vendorTypes,
            officeCount: officeDetails.length,
            offices: officeDetails,
            createdAt: vendor.createdAt,
            updatedAt: vendor.updatedAt,
        };
    }
    formatOfficeSummary(office, primaryOfficeId) {
        return {
            id: office.id,
            officeName: office.officeName,
            cityName: office.cityName,
            stateName: office.stateName,
            countryName: office.countryName,
            externalCode: office.externalCode,
            isPrimary: primaryOfficeId === office.id,
            isActive: office.isActive,
        };
    }
    formatOfficeDetail(office, primaryOfficeId, graph) {
        const contacts = graph.contactsByOfficeId
            .get(office.id)
            ?.map((contact) => this.formatContact(contact)) ?? [];
        const ccRecipients = graph.ccRecipientsByOfficeId
            .get(office.id)
            ?.map((recipient) => this.formatCcRecipient(recipient)) ?? [];
        const vendorTypes = (graph.typesByOfficeId.get(office.id) ?? []).map((vendorType) => this.formatVendorType(vendorType));
        const ports = (graph.portsByOfficeId.get(office.id) ?? []).map((port) => this.formatPort(port));
        const serviceLocations = (graph.serviceLocationsByOfficeId.get(office.id) ?? []).map((serviceLocation) => this.formatServiceLocation(serviceLocation));
        return {
            id: office.id,
            vendorId: office.vendorId,
            officeName: office.officeName,
            cityName: office.cityName,
            stateName: office.stateName,
            countryName: office.countryName,
            addressRaw: office.addressRaw,
            externalCode: office.externalCode,
            specializationRaw: office.specializationRaw,
            isActive: office.isActive,
            isPrimary: primaryOfficeId === office.id,
            capabilities: {
                isIataCertified: office.isIataCertified,
                doesSeaFreight: office.doesSeaFreight,
                doesProjectCargo: office.doesProjectCargo,
                doesOwnConsolidation: office.doesOwnConsolidation,
                doesOwnTransportation: office.doesOwnTransportation,
                doesOwnWarehousing: office.doesOwnWarehousing,
                doesOwnCustomClearance: office.doesOwnCustomClearance,
            },
            vendorTypes,
            ports,
            serviceLocations,
            contacts,
            ccRecipients,
            createdAt: office.createdAt,
            updatedAt: office.updatedAt,
        };
    }
    formatContact(contact) {
        return {
            id: contact.id,
            contactName: contact.contactName,
            salutation: contact.salutation,
            designation: contact.designation,
            emailPrimary: contact.emailPrimary,
            emailSecondary: contact.emailSecondary,
            mobile1: contact.mobile1,
            mobile2: contact.mobile2,
            landline: contact.landline,
            whatsappNumber: contact.whatsappNumber,
            isPrimary: contact.isPrimary,
            isActive: contact.isActive,
            notes: contact.notes,
            createdAt: contact.createdAt,
            updatedAt: contact.updatedAt,
        };
    }
    formatCcRecipient(recipient) {
        return {
            id: recipient.id,
            email: recipient.email,
            isActive: recipient.isActive,
            createdAt: recipient.createdAt,
            updatedAt: recipient.updatedAt,
        };
    }
    formatPort(port) {
        return {
            id: port.id,
            code: port.code,
            name: port.name,
            cityName: port.cityName,
            stateName: port.stateName,
            countryName: port.countryName,
            portMode: port.portMode,
            isActive: port.isActive,
            notes: port.notes,
        };
    }
    formatServiceLocation(serviceLocation) {
        return {
            id: serviceLocation.id,
            name: serviceLocation.name,
            cityName: serviceLocation.cityName,
            stateName: serviceLocation.stateName,
            countryName: serviceLocation.countryName,
            locationKind: serviceLocation.locationKind,
            isActive: serviceLocation.isActive,
            notes: serviceLocation.notes,
        };
    }
    collectVendorTypes(offices, graph) {
        const seen = new Map();
        for (const office of offices) {
            for (const vendorType of graph.typesByOfficeId.get(office.id) ?? []) {
                seen.set(vendorType.id, vendorType);
            }
        }
        return Array.from(seen.values())
            .sort((left, right) => left.sortOrder === right.sortOrder
            ? left.typeName.localeCompare(right.typeName)
            : left.sortOrder - right.sortOrder)
            .map((vendorType) => this.formatVendorType(vendorType));
    }
    pickPrimaryOffice(vendor, offices) {
        if (offices.length === 0) {
            return null;
        }
        if (vendor.primaryOfficeId) {
            const primaryOffice = offices.find((office) => office.id === vendor.primaryOfficeId);
            if (primaryOffice) {
                return primaryOffice;
            }
        }
        return offices[0];
    }
    pickPrimaryContact(primaryOffice, offices, graph) {
        const pickFromOffice = (office) => {
            if (!office) {
                return null;
            }
            const contacts = graph.contactsByOfficeId.get(office.id) ?? [];
            return (contacts.find((contact) => contact.isPrimary) ?? contacts[0] ?? null);
        };
        const primaryContact = pickFromOffice(primaryOffice);
        if (primaryContact) {
            return primaryContact;
        }
        for (const office of offices) {
            const contact = pickFromOffice(office);
            if (contact) {
                return contact;
            }
        }
        return null;
    }
    async replaceOfficeTypeLinks(manager, officeId, typeIds) {
        const repo = manager.getRepository(vendor_office_type_map_entity_1.VendorOfficeTypeMap);
        await repo.delete({ officeId });
        if (typeIds.length === 0) {
            return;
        }
        await repo.save(typeIds.map((vendorTypeId) => repo.create({
            officeId,
            vendorTypeId,
            isActive: true,
        })));
    }
    async replaceOfficePorts(manager, officeId, portIds) {
        const repo = manager.getRepository(vendor_office_port_entity_1.VendorOfficePort);
        await repo.delete({ officeId });
        if (portIds.length === 0) {
            return;
        }
        await repo.save(portIds.map((portId, index) => repo.create({
            officeId,
            portId,
            isPrimary: index === 0,
            notes: null,
        })));
    }
    async replaceOfficeContacts(manager, officeId, contacts) {
        const repo = manager.getRepository(vendor_contact_entity_1.VendorContact);
        await repo.delete({ officeId });
        if (contacts.length === 0) {
            return;
        }
        await repo.save(contacts.map((contact) => repo.create({
            officeId,
            contactName: (0, vendor_validation_1.requireVendorContactName)(contact.contactName),
            salutation: (0, vendor_normalization_1.normalizeVendorSalutation)(contact.salutation),
            designation: (0, vendor_normalization_1.normalizeVendorDesignation)(contact.designation),
            emailPrimary: (0, vendor_normalization_1.normalizeVendorEmail)(contact.emailPrimary),
            emailSecondary: (0, vendor_normalization_1.normalizeVendorEmail)(contact.emailSecondary),
            mobile1: (0, vendor_normalization_1.normalizeVendorPhone)(contact.mobile1),
            mobile2: (0, vendor_normalization_1.normalizeVendorPhone)(contact.mobile2),
            landline: (0, vendor_normalization_1.normalizeVendorPhone)(contact.landline),
            whatsappNumber: (0, vendor_normalization_1.normalizeVendorPhone)(contact.whatsappNumber),
            isPrimary: contact.isPrimary ?? false,
            isActive: contact.isActive ?? true,
            notes: (0, vendor_normalization_1.normalizeVendorNotes)(contact.notes),
        })));
    }
    async replaceOfficeCcRecipients(manager, officeId, ccRecipients) {
        const repo = manager.getRepository(vendor_cc_recipient_entity_1.VendorCcRecipient);
        await repo.delete({ officeId });
        const uniqueRecipients = new Map();
        for (const recipient of ccRecipients) {
            const email = (0, vendor_normalization_1.normalizeVendorEmail)(recipient.email);
            if (!email) {
                continue;
            }
            uniqueRecipients.set(email, {
                email,
                isActive: recipient.isActive ?? true,
            });
        }
        if (uniqueRecipients.size === 0) {
            return;
        }
        await repo.save(Array.from(uniqueRecipients.values()).map((recipient) => repo.create({
            officeId,
            email: recipient.email,
            isActive: recipient.isActive ?? true,
        })));
    }
    async assertValidOfficeRelations(typeIds, portIds) {
        if (typeIds && typeIds.length > 0) {
            const found = await this.vendorTypeRepo.countBy({
                id: (0, typeorm_2.In)(typeIds),
                isActive: true,
            });
            if (found !== typeIds.length) {
                throw new common_1.NotFoundException('One or more vendor types were not found');
            }
        }
        if (portIds && portIds.length > 0) {
            const found = await this.portRepo.countBy({
                id: (0, typeorm_2.In)(portIds),
                isActive: true,
            });
            if (found !== portIds.length) {
                throw new common_1.NotFoundException('One or more ports were not found');
            }
        }
    }
    async findVendorOrThrow(id) {
        const vendor = await this.vendorRepo.findOne({ where: { id } });
        if (!vendor) {
            throw new common_1.NotFoundException('Vendor not found');
        }
        return vendor;
    }
    async findOfficeOrThrow(id) {
        const office = await this.officeRepo.findOne({ where: { id } });
        if (!office) {
            throw new common_1.NotFoundException('Vendor office not found');
        }
        return office;
    }
    async ensureOfficeBelongsToVendor(officeId, vendorId) {
        const office = await this.officeRepo.findOne({ where: { id: officeId } });
        if (!office || office.vendorId !== vendorId) {
            throw new common_1.NotFoundException('Primary office was not found for this vendor');
        }
    }
    async ensureOfficeNameUnique(vendorId, officeName, currentOfficeId) {
        const normalizedOfficeName = (0, vendor_normalization_1.normalizeVendorOfficeName)(officeName);
        const match = await this.officeRepo
            .createQueryBuilder('office')
            .where('office.vendorId = :vendorId', { vendorId })
            .andWhere('LOWER(office.officeName) = LOWER(:officeName)', {
            officeName: normalizedOfficeName ?? officeName,
        })
            .getOne();
        if (match && match.id !== currentOfficeId) {
            throw new common_1.ConflictException('An office with the same name already exists');
        }
    }
    async findPortOrThrow(id) {
        const port = await this.portRepo.findOne({ where: { id } });
        if (!port) {
            throw new common_1.NotFoundException('Port not found');
        }
        return port;
    }
    async ensurePortCodeUnique(portMode, code, currentPortId) {
        const existing = await this.portRepo.findOne({
            where: { portMode, code },
        });
        if (existing && existing.id !== currentPortId) {
            throw new common_1.ConflictException(`A ${portMode.toLowerCase()} with code ${code} already exists`);
        }
    }
    async replacePortAliases(manager, port, aliases) {
        const aliasRepo = manager.getRepository(port_alias_entity_1.PortAlias);
        await aliasRepo.delete({ portId: port.id });
        const dedupedAliases = new Map();
        let hasPrimary = false;
        for (const input of aliases) {
            const aliasValue = normalizePortValue(input.alias);
            const normalizedAlias = normalizePortLookupKey(input.alias);
            if (!aliasValue || !normalizedAlias) {
                continue;
            }
            const countryName = normalizePortValue(input.countryName);
            const dedupeKey = [
                normalizedAlias,
                (countryName ?? '').toUpperCase(),
            ].join('::');
            if (dedupedAliases.has(dedupeKey)) {
                continue;
            }
            const isPrimary = Boolean(input.isPrimary) && !hasPrimary;
            if (isPrimary) {
                hasPrimary = true;
            }
            dedupedAliases.set(dedupeKey, aliasRepo.create({
                portId: port.id,
                alias: aliasValue,
                normalizedAlias,
                countryName,
                portMode: port.portMode,
                isPrimary,
                sourceWorkbook: normalizePortValue(input.sourceWorkbook),
                sourceSheet: normalizePortValue(input.sourceSheet),
            }));
        }
        if (dedupedAliases.size === 0) {
            return;
        }
        await aliasRepo.save(Array.from(dedupedAliases.values()));
    }
    async loadLinkedOfficeCounts(portIds) {
        if (portIds.length === 0) {
            return new Map();
        }
        const rows = await this.officePortRepo
            .createQueryBuilder('officePort')
            .select('officePort.portId', 'portId')
            .addSelect('COUNT(*)', 'count')
            .where('officePort.portId IN (:...portIds)', { portIds })
            .groupBy('officePort.portId')
            .getRawMany();
        return new Map(rows.map((row) => [row.portId, Number(row.count ?? 0)]));
    }
    formatPortMasterAdminItem(port, aliases, linkedOfficeCount) {
        return {
            id: port.id,
            code: port.code,
            name: port.name,
            cityName: port.cityName,
            stateName: port.stateName,
            countryName: port.countryName,
            portMode: port.portMode,
            unlocode: port.unlocode,
            sourceConfidence: port.sourceConfidence,
            isActive: port.isActive,
            notes: port.notes,
            aliasCount: aliases.length,
            linkedOfficeCount,
            aliases: aliases.map((alias) => this.formatPortAlias(alias)),
            createdAt: port.createdAt,
            updatedAt: port.updatedAt,
        };
    }
    formatPortMasterAdminDetail(port, aliases, linkedOfficeCount) {
        return {
            ...this.formatPortMasterAdminItem(port, aliases, linkedOfficeCount),
            normalizedName: port.normalizedName,
            normalizedCityName: port.normalizedCityName,
            normalizedCountryName: port.normalizedCountryName,
            regionId: port.regionId,
        };
    }
    formatPortAlias(alias) {
        return {
            id: alias.id,
            alias: alias.alias,
            normalizedAlias: alias.normalizedAlias,
            countryName: alias.countryName,
            portMode: alias.portMode,
            isPrimary: alias.isPrimary,
            sourceWorkbook: alias.sourceWorkbook,
            sourceSheet: alias.sourceSheet,
            createdAt: alias.createdAt,
            updatedAt: alias.updatedAt,
        };
    }
};
exports.VendorsService = VendorsService;
exports.VendorsService = VendorsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(vendor_master_entity_1.VendorMaster, 'business')),
    __param(1, (0, typeorm_1.InjectRepository)(vendor_office_entity_1.VendorOffice, 'business')),
    __param(2, (0, typeorm_1.InjectRepository)(vendor_contact_entity_1.VendorContact, 'business')),
    __param(3, (0, typeorm_1.InjectRepository)(vendor_cc_recipient_entity_1.VendorCcRecipient, 'business')),
    __param(4, (0, typeorm_1.InjectRepository)(vendor_type_master_entity_1.VendorTypeMaster, 'business')),
    __param(5, (0, typeorm_1.InjectRepository)(vendor_office_type_map_entity_1.VendorOfficeTypeMap, 'business')),
    __param(6, (0, typeorm_1.InjectRepository)(vendor_office_port_entity_1.VendorOfficePort, 'business')),
    __param(7, (0, typeorm_1.InjectRepository)(vendor_office_service_location_entity_1.VendorOfficeServiceLocation, 'business')),
    __param(8, (0, typeorm_1.InjectRepository)(port_master_entity_1.PortMaster, 'business')),
    __param(9, (0, typeorm_1.InjectRepository)(port_alias_entity_1.PortAlias, 'business')),
    __param(10, (0, typeorm_1.InjectRepository)(service_location_master_entity_1.ServiceLocationMaster, 'business')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], VendorsService);
function groupBy(items, keySelector) {
    const groups = new Map();
    for (const item of items) {
        const key = keySelector(item);
        const existing = groups.get(key);
        if (existing) {
            existing.push(item);
            continue;
        }
        groups.set(key, [item]);
    }
    return groups;
}
function groupMappedBy(items, keySelector, valueSelector) {
    const groups = new Map();
    for (const item of items) {
        const value = valueSelector(item);
        if (!value) {
            continue;
        }
        const key = keySelector(item);
        const existing = groups.get(key);
        if (existing) {
            existing.push(value);
            continue;
        }
        groups.set(key, [value]);
    }
    return groups;
}
function isNonEmpty(value) {
    return Boolean(value && value.trim());
}
function normalizePortValue(value) {
    if (!value) {
        return null;
    }
    const trimmed = value.trim().replace(/\s+/g, ' ');
    return trimmed ? trimmed : null;
}
function normalizePortLookupKey(value) {
    const normalized = normalizePortValue(value);
    if (!normalized) {
        return null;
    }
    return normalized
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Za-z0-9]+/g, ' ')
        .trim()
        .replace(/\s+/g, ' ')
        .toUpperCase();
}
function requirePortName(value) {
    const normalized = normalizePortValue(value);
    if (!normalized) {
        throw new common_1.BadRequestException('Port name is required');
    }
    return normalized;
}
function requirePortCountryName(value) {
    const normalized = normalizePortValue(value);
    if (!normalized) {
        throw new common_1.BadRequestException('Country name is required');
    }
    return normalized;
}
function requirePortCode(value) {
    const normalized = normalizePortCode(value);
    if (!normalized) {
        throw new common_1.BadRequestException('Port code is required');
    }
    return normalized;
}
function normalizePortCode(value) {
    const normalized = normalizePortValue(value);
    return normalized ? normalized.toUpperCase() : null;
}
function normalizePortNotes(value) {
    return normalizePortValue(value);
}
//# sourceMappingURL=vendors.service.js.map