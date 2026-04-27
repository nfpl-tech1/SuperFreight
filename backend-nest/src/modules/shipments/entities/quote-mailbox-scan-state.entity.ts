import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Index('UQ_quote_mailbox_scan_states_mailboxOwnerUserId', ['mailboxOwnerUserId'], {
  unique: true,
})
@Entity('quote_mailbox_scan_states')
export class QuoteMailboxScanState {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  mailboxOwnerUserId: string;

  @Column({ type: 'timestamp', nullable: true })
  lastReceivedAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  lastMessageId: string | null;

  @Column({ type: 'timestamp', nullable: true })
  lastScanStartedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  lastScanCompletedAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  lastScanStatus: string | null;

  @Column({ type: 'text', nullable: true })
  lastError: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
