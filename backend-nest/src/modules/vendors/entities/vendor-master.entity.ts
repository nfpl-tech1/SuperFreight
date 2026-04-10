import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Index('UQ_vendor_master_normalizedName', ['normalizedName'], { unique: true })
@Index('IDX_vendor_master_companyName', ['companyName'])
@Index('IDX_vendor_master_isActive', ['isActive'])
@Entity('vendor_master')
export class VendorMaster {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyName: string;

  @Column()
  normalizedName: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'uuid', nullable: true })
  primaryOfficeId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
