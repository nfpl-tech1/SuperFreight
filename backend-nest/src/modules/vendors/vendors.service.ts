import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  buildPaginationMeta,
  parsePaginationParams,
} from '../../common/pagination/pagination.helpers';
import { findByIdOrThrow } from '../../common/persistence/find-or-throw.helpers';
import {
  groupBy,
  groupMappedBy,
  isNonEmpty,
} from '../../common/utils/collection.helpers';
import {
  Brackets,
  EntityManager,
  In,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import {
  buildLegacyServiceLocationId,
  parseLegacyServiceLocationId,
  resolveVendorSelectionContext,
  VendorLocationKind,
  VendorLocationScope,
} from './domain/vendor-selection-context';
import {
  normalizeVendorAddress,
  normalizeVendorDesignation,
  normalizeVendorEmail,
  normalizeVendorExternalCode,
  normalizeVendorFreeText,
  normalizeVendorLocationName,
  normalizeVendorNameKey,
  normalizeVendorNotes,
  normalizeVendorOfficeName,
  normalizeVendorPhone,
  normalizeVendorSalutation,
} from './domain/vendor-normalization';
import {
  assertSinglePrimaryContact,
  requireVendorCompanyName,
  requireVendorContactName,
  resolveVendorOfficeName,
} from './domain/vendor-validation';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { ListVendorLocationOptionsDto } from './dto/list-vendor-location-options.dto';
import { CreateVendorOfficeDto } from './dto/create-vendor-office.dto';
import { CreatePortMasterDto } from './dto/create-port-master.dto';
import { ListPortMasterDto } from './dto/list-port-master.dto';
import { ListVendorsDto } from './dto/list-vendors.dto';
import { PortMasterAliasInputDto } from './dto/port-master-alias-input.dto';
import { UpdatePortMasterDto } from './dto/update-port-master.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { UpdateVendorOfficeDto } from './dto/update-vendor-office.dto';
import { VendorCcRecipientInputDto } from './dto/vendor-cc-recipient-input.dto';
import { VendorContactInputDto } from './dto/vendor-contact-input.dto';
import { PortAlias } from './entities/port-alias.entity';
import { PortMaster, PortMode } from './entities/port-master.entity';
import { ServiceLocationMaster } from './entities/service-location-master.entity';
import { VendorCcRecipient } from './entities/vendor-cc-recipient.entity';
import { VendorContact } from './entities/vendor-contact.entity';
import { VendorMaster } from './entities/vendor-master.entity';
import { VendorOfficePort } from './entities/vendor-office-port.entity';
import { VendorOfficeServiceLocation } from './entities/vendor-office-service-location.entity';
import { VendorOfficeTypeMap } from './entities/vendor-office-type-map.entity';
import { VendorOffice } from './entities/vendor-office.entity';
import { VendorTypeMaster } from './entities/vendor-type-master.entity';

type VendorGraph = {
  vendorsById: Map<string, VendorMaster>;
  officesByVendorId: Map<string, VendorOffice[]>;
  contactsByOfficeId: Map<string, VendorContact[]>;
  ccRecipientsByOfficeId: Map<string, VendorCcRecipient[]>;
  portsByOfficeId: Map<string, PortMaster[]>;
  serviceLocationsByOfficeId: Map<string, ServiceLocationMaster[]>;
  typesByOfficeId: Map<string, VendorTypeMaster[]>;
};

type OfficeUpdatePlan = {
  nextCityName: string | null;
  nextStateName: string | null;
  nextCountryName: string | null;
  nextExternalCode: string | null;
  shouldRefreshOfficeName: boolean;
  nextOfficeName: string;
};

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(VendorMaster, 'business')
    private readonly vendorRepo: Repository<VendorMaster>,
    @InjectRepository(VendorOffice, 'business')
    private readonly officeRepo: Repository<VendorOffice>,
    @InjectRepository(VendorContact, 'business')
    private readonly contactRepo: Repository<VendorContact>,
    @InjectRepository(VendorCcRecipient, 'business')
    private readonly ccRepo: Repository<VendorCcRecipient>,
    @InjectRepository(VendorTypeMaster, 'business')
    private readonly vendorTypeRepo: Repository<VendorTypeMaster>,
    @InjectRepository(VendorOfficeTypeMap, 'business')
    private readonly officeTypeMapRepo: Repository<VendorOfficeTypeMap>,
    @InjectRepository(VendorOfficePort, 'business')
    private readonly officePortRepo: Repository<VendorOfficePort>,
    @InjectRepository(VendorOfficeServiceLocation, 'business')
    private readonly officeServiceLocationRepo: Repository<VendorOfficeServiceLocation>,
    @InjectRepository(PortMaster, 'business')
    private readonly portRepo: Repository<PortMaster>,
    @InjectRepository(PortAlias, 'business')
    private readonly portAliasRepo: Repository<PortAlias>,
    @InjectRepository(ServiceLocationMaster, 'business')
    private readonly serviceLocationRepo: Repository<ServiceLocationMaster>,
  ) {}

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
        .getRawMany<{ countryName: string }>(),
    ]);

    return {
      vendorTypes: vendorTypes.map((vendorType) =>
        this.formatVendorType(vendorType),
      ),
      countries: countryRows.map((row) => row.countryName),
    };
  }

  async getLocationOptions(query: ListVendorLocationOptionsDto) {
    const { page, pageSize } = parsePaginationParams(
      query.page,
      query.pageSize,
      { pageSize: 20 },
    );
    const context = resolveVendorSelectionContext({
      quoteTypeContext: query.quoteTypeContext,
      shipmentMode: query.shipmentMode,
    });
    const useContextDefaults = Boolean(query.quoteTypeContext);
    const locationKind =
      query.locationKind ??
      (useContextDefaults
        ? context.locationKind
        : VendorLocationKind.PORT);
    const typeCodes =
      query.typeCodes && query.typeCodes.length > 0
        ? query.typeCodes
        : useContextDefaults
          ? context.defaultTypeCodes
          : [];

    if (locationKind === VendorLocationKind.PORT) {
      return this.listPortLocationOptions({
        page,
        pageSize,
        countryName: query.countryName,
        portMode:
          query.portMode ??
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

  async listPortMaster(query: ListPortMasterDto) {
    const { page, pageSize } = parsePaginationParams(
      query.page,
      query.pageSize,
      { pageSize: 25 },
    );
    const baseQuery = this.buildPortMasterListQuery(query);

    const totalResult = await baseQuery
      .clone()
      .select('COUNT(DISTINCT port.id)', 'count')
      .getRawOne<{ count: string }>();
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
      .getRawMany<{ id: string }>();

    const portIds = idRows.map((row) => row.id);
    const [ports, aliases, linkedOfficeCounts] = await Promise.all([
      portIds.length === 0
        ? Promise.resolve([])
        : this.portRepo.findBy({ id: In(portIds) }),
      portIds.length === 0
        ? Promise.resolve([])
        : this.portAliasRepo.find({
            where: { portId: In(portIds) },
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
        .filter((port): port is PortMaster => Boolean(port))
        .map((port) =>
          this.formatPortMasterAdminItem(
            port,
            aliasesByPortId.get(port.id) ?? [],
            linkedOfficeCounts.get(port.id) ?? 0,
          ),
        ),
      ...buildPaginationMeta(total, page, pageSize),
    };
  }

  async getPortMasterDetail(id: string) {
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

    return this.formatPortMasterAdminDetail(
      port,
      aliases,
      linkedOfficeCounts.get(port.id) ?? 0,
    );
  }

  async createPortMaster(dto: CreatePortMasterDto) {
    const code = requirePortCode(dto.code);
    const portMode = dto.portMode;
    await this.ensurePortCodeUnique(portMode, code);

    const created = await this.portRepo.manager.transaction(async (manager) => {
      const portRepo = manager.getRepository(PortMaster);
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

  async updatePortMaster(id: string, dto: UpdatePortMasterDto) {
    const port = await this.findPortOrThrow(id);
    const nextCode =
      dto.code !== undefined ? requirePortCode(dto.code) : port.code;
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
      const portRepo = manager.getRepository(PortMaster);
      await portRepo.save(port);

      if (dto.aliases !== undefined) {
        await this.replacePortAliases(manager, port, dto.aliases);
      }
    });

    return this.getPortMasterDetail(port.id);
  }

  async listVendors(query: ListVendorsDto) {
    const { page, pageSize } = parsePaginationParams(
      query.page,
      query.pageSize,
      { pageSize: 25 },
    );
    const baseQuery = this.buildVendorListQuery(query);

    const totalResult = await baseQuery
      .clone()
      .select('COUNT(DISTINCT vendor.id)', 'count')
      .getRawOne<{ count: string }>();
    const total = Number(totalResult?.count ?? 0);

    const rows = await baseQuery
      .clone()
      .select('vendor.id', 'id')
      .addSelect('vendor.companyName', 'companyName')
      .distinct(true)
      .orderBy('vendor.companyName', 'ASC')
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .getRawMany<{ id: string }>();

    const vendorIds = rows.map((row) => row.id);
    const graph = await this.loadVendorGraph(vendorIds);
    const items = vendorIds
      .map((vendorId) => graph.vendorsById.get(vendorId))
      .filter((vendor): vendor is VendorMaster => Boolean(vendor))
      .map((vendor) => this.formatVendorListItem(vendor, graph));

    return {
      items,
      ...buildPaginationMeta(total, page, pageSize),
    };
  }

  async getVendorDetail(id: string) {
    const vendor = await this.findVendorOrThrow(id);
    const graph = await this.loadVendorGraph([vendor.id]);
    return this.formatVendorDetail(vendor, graph);
  }

  async createVendor(dto: CreateVendorDto) {
    const companyName = requireVendorCompanyName(dto.companyName);
    const normalizedName = normalizeVendorNameKey(companyName);
    if (!normalizedName) {
      throw new BadRequestException('Company name is required');
    }

    const existing = await this.vendorRepo.findOne({
      where: { normalizedName },
    });
    if (existing) {
      throw new ConflictException('Vendor already exists');
    }

    const vendor = this.vendorRepo.create({
      companyName,
      normalizedName,
      isActive: dto.isActive ?? true,
      notes: normalizeVendorNotes(dto.notes),
      primaryOfficeId: null,
    });

    const saved = await this.vendorRepo.save(vendor);
    return this.getVendorDetail(saved.id);
  }

  async updateVendor(id: string, dto: UpdateVendorDto) {
    const vendor = await this.findVendorOrThrow(id);

    if (dto.companyName !== undefined) {
      const companyName = requireVendorCompanyName(dto.companyName);
      const normalizedName = normalizeVendorNameKey(companyName);
      const existing = await this.vendorRepo.findOne({
        where: { normalizedName },
      });
      if (existing && existing.id !== vendor.id) {
        throw new ConflictException('Vendor already exists');
      }
      vendor.companyName = companyName;
      vendor.normalizedName = normalizedName;
    }

    if (dto.isActive !== undefined) {
      vendor.isActive = dto.isActive;
    }

    if (dto.notes !== undefined) {
      vendor.notes = normalizeVendorNotes(dto.notes);
    }

    if (dto.primaryOfficeId !== undefined) {
      if (dto.primaryOfficeId) {
        await this.ensureOfficeBelongsToVendor(dto.primaryOfficeId, vendor.id);
        vendor.primaryOfficeId = dto.primaryOfficeId;
      } else {
        vendor.primaryOfficeId = null;
      }
    }

    await this.vendorRepo.save(vendor);
    return this.getVendorDetail(vendor.id);
  }

  async deleteVendor(id: string) {
    const vendor = await this.findVendorOrThrow(id);
    await this.vendorRepo.delete(vendor.id);

    return {
      success: true,
      id: vendor.id,
    };
  }

  async createOffice(vendorId: string, dto: CreateVendorOfficeDto) {
    const vendor = await this.findVendorOrThrow(vendorId);
    const cityName = normalizeVendorLocationName(dto.cityName);
    const stateName = normalizeVendorLocationName(dto.stateName);
    const countryName = normalizeVendorLocationName(dto.countryName);
    const externalCode = normalizeVendorExternalCode(dto.externalCode);
    const officeName = resolveVendorOfficeName({
      officeName: dto.officeName,
      cityName,
      stateName,
      countryName,
      externalCode,
    });

    await this.ensureOfficeNameUnique(vendor.id, officeName);
    await this.assertValidOfficeRelations(dto.typeIds, dto.portIds);
    assertSinglePrimaryContact(dto.contacts);

    const savedOffice = await this.vendorRepo.manager.transaction(
      async (manager) => {
        const officeRepo = manager.getRepository(VendorOffice);
        const vendorRepo = manager.getRepository(VendorMaster);

        const office = await officeRepo.save(
          officeRepo.create({
            vendorId: vendor.id,
            officeName,
            cityName,
            stateName,
            countryName,
            addressRaw: normalizeVendorAddress(dto.addressRaw),
            externalCode,
            specializationRaw: normalizeVendorFreeText(dto.specializationRaw),
            isActive: dto.isActive ?? true,
            isIataCertified: dto.isIataCertified ?? false,
            doesSeaFreight: dto.doesSeaFreight ?? false,
            doesProjectCargo: dto.doesProjectCargo ?? false,
            doesOwnConsolidation: dto.doesOwnConsolidation ?? false,
            doesOwnTransportation: dto.doesOwnTransportation ?? false,
            doesOwnWarehousing: dto.doesOwnWarehousing ?? false,
            doesOwnCustomClearance: dto.doesOwnCustomClearance ?? false,
          }),
        );

        await this.replaceOfficeTypeLinks(
          manager,
          office.id,
          dto.typeIds ?? [],
        );
        await this.replaceOfficePorts(manager, office.id, dto.portIds ?? []);
        await this.replaceOfficeContacts(
          manager,
          office.id,
          dto.contacts ?? [],
        );
        await this.replaceOfficeCcRecipients(
          manager,
          office.id,
          dto.ccRecipients ?? [],
        );

        if (dto.isPrimary) {
          vendor.primaryOfficeId = office.id;
          await vendorRepo.save(vendor);
        }

        return office;
      },
    );

    return this.getVendorDetail(savedOffice.vendorId);
  }

  async updateOffice(officeId: string, dto: UpdateVendorOfficeDto) {
    const office = await this.findOfficeOrThrow(officeId);
    const vendor = await this.findVendorOrThrow(office.vendorId);
    const updatePlan = this.buildOfficeUpdatePlan(office, dto);

    if (updatePlan.shouldRefreshOfficeName) {
      await this.ensureOfficeNameUnique(
        vendor.id,
        updatePlan.nextOfficeName,
        office.id,
      );
    }

    await this.assertValidOfficeRelations(dto.typeIds, dto.portIds);
    assertSinglePrimaryContact(dto.contacts);

    await this.vendorRepo.manager.transaction(async (manager) => {
      const officeRepo = manager.getRepository(VendorOffice);
      const vendorRepo = manager.getRepository(VendorMaster);

      this.applyOfficeScalarUpdates(office, dto, updatePlan);

      await officeRepo.save(office);
      await this.syncOfficeRelations(manager, office.id, dto);
      await this.syncVendorPrimaryOffice(vendorRepo, vendor, office.id, dto);
    });

    return this.getVendorDetail(vendor.id);
  }

  private buildVendorListQuery(query: ListVendorsDto) {
    const context = resolveVendorSelectionContext({
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

  private buildOfficeUpdatePlan(
    office: VendorOffice,
    dto: UpdateVendorOfficeDto,
  ): OfficeUpdatePlan {
    const nextCityName =
      dto.cityName !== undefined
        ? normalizeVendorLocationName(dto.cityName)
        : office.cityName;
    const nextStateName =
      dto.stateName !== undefined
        ? normalizeVendorLocationName(dto.stateName)
        : office.stateName;
    const nextCountryName =
      dto.countryName !== undefined
        ? normalizeVendorLocationName(dto.countryName)
        : office.countryName;
    const nextExternalCode =
      dto.externalCode !== undefined
        ? normalizeVendorExternalCode(dto.externalCode)
        : office.externalCode;
    const shouldRefreshOfficeName =
      dto.officeName !== undefined ||
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
        ? resolveVendorOfficeName({
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

  private applyOfficeScalarUpdates(
    office: VendorOffice,
    dto: UpdateVendorOfficeDto,
    updatePlan: OfficeUpdatePlan,
  ) {
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
      office.addressRaw = normalizeVendorAddress(dto.addressRaw);
    }
    if (dto.externalCode !== undefined) {
      office.externalCode = updatePlan.nextExternalCode;
    }
    if (dto.specializationRaw !== undefined) {
      office.specializationRaw = normalizeVendorFreeText(dto.specializationRaw);
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

  private async syncOfficeRelations(
    manager: EntityManager,
    officeId: string,
    dto: UpdateVendorOfficeDto,
  ) {
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

  private async syncVendorPrimaryOffice(
    vendorRepo: Repository<VendorMaster>,
    vendor: VendorMaster,
    officeId: string,
    dto: UpdateVendorOfficeDto,
  ) {
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

  private resolveVendorListTypeCodes(
    query: ListVendorsDto,
    defaultTypeCodes: string[],
  ) {
    return query.typeCodes && query.typeCodes.length > 0
      ? query.typeCodes
      : defaultTypeCodes;
  }

  private createVendorListBaseQuery() {
    return this.vendorRepo
      .createQueryBuilder('vendor')
      .leftJoin(VendorOffice, 'office', 'office.vendorId = vendor.id')
      .leftJoin(VendorContact, 'contact', 'contact.officeId = office.id')
      .leftJoin(
        VendorOfficeTypeMap,
        'officeType',
        'officeType.officeId = office.id AND officeType.isActive = :officeTypeActive',
        { officeTypeActive: true },
      )
      .leftJoin(
        VendorTypeMaster,
        'vendorType',
        'vendorType.id = officeType.vendorTypeId AND vendorType.isActive = :vendorTypeActive',
        { vendorTypeActive: true },
      );
  }

  private applyVendorListSearchFilter(
    qb: SelectQueryBuilder<VendorMaster>,
    search?: string,
  ) {
    if (!search) {
      return;
    }

    qb.andWhere(
      `(
        vendor.companyName ILIKE :search
        OR office.officeName ILIKE :search
        OR office.cityName ILIKE :search
        OR office.countryName ILIKE :search
        OR office.externalCode ILIKE :search
        OR contact.contactName ILIKE :search
        OR contact.emailPrimary ILIKE :search
      )`,
      { search: `%${search.trim()}%` },
    );
  }

  private applyVendorListScalarFilters(
    qb: SelectQueryBuilder<VendorMaster>,
    query: ListVendorsDto,
    typeCodes: string[],
  ) {
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

  private applyVendorCapabilityFilters(
    qb: SelectQueryBuilder<VendorMaster>,
    query: ListVendorsDto,
  ) {
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
    ] as const;

    for (const capabilityFilter of capabilityFilters) {
      this.applyCapabilityFilter(
        qb,
        capabilityFilter.alias,
        capabilityFilter.condition,
        capabilityFilter.value,
      );
    }
  }

  private buildPortMasterListQuery(query: ListPortMasterDto) {
    const qb = this.portRepo.createQueryBuilder('port');

    if (query.search) {
      const search = `%${query.search.trim()}%`;
      qb.leftJoin(PortAlias, 'alias', 'alias.portId = port.id');
      qb.andWhere(
        new Brackets((subQuery) => {
          subQuery
            .where('port.code ILIKE :search', { search })
            .orWhere('port.name ILIKE :search', { search })
            .orWhere('port.cityName ILIKE :search', { search })
            .orWhere('port.countryName ILIKE :search', { search })
            .orWhere('port.unlocode ILIKE :search', { search })
            .orWhere('alias.alias ILIKE :search', { search });
        }),
      );
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

  private applyCapabilityFilter(
    qb: SelectQueryBuilder<VendorMaster>,
    alias: string,
    condition: string,
    value?: boolean,
  ) {
    if (value === undefined) {
      return;
    }

    const subQuery = qb
      .subQuery()
      .select('1')
      .from(VendorOffice, alias)
      .where(`${alias}.vendorId = vendor.id`)
      .andWhere(condition)
      .getQuery();

    qb.andWhere(`${value ? 'EXISTS' : 'NOT EXISTS'} (${subQuery})`);
  }

  private applyLocationScope(
    qb: SelectQueryBuilder<VendorMaster>,
    query: ListVendorsDto,
    defaultLocationKind: VendorLocationKind,
  ) {
    const locationKind = query.locationKind ?? defaultLocationKind;
    const locationScope =
      query.locationScope ??
      (query.locationId
        ? VendorLocationScope.EXACT
        : query.locationCountryName
          ? VendorLocationScope.COUNTRY
          : undefined);

    if (!locationScope) {
      return;
    }

    if (
      locationScope === VendorLocationScope.EXACT &&
      query.locationId &&
      locationKind === VendorLocationKind.PORT
    ) {
      qb.andWhere(
        `EXISTS (
          SELECT 1
          FROM "vendor_office_ports" "locationOfficePort"
          WHERE "locationOfficePort"."officeId" = office.id
            AND "locationOfficePort"."portId" = :locationId
        )`,
        { locationId: query.locationId },
      );
      return;
    }

    if (
      locationScope === VendorLocationScope.EXACT &&
      query.locationId &&
      locationKind === VendorLocationKind.SERVICE_LOCATION
    ) {
      const legacyLocation = parseLegacyServiceLocationId(query.locationId);

      if (legacyLocation) {
        qb.andWhere(
          new Brackets((locationQb) => {
            locationQb
              .where(
                `LOWER(TRIM(COALESCE(NULLIF(office."cityName", ''), NULLIF(office."officeName", ''), ''))) = :legacyLocationName`,
                {
                  legacyLocationName: legacyLocation.normalizedName,
                },
              )
              .andWhere(
                `LOWER(TRIM(COALESCE(office."countryName", ''))) = :legacyLocationCountry`,
                {
                  legacyLocationCountry: legacyLocation.normalizedCountryName,
                },
              );
          }),
        );
        return;
      }

      qb.andWhere(
        `EXISTS (
          SELECT 1
          FROM "vendor_office_service_locations" "locationOfficeService"
          WHERE "locationOfficeService"."officeId" = office.id
            AND "locationOfficeService"."serviceLocationId" = :locationId
        )`,
        { locationId: query.locationId },
      );
      return;
    }

    if (
      locationScope === VendorLocationScope.COUNTRY &&
      query.locationCountryName
    ) {
      qb.andWhere(
        new Brackets((countryQb) => {
          countryQb.where(
            'LOWER(TRIM(COALESCE(office."countryName", \'\'))) = LOWER(:locationCountryName)',
            {
              locationCountryName: query.locationCountryName?.trim(),
            },
          );

          if (locationKind === VendorLocationKind.PORT) {
            countryQb.orWhere(
              `EXISTS (
                SELECT 1
                FROM "vendor_office_ports" "countryOfficePort"
                INNER JOIN "port_master" "countryPort"
                  ON "countryPort"."id" = "countryOfficePort"."portId"
                WHERE "countryOfficePort"."officeId" = office.id
                  AND LOWER(TRIM(COALESCE("countryPort"."countryName", ''))) = LOWER(:locationCountryName)
              )`,
              {
                locationCountryName: query.locationCountryName?.trim(),
              },
            );
          } else {
            countryQb.orWhere(
              `EXISTS (
                SELECT 1
                FROM "vendor_office_service_locations" "countryOfficeService"
                INNER JOIN "service_location_master" "countryServiceLocation"
                  ON "countryServiceLocation"."id" = "countryOfficeService"."serviceLocationId"
                WHERE "countryOfficeService"."officeId" = office.id
                  AND LOWER(TRIM(COALESCE("countryServiceLocation"."countryName", ''))) = LOWER(:locationCountryName)
              )`,
              {
                locationCountryName: query.locationCountryName?.trim(),
              },
            );
          }
        }),
      );
    }
  }

  private async listPortLocationOptions(input: {
    page: number;
    pageSize: number;
    search?: string;
    countryName?: string;
    portMode?: PortMode;
    typeCodes: string[];
  }) {
    const qb = this.portRepo
      .createQueryBuilder('port')
      .where('port.isActive = :portActive', { portActive: true });

    if (input.portMode) {
      qb.andWhere('port.portMode = :portMode', { portMode: input.portMode });
    }

    if (input.countryName?.trim()) {
      qb.andWhere(
        "LOWER(TRIM(COALESCE(port.countryName, ''))) = LOWER(:countryName)",
        { countryName: input.countryName.trim() },
      );
    }

    if (input.search?.trim()) {
      const search = `%${input.search.trim()}%`;
      qb.andWhere(
        new Brackets((searchQb) => {
          searchQb
            .where('port.name ILIKE :search', { search })
            .orWhere('port.cityName ILIKE :search', { search })
            .orWhere('port.countryName ILIKE :search', { search })
            .orWhere('port.code ILIKE :search', { search })
            .orWhere(
              `EXISTS (
                SELECT 1
                FROM "port_alias" "portAlias"
                WHERE "portAlias"."portId" = port.id
                  AND "portAlias"."alias" ILIKE :search
              )`,
              { search },
            );
        }),
      );
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
    const recommendedPortIds = await this.getRecommendedPortIds(
      rows.map((port) => port.id),
      input.typeCodes,
    );

    return {
      items: rows.map((port) => ({
        id: port.id,
        kind: VendorLocationKind.PORT,
        label: port.name,
        subLabel: [port.cityName, port.countryName]
          .filter(isNonEmpty)
          .join(', '),
        countryName: port.countryName,
        portMode: port.portMode,
        recommended: recommendedPortIds.has(port.id),
      })),
      ...buildPaginationMeta(total, input.page, input.pageSize),
    };
  }

  private async listServiceLocationOptions(input: {
    page: number;
    pageSize: number;
    search?: string;
    countryName?: string;
    typeCodes: string[];
  }) {
    const canonicalQuery = this.serviceLocationRepo
      .createQueryBuilder('serviceLocation')
      .where('serviceLocation.isActive = :serviceLocationActive', {
        serviceLocationActive: true,
      });

    if (input.countryName?.trim()) {
      canonicalQuery.andWhere(
        "LOWER(TRIM(COALESCE(serviceLocation.countryName, ''))) = LOWER(:countryName)",
        { countryName: input.countryName.trim() },
      );
    }

    if (input.search?.trim()) {
      const search = `%${input.search.trim()}%`;
      canonicalQuery.andWhere(
        new Brackets((searchQb) => {
          searchQb
            .where('serviceLocation.name ILIKE :search', { search })
            .orWhere('serviceLocation.cityName ILIKE :search', { search })
            .orWhere('serviceLocation.countryName ILIKE :search', { search });
        }),
      );
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
      const recommendedServiceLocationIds =
        await this.getRecommendedServiceLocationIds(
          rows.map((serviceLocation) => serviceLocation.id),
          input.typeCodes,
        );

      return {
        items: rows.map((serviceLocation) => ({
          id: serviceLocation.id,
          kind: VendorLocationKind.SERVICE_LOCATION,
          label: serviceLocation.name,
          subLabel: [serviceLocation.cityName, serviceLocation.countryName]
            .filter(isNonEmpty)
            .join(', '),
          countryName: serviceLocation.countryName,
          portMode: null,
          recommended: recommendedServiceLocationIds.has(serviceLocation.id),
        })),
        ...buildPaginationMeta(canonicalTotal, input.page, input.pageSize),
      };
    }

    return this.listLegacyServiceLocationOptions(input);
  }

  private async listLegacyServiceLocationOptions(input: {
    page: number;
    pageSize: number;
    search?: string;
    countryName?: string;
    typeCodes: string[];
  }) {
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
      qb.andWhere(
        new Brackets((searchQb) => {
          searchQb
            .where(`${locationNameExpression} ILIKE :search`, { search })
            .orWhere('office.countryName ILIKE :search', { search })
            .orWhere('office.stateName ILIKE :search', { search });
        }),
      );
    }

    if (input.typeCodes.length > 0) {
      qb.innerJoin(
        'vendor_office_type_map',
        'officeType',
        'officeType."officeId" = office.id AND officeType."isActive" = true',
      ).innerJoin(
        'vendor_type_master',
        'vendorType',
        'vendorType.id = officeType."vendorTypeId" AND vendorType."isActive" = true AND vendorType."typeCode" IN (:...typeCodes)',
        { typeCodes: input.typeCodes },
      );
    }

    const rows = await qb
      .groupBy(locationNameExpression)
      .addGroupBy(normalizedLocationExpression)
      .addGroupBy(`NULLIF(TRIM(office."stateName"), '')`)
      .addGroupBy(`TRIM(COALESCE(office."countryName", ''))`)
      .addGroupBy(normalizedCountryExpression)
      .orderBy(`TRIM(COALESCE(office."countryName", ''))`, 'ASC')
      .addOrderBy(locationNameExpression, 'ASC')
      .getRawMany<{
        label: string;
        normalizedName: string;
        stateName: string | null;
        countryName: string;
        normalizedCountryName: string;
      }>();

    const total = rows.length;
    const pagedRows = rows.slice(
      (input.page - 1) * input.pageSize,
      (input.page - 1) * input.pageSize + input.pageSize,
    );

    return {
      items: pagedRows.map((row) => ({
        id: buildLegacyServiceLocationId(
          row.normalizedName,
          row.normalizedCountryName,
        ),
        kind: VendorLocationKind.SERVICE_LOCATION,
        label: row.label,
        subLabel: [row.stateName, row.countryName]
          .filter(isNonEmpty)
          .join(', '),
        countryName: row.countryName,
        portMode: null,
        recommended: false,
      })),
      ...buildPaginationMeta(total, input.page, input.pageSize),
    };
  }

  private async getRecommendedPortIds(portIds: string[], typeCodes: string[]) {
    if (portIds.length === 0 || typeCodes.length === 0) {
      return new Set<string>();
    }

    const rows = await this.officePortRepo
      .createQueryBuilder('officePort')
      .select('officePort.portId', 'portId')
      .innerJoin(
        VendorOffice,
        'office',
        'office.id = officePort.officeId AND office.isActive = true',
      )
      .innerJoin(
        VendorOfficeTypeMap,
        'officeType',
        'officeType.officeId = office.id AND officeType.isActive = true',
      )
      .innerJoin(
        VendorTypeMaster,
        'vendorType',
        'vendorType.id = officeType.vendorTypeId AND vendorType.isActive = true',
      )
      .where('officePort.portId IN (:...portIds)', { portIds })
      .andWhere('vendorType.typeCode IN (:...typeCodes)', { typeCodes })
      .groupBy('officePort.portId')
      .getRawMany<{ portId: string }>();

    return new Set(rows.map((row) => row.portId));
  }

  private async getRecommendedServiceLocationIds(
    serviceLocationIds: string[],
    typeCodes: string[],
  ) {
    if (serviceLocationIds.length === 0 || typeCodes.length === 0) {
      return new Set<string>();
    }

    const rows = await this.officeServiceLocationRepo
      .createQueryBuilder('officeServiceLocation')
      .select('officeServiceLocation.serviceLocationId', 'serviceLocationId')
      .innerJoin(
        VendorOffice,
        'office',
        'office.id = officeServiceLocation.officeId AND office.isActive = true',
      )
      .innerJoin(
        VendorOfficeTypeMap,
        'officeType',
        'officeType.officeId = office.id AND officeType.isActive = true',
      )
      .innerJoin(
        VendorTypeMaster,
        'vendorType',
        'vendorType.id = officeType.vendorTypeId AND vendorType.isActive = true',
      )
      .where(
        'officeServiceLocation.serviceLocationId IN (:...serviceLocationIds)',
        { serviceLocationIds },
      )
      .andWhere('vendorType.typeCode IN (:...typeCodes)', { typeCodes })
      .groupBy('officeServiceLocation.serviceLocationId')
      .getRawMany<{ serviceLocationId: string }>();

    return new Set(rows.map((row) => row.serviceLocationId));
  }

  private async loadVendorGraph(vendorIds: string[]): Promise<VendorGraph> {
    const emptyGraph: VendorGraph = {
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
      this.vendorRepo.findBy({ id: In(vendorIds) }),
      this.officeRepo.find({
        where: { vendorId: In(vendorIds) },
        order: { officeName: 'ASC', createdAt: 'ASC' },
      }),
    ]);

    const officeIds = offices.map((office) => office.id);
    const [
      contacts,
      ccRecipients,
      officeTypeMaps,
      officePorts,
      officeServiceLocations,
    ] =
      officeIds.length === 0
        ? [[], [], [], [], []]
        : await Promise.all([
            this.contactRepo.find({
              where: { officeId: In(officeIds) },
              order: {
                isPrimary: 'DESC',
                contactName: 'ASC',
                createdAt: 'ASC',
              },
            }),
            this.ccRepo.find({
              where: { officeId: In(officeIds) },
              order: { email: 'ASC' },
            }),
            this.officeTypeMapRepo.find({
              where: { officeId: In(officeIds), isActive: true },
              order: { createdAt: 'ASC' },
            }),
            this.officePortRepo.find({
              where: { officeId: In(officeIds) },
              order: { isPrimary: 'DESC', createdAt: 'ASC' },
            }),
            this.officeServiceLocationRepo.find({
              where: { officeId: In(officeIds) },
              order: { isPrimary: 'DESC', createdAt: 'ASC' },
            }),
          ]);

    const vendorTypeIds = Array.from(
      new Set(officeTypeMaps.map((row) => row.vendorTypeId)),
    );
    const portIds = Array.from(new Set(officePorts.map((row) => row.portId)));
    const serviceLocationIds = Array.from(
      new Set(officeServiceLocations.map((row) => row.serviceLocationId)),
    );
    const [vendorTypes, ports, serviceLocations] = await Promise.all([
      vendorTypeIds.length === 0
        ? Promise.resolve([])
        : this.vendorTypeRepo.findBy({ id: In(vendorTypeIds) }),
      portIds.length === 0
        ? Promise.resolve([])
        : this.portRepo.findBy({ id: In(portIds) }),
      serviceLocationIds.length === 0
        ? Promise.resolve([])
        : this.serviceLocationRepo.findBy({ id: In(serviceLocationIds) }),
    ]);

    const vendorTypesById = new Map(vendorTypes.map((row) => [row.id, row]));
    const portsById = new Map(ports.map((row) => [row.id, row]));
    const serviceLocationsById = new Map(
      serviceLocations.map((row) => [row.id, row]),
    );

    return {
      vendorsById: new Map(vendors.map((vendor) => [vendor.id, vendor])),
      officesByVendorId: groupBy(offices, (office) => office.vendorId),
      contactsByOfficeId: groupBy(contacts, (contact) => contact.officeId),
      ccRecipientsByOfficeId: groupBy(
        ccRecipients,
        (recipient) => recipient.officeId,
      ),
      portsByOfficeId: groupMappedBy(
        officePorts,
        (officePort) => officePort.officeId,
        (officePort) => portsById.get(officePort.portId),
      ),
      serviceLocationsByOfficeId: groupMappedBy(
        officeServiceLocations,
        (officeServiceLocation) => officeServiceLocation.officeId,
        (officeServiceLocation) =>
          serviceLocationsById.get(officeServiceLocation.serviceLocationId),
      ),
      typesByOfficeId: groupMappedBy(
        officeTypeMaps,
        (officeType) => officeType.officeId,
        (officeType) => vendorTypesById.get(officeType.vendorTypeId),
      ),
    };
  }

  private formatVendorType(vendorType: VendorTypeMaster) {
    return {
      id: vendorType.id,
      typeCode: vendorType.typeCode,
      typeName: vendorType.typeName,
      description: vendorType.description,
      sortOrder: vendorType.sortOrder,
      isActive: vendorType.isActive,
    };
  }

  private formatVendorListItem(vendor: VendorMaster, graph: VendorGraph) {
    const offices = graph.officesByVendorId.get(vendor.id) ?? [];
    const primaryOffice = this.pickPrimaryOffice(vendor, offices);
    const primaryContact = this.pickPrimaryContact(
      primaryOffice,
      offices,
      graph,
    );
    const vendorTypes = this.collectVendorTypes(offices, graph);
    const capabilities = this.aggregateVendorCapabilities(offices);
    const countries = Array.from(
      new Set(offices.map((office) => office.countryName).filter(isNonEmpty)),
    ).sort((left, right) => left.localeCompare(right));
    const contactCount = offices.reduce(
      (sum, office) =>
        sum + (graph.contactsByOfficeId.get(office.id)?.length ?? 0),
      0,
    );

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

  private aggregateVendorCapabilities(offices: VendorOffice[]) {
    return offices.reduce(
      (accumulator, office) => ({
        isIataCertified: accumulator.isIataCertified || office.isIataCertified,
        doesSeaFreight: accumulator.doesSeaFreight || office.doesSeaFreight,
        doesProjectCargo:
          accumulator.doesProjectCargo || office.doesProjectCargo,
        doesOwnConsolidation:
          accumulator.doesOwnConsolidation || office.doesOwnConsolidation,
        doesOwnTransportation:
          accumulator.doesOwnTransportation || office.doesOwnTransportation,
        doesOwnWarehousing:
          accumulator.doesOwnWarehousing || office.doesOwnWarehousing,
        doesOwnCustomClearance:
          accumulator.doesOwnCustomClearance || office.doesOwnCustomClearance,
      }),
      {
        isIataCertified: false,
        doesSeaFreight: false,
        doesProjectCargo: false,
        doesOwnConsolidation: false,
        doesOwnTransportation: false,
        doesOwnWarehousing: false,
        doesOwnCustomClearance: false,
      },
    );
  }

  private formatVendorDetail(vendor: VendorMaster, graph: VendorGraph) {
    const offices = graph.officesByVendorId.get(vendor.id) ?? [];
    const vendorTypes = this.collectVendorTypes(offices, graph);
    const countries = Array.from(
      new Set(offices.map((office) => office.countryName).filter(isNonEmpty)),
    ).sort((left, right) => left.localeCompare(right));
    const officeDetails = offices.map((office) =>
      this.formatOfficeDetail(office, vendor.primaryOfficeId, graph),
    );

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

  private formatOfficeSummary(
    office: VendorOffice,
    primaryOfficeId: string | null,
  ) {
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

  private formatOfficeDetail(
    office: VendorOffice,
    primaryOfficeId: string | null,
    graph: VendorGraph,
  ) {
    const contacts =
      graph.contactsByOfficeId
        .get(office.id)
        ?.map((contact) => this.formatContact(contact)) ?? [];
    const ccRecipients =
      graph.ccRecipientsByOfficeId
        .get(office.id)
        ?.map((recipient) => this.formatCcRecipient(recipient)) ?? [];
    const vendorTypes = (graph.typesByOfficeId.get(office.id) ?? []).map(
      (vendorType) => this.formatVendorType(vendorType),
    );
    const ports = (graph.portsByOfficeId.get(office.id) ?? []).map((port) =>
      this.formatPort(port),
    );
    const serviceLocations = (
      graph.serviceLocationsByOfficeId.get(office.id) ?? []
    ).map((serviceLocation) => this.formatServiceLocation(serviceLocation));

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

  private formatContact(contact: VendorContact) {
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

  private formatCcRecipient(recipient: VendorCcRecipient) {
    return {
      id: recipient.id,
      email: recipient.email,
      isActive: recipient.isActive,
      createdAt: recipient.createdAt,
      updatedAt: recipient.updatedAt,
    };
  }

  private formatPort(port: PortMaster) {
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

  private formatServiceLocation(serviceLocation: ServiceLocationMaster) {
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

  private collectVendorTypes(offices: VendorOffice[], graph: VendorGraph) {
    const seen = new Map<string, VendorTypeMaster>();
    for (const office of offices) {
      for (const vendorType of graph.typesByOfficeId.get(office.id) ?? []) {
        seen.set(vendorType.id, vendorType);
      }
    }

    return Array.from(seen.values())
      .sort((left, right) =>
        left.sortOrder === right.sortOrder
          ? left.typeName.localeCompare(right.typeName)
          : left.sortOrder - right.sortOrder,
      )
      .map((vendorType) => this.formatVendorType(vendorType));
  }

  private pickPrimaryOffice(vendor: VendorMaster, offices: VendorOffice[]) {
    if (offices.length === 0) {
      return null;
    }

    if (vendor.primaryOfficeId) {
      const primaryOffice = offices.find(
        (office) => office.id === vendor.primaryOfficeId,
      );
      if (primaryOffice) {
        return primaryOffice;
      }
    }

    return offices[0];
  }

  private pickPrimaryContact(
    primaryOffice: VendorOffice | null,
    offices: VendorOffice[],
    graph: VendorGraph,
  ) {
    const pickFromOffice = (office: VendorOffice | null) => {
      if (!office) {
        return null;
      }
      const contacts = graph.contactsByOfficeId.get(office.id) ?? [];
      return (
        contacts.find((contact) => contact.isPrimary) ?? contacts[0] ?? null
      );
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

  private async replaceOfficeTypeLinks(
    manager: EntityManager,
    officeId: string,
    typeIds: string[],
  ) {
    const repo = manager.getRepository(VendorOfficeTypeMap);
    await repo.delete({ officeId });

    if (typeIds.length === 0) {
      return;
    }

    await repo.save(
      typeIds.map((vendorTypeId) =>
        repo.create({
          officeId,
          vendorTypeId,
          isActive: true,
        }),
      ),
    );
  }

  private async replaceOfficePorts(
    manager: EntityManager,
    officeId: string,
    portIds: string[],
  ) {
    const repo = manager.getRepository(VendorOfficePort);
    await repo.delete({ officeId });

    if (portIds.length === 0) {
      return;
    }

    await repo.save(
      portIds.map((portId, index) =>
        repo.create({
          officeId,
          portId,
          isPrimary: index === 0,
          notes: null,
        }),
      ),
    );
  }

  private async replaceOfficeContacts(
    manager: EntityManager,
    officeId: string,
    contacts: VendorContactInputDto[],
  ) {
    const repo = manager.getRepository(VendorContact);
    await repo.delete({ officeId });

    if (contacts.length === 0) {
      return;
    }

    await repo.save(
      contacts.map((contact) =>
        repo.create({
          officeId,
          contactName: requireVendorContactName(contact.contactName),
          salutation: normalizeVendorSalutation(contact.salutation),
          designation: normalizeVendorDesignation(contact.designation),
          emailPrimary: normalizeVendorEmail(contact.emailPrimary),
          emailSecondary: normalizeVendorEmail(contact.emailSecondary),
          mobile1: normalizeVendorPhone(contact.mobile1),
          mobile2: normalizeVendorPhone(contact.mobile2),
          landline: normalizeVendorPhone(contact.landline),
          whatsappNumber: normalizeVendorPhone(contact.whatsappNumber),
          isPrimary: contact.isPrimary ?? false,
          isActive: contact.isActive ?? true,
          notes: normalizeVendorNotes(contact.notes),
        }),
      ),
    );
  }

  private async replaceOfficeCcRecipients(
    manager: EntityManager,
    officeId: string,
    ccRecipients: VendorCcRecipientInputDto[],
  ) {
    const repo = manager.getRepository(VendorCcRecipient);
    await repo.delete({ officeId });

    const uniqueRecipients = new Map<string, VendorCcRecipientInputDto>();
    for (const recipient of ccRecipients) {
      const email = normalizeVendorEmail(recipient.email);
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

    await repo.save(
      Array.from(uniqueRecipients.values()).map((recipient) =>
        repo.create({
          officeId,
          email: recipient.email,
          isActive: recipient.isActive ?? true,
        }),
      ),
    );
  }

  private async assertValidOfficeRelations(
    typeIds?: string[],
    portIds?: string[],
  ) {
    if (typeIds && typeIds.length > 0) {
      const found = await this.vendorTypeRepo.countBy({
        id: In(typeIds),
        isActive: true,
      });
      if (found !== typeIds.length) {
        throw new NotFoundException('One or more vendor types were not found');
      }
    }

    if (portIds && portIds.length > 0) {
      const found = await this.portRepo.countBy({
        id: In(portIds),
        isActive: true,
      });
      if (found !== portIds.length) {
        throw new NotFoundException('One or more ports were not found');
      }
    }
  }

  private async findVendorOrThrow(id: string) {
    return findByIdOrThrow(this.vendorRepo, id, 'Vendor');
  }

  private async findOfficeOrThrow(id: string) {
    return findByIdOrThrow(this.officeRepo, id, 'Vendor office not found');
  }

  private async ensureOfficeBelongsToVendor(
    officeId: string,
    vendorId: string,
  ) {
    const office = await findByIdOrThrow(
      this.officeRepo,
      officeId,
      'Primary office was not found for this vendor',
    );

    if (office.vendorId !== vendorId) {
      throw new NotFoundException(
        'Primary office was not found for this vendor',
      );
    }
  }

  private async ensureOfficeNameUnique(
    vendorId: string,
    officeName: string,
    currentOfficeId?: string,
  ) {
    const normalizedOfficeName = normalizeVendorOfficeName(officeName);
    const match = await this.officeRepo
      .createQueryBuilder('office')
      .where('office.vendorId = :vendorId', { vendorId })
      .andWhere('LOWER(office.officeName) = LOWER(:officeName)', {
        officeName: normalizedOfficeName ?? officeName,
      })
      .getOne();

    if (match && match.id !== currentOfficeId) {
      throw new ConflictException(
        'An office with the same name already exists',
      );
    }
  }

  private async findPortOrThrow(id: string) {
    return findByIdOrThrow(this.portRepo, id, 'Port');
  }

  private async ensurePortCodeUnique(
    portMode: PortMode,
    code: string,
    currentPortId?: string,
  ) {
    const existing = await this.portRepo.findOne({
      where: { portMode, code },
    });

    if (existing && existing.id !== currentPortId) {
      throw new ConflictException(
        `A ${portMode.toLowerCase()} with code ${code} already exists`,
      );
    }
  }

  private async replacePortAliases(
    manager: EntityManager,
    port: PortMaster,
    aliases: PortMasterAliasInputDto[],
  ) {
    const aliasRepo = manager.getRepository(PortAlias);
    await aliasRepo.delete({ portId: port.id });

    const dedupedAliases = new Map<string, PortAlias>();
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

      dedupedAliases.set(
        dedupeKey,
        aliasRepo.create({
          portId: port.id,
          alias: aliasValue,
          normalizedAlias,
          countryName,
          portMode: port.portMode,
          isPrimary,
          sourceWorkbook: normalizePortValue(input.sourceWorkbook),
          sourceSheet: normalizePortValue(input.sourceSheet),
        }),
      );
    }

    if (dedupedAliases.size === 0) {
      return;
    }

    await aliasRepo.save(Array.from(dedupedAliases.values()));
  }

  private async loadLinkedOfficeCounts(portIds: string[]) {
    if (portIds.length === 0) {
      return new Map<string, number>();
    }

    const rows = await this.officePortRepo
      .createQueryBuilder('officePort')
      .select('officePort.portId', 'portId')
      .addSelect('COUNT(*)', 'count')
      .where('officePort.portId IN (:...portIds)', { portIds })
      .groupBy('officePort.portId')
      .getRawMany<{ portId: string; count: string }>();

    return new Map(
      rows.map((row) => [row.portId, Number(row.count ?? 0)]),
    );
  }

  private formatPortMasterAdminItem(
    port: PortMaster,
    aliases: PortAlias[],
    linkedOfficeCount: number,
  ) {
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

  private formatPortMasterAdminDetail(
    port: PortMaster,
    aliases: PortAlias[],
    linkedOfficeCount: number,
  ) {
    return {
      ...this.formatPortMasterAdminItem(port, aliases, linkedOfficeCount),
      normalizedName: port.normalizedName,
      normalizedCityName: port.normalizedCityName,
      normalizedCountryName: port.normalizedCountryName,
      regionId: port.regionId,
    };
  }

  private formatPortAlias(alias: PortAlias) {
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
}

function normalizePortValue(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed : null;
}

function normalizePortLookupKey(value: string | null | undefined) {
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

function requirePortName(value: string | null | undefined) {
  const normalized = normalizePortValue(value);
  if (!normalized) {
    throw new BadRequestException('Port name is required');
  }
  return normalized;
}

function requirePortCountryName(value: string | null | undefined) {
  const normalized = normalizePortValue(value);
  if (!normalized) {
    throw new BadRequestException('Country name is required');
  }
  return normalized;
}

function requirePortCode(value: string | null | undefined) {
  const normalized = normalizePortCode(value);
  if (!normalized) {
    throw new BadRequestException('Port code is required');
  }
  return normalized;
}

function normalizePortCode(value: string | null | undefined) {
  const normalized = normalizePortValue(value);
  return normalized ? normalized.toUpperCase() : null;
}

function normalizePortNotes(value: string | null | undefined) {
  return normalizePortValue(value);
}
