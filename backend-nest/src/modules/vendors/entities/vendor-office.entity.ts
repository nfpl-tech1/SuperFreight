import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Index('UQ_vendor_offices_vendorId_officeName', ['vendorId', 'officeName'], {
  unique: true,
})
@Index('IDX_vendor_offices_vendorId', ['vendorId'])
@Index('IDX_vendor_offices_country_city', ['countryName', 'cityName'])
@Index('IDX_vendor_offices_externalCode', ['externalCode'])
@Index('IDX_vendor_offices_isActive', ['isActive'])
@Entity('vendor_offices')
export class VendorOffice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  vendorId: string;

  @Column()
  officeName: string;

  @Column({ type: 'varchar', nullable: true })
  cityName: string | null;

  @Column({ type: 'varchar', nullable: true })
  stateName: string | null;

  @Column({ type: 'varchar', nullable: true })
  countryName: string | null;

  @Column({ type: 'text', nullable: true })
  addressRaw: string | null;

  @Column({ type: 'varchar', nullable: true })
  externalCode: string | null;

  @Column({ type: 'text', nullable: true })
  specializationRaw: string | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isIataCertified: boolean;

  @Column({ default: false })
  doesSeaFreight: boolean;

  @Column({ default: false })
  doesProjectCargo: boolean;

  @Column({ default: false })
  doesOwnConsolidation: boolean;

  @Column({ default: false })
  doesOwnTransportation: boolean;

  @Column({ default: false })
  doesOwnWarehousing: boolean;

  @Column({ default: false })
  doesOwnCustomClearance: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
