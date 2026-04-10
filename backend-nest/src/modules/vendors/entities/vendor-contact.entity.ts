import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Index('IDX_vendor_contacts_officeId', ['officeId'])
@Index('IDX_vendor_contacts_emailPrimary', ['emailPrimary'])
@Index('UQ_vendor_contacts_officeId_primary', ['officeId'], {
  unique: true,
  where: '"isPrimary" = true',
})
@Entity('vendor_contacts')
export class VendorContact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  officeId: string;

  @Column()
  contactName: string;

  @Column({ type: 'varchar', nullable: true })
  salutation: string | null;

  @Column({ type: 'varchar', nullable: true })
  designation: string | null;

  @Column({ type: 'varchar', nullable: true })
  emailPrimary: string | null;

  @Column({ type: 'varchar', nullable: true })
  emailSecondary: string | null;

  @Column({ type: 'varchar', nullable: true })
  mobile1: string | null;

  @Column({ type: 'varchar', nullable: true })
  mobile2: string | null;

  @Column({ type: 'varchar', nullable: true })
  landline: string | null;

  @Column({ type: 'varchar', nullable: true })
  whatsappNumber: string | null;

  @Column({ default: false })
  isPrimary: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
