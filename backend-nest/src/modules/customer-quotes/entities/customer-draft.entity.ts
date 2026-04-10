import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Index('IDX_customer_drafts_createdAt', ['createdAt'])
@Index('IDX_customer_drafts_inquiryId', ['inquiryId'])
@Index('IDX_customer_drafts_quoteId', ['quoteId'])
@Index('IDX_customer_drafts_generatedByUserId', ['generatedByUserId'])
@Entity('customer_drafts')
export class CustomerDraft {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  inquiryId: string;

  @Column()
  quoteId: string;

  @Column({ type: 'varchar', nullable: true })
  generatedByUserId: string | null;

  @Column({ type: 'numeric', nullable: true })
  marginPercent: number | null;

  @Column({ type: 'text' })
  draftBody: string;

  @Column({ type: 'varchar', nullable: true })
  subjectLine: string | null;

  @Column({ default: false })
  isSelected: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
