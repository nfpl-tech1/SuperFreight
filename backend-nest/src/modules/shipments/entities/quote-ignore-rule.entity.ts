import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type QuoteIgnoreRuleConditions = {
  senderEmailEquals?: string[];
  senderDomainEquals?: string[];
  subjectContains?: string[];
  bodyContains?: string[];
  hasAttachments?: boolean;
  applyWhenUnmatchedOnly?: boolean;
};

@Index('IDX_quote_ignore_rules_mailboxOwnerUserId_priority', [
  'mailboxOwnerUserId',
  'priority',
])
@Index('IDX_quote_ignore_rules_isActive_priority', ['isActive', 'priority'])
@Entity('quote_ignore_rules')
export class QuoteIgnoreRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  mailboxOwnerUserId: string | null;

  @Column()
  name: string;

  @Column({ type: 'int', default: 100 })
  priority: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb' })
  conditions: QuoteIgnoreRuleConditions;

  @Column({ type: 'varchar', nullable: true })
  createdByUserId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
