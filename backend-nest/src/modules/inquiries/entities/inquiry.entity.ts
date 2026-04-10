import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum InquiryType {
  CHA_ONLY = 'CHA_ONLY',
  FREIGHT_ONLY = 'FREIGHT_ONLY',
  CHA_FREIGHT = 'CHA_FREIGHT',
}

export enum InquiryStatus {
  PENDING = 'PENDING',
  RFQ_SENT = 'RFQ_SENT',
  QUOTES_RECEIVED = 'QUOTES_RECEIVED',
  QUOTED_TO_CUSTOMER = 'QUOTED_TO_CUSTOMER',
  CLOSED = 'CLOSED',
}

export enum TradeLane {
  EXPORT = 'Export',
  IMPORT = 'Import',
  CROSS_TRADE = 'Cross Trade',
}

export enum ShipmentMode {
  AIR = 'AIR',
  FCL = 'FCL',
  LCL = 'LCL',
}

export enum InquiryCustomerRole {
  CONSIGNEE = 'Consignee/Agent',
  SHIPPER = 'Shipper',
}

@Index('IDX_inquiries_createdAt', ['createdAt'])
@Index('IDX_inquiries_ownerUserId_createdAt', ['ownerUserId', 'createdAt'])
@Index('IDX_inquiries_mailboxOwnerUserId_createdAt', [
  'mailboxOwnerUserId',
  'createdAt',
])
@Entity('inquiries')
export class Inquiry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  inquiryNumber: string;

  @Column({
    type: 'enum',
    enum: InquiryType,
    default: InquiryType.FREIGHT_ONLY,
  })
  inquiryType: InquiryType;

  @Column({ type: 'enum', enum: InquiryStatus, default: InquiryStatus.PENDING })
  status: InquiryStatus;

  @Column()
  customerName: string;

  @Column({ type: 'varchar', nullable: true })
  customerRole: InquiryCustomerRole | null;

  @Column({ type: 'varchar', nullable: true })
  tradeLane: string | null;

  @Column({ type: 'varchar', nullable: true })
  origin: string | null;

  @Column({ type: 'varchar', nullable: true })
  destination: string | null;

  @Column({ type: 'varchar', nullable: true })
  shipmentMode: string | null;

  @Column({ type: 'varchar', nullable: true })
  incoterm: string | null;

  @Column({ type: 'varchar', nullable: true })
  cargoSummary: string | null;

  @Column({ type: 'varchar', nullable: true })
  ownerUserId: string | null;

  @Column({ type: 'varchar', nullable: true })
  mailboxOwnerUserId: string | null;

  @Column({ type: 'varchar', nullable: true })
  latestClientThreadKey: string | null;

  @Column({ type: 'varchar', nullable: true })
  latestAgentThreadKey: string | null;

  @Column({ type: 'timestamp', nullable: true })
  firstReadAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  lastMailEventAt: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  extractedData: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  aiMeta: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
