import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PortMode {
  AIRPORT = 'AIRPORT',
  SEAPORT = 'SEAPORT',
}

@Index('UQ_port_master_portMode_code', ['portMode', 'code'], { unique: true })
@Index('IDX_port_master_name', ['name'])
@Index('IDX_port_master_country_city', ['countryName', 'cityName'])
@Index('IDX_port_master_portMode_isActive', ['portMode', 'isActive'])
@Entity('port_master')
export class PortMaster {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  code: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  normalizedName: string | null;

  @Column({ type: 'varchar', nullable: true })
  cityName: string | null;

  @Column({ type: 'varchar', nullable: true })
  normalizedCityName: string | null;

  @Column({ type: 'varchar', nullable: true })
  stateName: string | null;

  @Column()
  countryName: string;

  @Column({ type: 'varchar', nullable: true })
  normalizedCountryName: string | null;

  @Column({ type: 'enum', enum: PortMode })
  portMode: PortMode;

  @Column({ type: 'uuid', nullable: true })
  regionId: string | null;

  @Column({ type: 'varchar', nullable: true })
  unlocode: string | null;

  @Column({ type: 'varchar', nullable: true })
  sourceConfidence: string | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
