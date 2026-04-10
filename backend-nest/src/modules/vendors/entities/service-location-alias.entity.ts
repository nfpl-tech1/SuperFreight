import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ServiceLocationKind } from './service-location-master.entity';

@Index('IDX_service_location_alias_serviceLocationId', ['serviceLocationId'])
@Index(
  'IDX_service_location_alias_normalizedAlias_country_kind',
  ['normalizedAlias', 'countryName', 'locationKind'],
)
@Entity('service_location_alias')
export class ServiceLocationAlias {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  serviceLocationId: string;

  @Column()
  alias: string;

  @Column()
  normalizedAlias: string;

  @Column({ type: 'varchar', nullable: true })
  countryName: string | null;

  @Column({ type: 'enum', enum: ServiceLocationKind, nullable: true })
  locationKind: ServiceLocationKind | null;

  @Column({ default: false })
  isPrimary: boolean;

  @Column({ type: 'varchar', nullable: true })
  sourceWorkbook: string | null;

  @Column({ type: 'varchar', nullable: true })
  sourceSheet: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
