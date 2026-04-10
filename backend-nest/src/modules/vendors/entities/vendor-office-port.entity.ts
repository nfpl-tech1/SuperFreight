import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Index('UQ_vendor_office_ports_officeId_portId', ['officeId', 'portId'], {
  unique: true,
})
@Index('IDX_vendor_office_ports_portId', ['portId'])
@Index('UQ_vendor_office_ports_officeId_primary', ['officeId'], {
  unique: true,
  where: '"isPrimary" = true',
})
@Entity('vendor_office_ports')
export class VendorOfficePort {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  officeId: string;

  @Column({ type: 'uuid' })
  portId: string;

  @Column({ default: false })
  isPrimary: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
