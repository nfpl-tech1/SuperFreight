import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Index(
  'UQ_country_region_map_normalizedCountryName_regionId',
  ['normalizedCountryName', 'regionId'],
  { unique: true },
)
@Index('IDX_country_region_map_regionId', ['regionId'])
@Entity('country_region_map')
export class CountryRegionMap {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  countryName: string;

  @Column()
  normalizedCountryName: string;

  @Column({ type: 'uuid' })
  regionId: string;

  @Column({ type: 'varchar', nullable: true })
  sourceWorkbook: string | null;

  @Column({ type: 'varchar', nullable: true })
  sourceSheet: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
