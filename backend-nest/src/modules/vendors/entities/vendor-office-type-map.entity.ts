import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Index(
  'UQ_vendor_office_type_map_officeId_vendorTypeId',
  ['officeId', 'vendorTypeId'],
  { unique: true },
)
@Index('IDX_vendor_office_type_map_vendorTypeId', ['vendorTypeId'])
@Entity('vendor_office_type_map')
export class VendorOfficeTypeMap {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  officeId: string;

  @Column({ type: 'uuid' })
  vendorTypeId: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
