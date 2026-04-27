import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Index('IDX_freight_quotes_createdAt', ['createdAt'])
@Index('IDX_freight_quotes_inquiryId_createdAt', ['inquiryId', 'createdAt'])
@Index('IDX_freight_quotes_rfqId', ['rfqId'])
@Index('IDX_freight_quotes_vendorId', ['vendorId'])
@Index('IDX_freight_quotes_inboundMessageId', ['inboundMessageId'])
@Index('IDX_freight_quotes_rfqId_vendorId_isLatestVersion', [
  'rfqId',
  'vendorId',
  'isLatestVersion',
])
@Entity('freight_quotes')
export class FreightQuote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  inquiryId: string;

  @Column({ type: 'varchar', nullable: true })
  rfqId: string | null;

  @Column({ type: 'varchar', nullable: true })
  vendorId: string | null;

  @Column()
  vendorName: string;

  @Column({ type: 'varchar', nullable: true })
  currency: string | null;

  @Column({ type: 'numeric', nullable: true })
  totalRate: number | null;

  @Column({ type: 'numeric', nullable: true })
  freightRate: number | null;

  @Column({ type: 'numeric', nullable: true })
  localCharges: number | null;

  @Column({ type: 'numeric', nullable: true })
  documentation: number | null;

  @Column({ type: 'int', nullable: true })
  transitDays: number | null;

  @Column({ type: 'date', nullable: true })
  validUntil: string | null;

  @Column({ type: 'varchar', nullable: true })
  sourceThreadRefId: string | null;

  @Column({ type: 'varchar', nullable: true })
  inboundMessageId: string | null;

  @Column({ type: 'timestamp', nullable: true })
  receivedAt: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  extractedFields: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  comparisonFields: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  quotePromptSnapshot: Record<string, unknown> | null;

  @Column({ type: 'varchar', nullable: true })
  reviewStatus: string | null;

  @Column({ type: 'int', default: 1 })
  versionNumber: number;

  @Column({ default: true })
  isLatestVersion: boolean;

  @Column({ type: 'numeric', nullable: true })
  extractionConfidence: number | null;

  @Column({ type: 'varchar', nullable: true })
  reviewedByUserId: string | null;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  remarks: string | null;

  @Column({ default: false })
  isSelected: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
