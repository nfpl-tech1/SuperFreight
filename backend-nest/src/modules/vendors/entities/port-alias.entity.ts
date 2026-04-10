import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PortMode } from './port-master.entity';

@Index('IDX_port_alias_portId', ['portId'])
@Index(
  'IDX_port_alias_normalizedAlias_countryName_portMode',
  ['normalizedAlias', 'countryName', 'portMode'],
)
@Entity('port_alias')
export class PortAlias {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  portId: string;

  @Column()
  alias: string;

  @Column()
  normalizedAlias: string;

  @Column({ type: 'varchar', nullable: true })
  countryName: string | null;

  @Column({ type: 'enum', enum: PortMode, nullable: true })
  portMode: PortMode | null;

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
