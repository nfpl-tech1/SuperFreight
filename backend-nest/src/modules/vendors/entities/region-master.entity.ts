import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Index('UQ_region_master_normalizedSectorName', ['normalizedSectorName'], {
  unique: true,
})
@Index('IDX_region_master_isActive', ['isActive'])
@Entity('region_master')
export class RegionMaster {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sectorName: string;

  @Column()
  normalizedSectorName: string;

  @Column()
  displayName: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
