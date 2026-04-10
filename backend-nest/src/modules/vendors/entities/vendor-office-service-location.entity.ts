import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Index(
  'UQ_vendor_office_service_locations_officeId_serviceLocationId',
  ['officeId', 'serviceLocationId'],
  { unique: true },
)
@Index('IDX_vendor_office_service_locations_serviceLocationId', [
  'serviceLocationId',
])
@Index('UQ_vendor_office_service_locations_officeId_primary', ['officeId'], {
  unique: true,
  where: '"isPrimary" = true',
})
@Entity('vendor_office_service_locations')
export class VendorOfficeServiceLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  officeId: string;

  @Column({ type: 'uuid' })
  serviceLocationId: string;

  @Column({ default: false })
  isPrimary: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
