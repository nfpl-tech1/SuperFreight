import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum QuoteInboundMessageStatus {
  IGNORED = 'ignored',
  UNMATCHED = 'unmatched',
  EXTRACTION_PENDING = 'extraction_pending',
  NEEDS_REVIEW = 'needs_review',
  FINALIZED = 'finalized',
  FAILED = 'failed',
}

@Index('UQ_quote_inbound_messages_outlookMessageId', ['outlookMessageId'], {
  unique: true,
})
@Index('IDX_quote_inbound_messages_receivedAt', ['receivedAt'])
@Index('IDX_quote_inbound_messages_status_receivedAt', ['status', 'receivedAt'])
@Index('IDX_quote_inbound_messages_matchedInquiryId', ['matchedInquiryId'])
@Index('IDX_quote_inbound_messages_matchedRfqId', ['matchedRfqId'])
@Index('IDX_quote_inbound_messages_matchedVendorId', ['matchedVendorId'])
@Entity('quote_inbound_messages')
export class QuoteInboundMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  mailboxOwnerUserId: string;

  @Column()
  outlookMessageId: string;

  @Column({ type: 'varchar', nullable: true })
  internetMessageId: string | null;

  @Column({ type: 'varchar', nullable: true })
  conversationId: string | null;

  @Column({ type: 'timestamp' })
  receivedAt: Date;

  @Column({ type: 'varchar', nullable: true })
  fromEmail: string | null;

  @Column({ type: 'varchar', nullable: true })
  fromName: string | null;

  @Column({ type: 'varchar', nullable: true })
  subject: string | null;

  @Column({ type: 'text', nullable: true })
  bodyPreview: string | null;

  @Column({ type: 'varchar', nullable: true })
  webLink: string | null;

  @Column({ default: false })
  hasAttachments: boolean;

  @Column({ type: 'varchar', nullable: true })
  matchedInquiryId: string | null;

  @Column({ type: 'varchar', nullable: true })
  matchedRfqId: string | null;

  @Column({ type: 'varchar', nullable: true })
  matchedVendorId: string | null;

  @Column({ type: 'varchar' })
  status: QuoteInboundMessageStatus;

  @Column({ type: 'varchar', nullable: true })
  ignoreReason: string | null;

  @Column({ type: 'text', nullable: true })
  failureReason: string | null;

  @Column({ type: 'jsonb', nullable: true })
  rawMetadata: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  attachmentMetadata: Record<string, unknown>[] | null;

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
