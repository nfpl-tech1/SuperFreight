import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Index('UQ_vendor_cc_recipients_officeId_email', ['officeId', 'email'], {
  unique: true,
})
@Index('IDX_vendor_cc_recipients_officeId', ['officeId'])
@Entity('vendor_cc_recipients')
export class VendorCcRecipient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  officeId: string;

  @Column()
  email: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
