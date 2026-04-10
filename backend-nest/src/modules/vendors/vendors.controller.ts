import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Audit } from '../../common/decorators/audit.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '../users/entities/user.entity';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { CreateVendorOfficeDto } from './dto/create-vendor-office.dto';
import { CreatePortMasterDto } from './dto/create-port-master.dto';
import { ListVendorLocationOptionsDto } from './dto/list-vendor-location-options.dto';
import { ListPortMasterDto } from './dto/list-port-master.dto';
import { ListVendorsDto } from './dto/list-vendors.dto';
import { UpdatePortMasterDto } from './dto/update-port-master.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { UpdateVendorOfficeDto } from './dto/update-vendor-office.dto';
import { VendorsService } from './vendors.service';

@Controller('vendors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Get('summary')
  getSummary() {
    return this.vendorsService.getCatalogSummary();
  }

  @Get('lookups')
  getLookups() {
    return this.vendorsService.getCatalogLookups();
  }

  @Get('location-options')
  getLocationOptions(@Query() query: ListVendorLocationOptionsDto) {
    return this.vendorsService.getLocationOptions(query);
  }

  @Get('port-master')
  @Roles(Role.ADMIN)
  listPortMaster(@Query() query: ListPortMasterDto) {
    return this.vendorsService.listPortMaster(query);
  }

  @Get('port-master/:id')
  @Roles(Role.ADMIN)
  getPortMasterDetail(@Param('id') id: string) {
    return this.vendorsService.getPortMasterDetail(id);
  }

  @Get()
  list(@Query() query: ListVendorsDto) {
    return this.vendorsService.listVendors(query);
  }

  @Get(':id')
  getDetail(@Param('id') id: string) {
    return this.vendorsService.getVendorDetail(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @Audit('VENDOR_CREATED', 'vendor_master')
  create(@Body() dto: CreateVendorDto) {
    return this.vendorsService.createVendor(dto);
  }

  @Post('port-master')
  @Roles(Role.ADMIN)
  @Audit('PORT_MASTER_CREATED', 'port_master')
  createPortMaster(@Body() dto: CreatePortMasterDto) {
    return this.vendorsService.createPortMaster(dto);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @Audit('VENDOR_UPDATED', 'vendor_master')
  update(@Param('id') id: string, @Body() dto: UpdateVendorDto) {
    return this.vendorsService.updateVendor(id, dto);
  }

  @Put('port-master/:id')
  @Roles(Role.ADMIN)
  @Audit('PORT_MASTER_UPDATED', 'port_master')
  updatePortMaster(@Param('id') id: string, @Body() dto: UpdatePortMasterDto) {
    return this.vendorsService.updatePortMaster(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @Audit('VENDOR_DELETED', 'vendor_master')
  remove(@Param('id') id: string) {
    return this.vendorsService.deleteVendor(id);
  }

  @Post(':vendorId/offices')
  @Roles(Role.ADMIN)
  @Audit('VENDOR_OFFICE_CREATED', 'vendor_office')
  createOffice(@Param('vendorId') vendorId: string, @Body() dto: CreateVendorOfficeDto) {
    return this.vendorsService.createOffice(vendorId, dto);
  }

  @Put('offices/:officeId')
  @Roles(Role.ADMIN)
  @Audit('VENDOR_OFFICE_UPDATED', 'vendor_office')
  updateOffice(@Param('officeId') officeId: string, @Body() dto: UpdateVendorOfficeDto) {
    return this.vendorsService.updateOffice(officeId, dto);
  }
}
