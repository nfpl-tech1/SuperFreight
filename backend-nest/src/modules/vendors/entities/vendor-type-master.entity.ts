import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum VendorTypeCode {
  TRANSPORTER = 'TRANSPORTER',
  CFS_BUFFER_YARD = 'CFS_BUFFER_YARD',
  CHA = 'CHA',
  IATA = 'IATA',
  CO_LOADER = 'CO_LOADER',
  CARRIER = 'CARRIER',
  SHIPPING_LINE = 'SHIPPING_LINE',
  PACKER = 'PACKER',
  LICENSING = 'LICENSING',
  WCA_AGENT = 'WCA_AGENT',
}

@Index('UQ_vendor_type_master_typeCode', ['typeCode'], { unique: true })
@Index('IDX_vendor_type_master_sortOrder_isActive', ['sortOrder', 'isActive'])
@Entity('vendor_type_master')
export class VendorTypeMaster {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  typeCode: VendorTypeCode;

  @Column()
  typeName: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
