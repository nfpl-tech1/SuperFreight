import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ServiceLocationKind {
  INLAND_CITY = 'INLAND_CITY',
  ICD = 'ICD',
  CFS = 'CFS',
  WAREHOUSE_ZONE = 'WAREHOUSE_ZONE',
  CUSTOMS_NODE = 'CUSTOMS_NODE',
  AIR_CARGO_AREA = 'AIR_CARGO_AREA',
  UNKNOWN = 'UNKNOWN',
}

@Index(
  'IDX_service_location_master_kind_country_name',
  ['locationKind', 'normalizedCountryName', 'normalizedName'],
)
@Index('IDX_service_location_master_city', ['normalizedCityName'])
@Index('IDX_service_location_master_regionId', ['regionId'])
@Entity('service_location_master')
export class ServiceLocationMaster {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  normalizedName: string;

  @Column({ type: 'varchar', nullable: true })
  cityName: string | null;

  @Column({ type: 'varchar', nullable: true })
  normalizedCityName: string | null;

  @Column({ type: 'varchar', nullable: true })
  stateName: string | null;

  @Column()
  countryName: string;

  @Column()
  normalizedCountryName: string;

  @Column({ type: 'enum', enum: ServiceLocationKind })
  locationKind: ServiceLocationKind;

  @Column({ type: 'uuid', nullable: true })
  regionId: string | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
