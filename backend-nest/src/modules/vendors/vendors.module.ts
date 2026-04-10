import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryRegionMap } from './entities/country-region-map.entity';
import { ImportSourceAudit } from './entities/import-source-audit.entity';
import { PortMaster } from './entities/port-master.entity';
import { PortAlias } from './entities/port-alias.entity';
import { RegionMaster } from './entities/region-master.entity';
import { ServiceLocationAlias } from './entities/service-location-alias.entity';
import { ServiceLocationMaster } from './entities/service-location-master.entity';
import { VendorCcRecipient } from './entities/vendor-cc-recipient.entity';
import { VendorContact } from './entities/vendor-contact.entity';
import { VendorMaster } from './entities/vendor-master.entity';
import { VendorOfficePort } from './entities/vendor-office-port.entity';
import { VendorOfficeServiceLocation } from './entities/vendor-office-service-location.entity';
import { VendorOfficeTypeMap } from './entities/vendor-office-type-map.entity';
import { VendorOffice } from './entities/vendor-office.entity';
import { VendorTypeMaster } from './entities/vendor-type-master.entity';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        CountryRegionMap,
        ImportSourceAudit,
        PortMaster,
        PortAlias,
        RegionMaster,
        ServiceLocationAlias,
        ServiceLocationMaster,
        VendorCcRecipient,
        VendorContact,
        VendorMaster,
        VendorOffice,
        VendorOfficePort,
        VendorOfficeServiceLocation,
        VendorOfficeTypeMap,
        VendorTypeMaster,
      ],
      'business',
    ),
  ],
  controllers: [VendorsController],
  providers: [VendorsService],
  exports: [VendorsService],
})
export class VendorsModule {}
