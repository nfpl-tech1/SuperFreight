import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Index('IDX_rfqs_createdAt', ['createdAt'])
@Index('IDX_rfqs_inquiryId', ['inquiryId'])
@Index('IDX_rfqs_createdByUserId', ['createdByUserId'])
@Entity('rfqs')
export class Rfq {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  inquiryId: string;

  @Column()
  inquiryNumber: string;

  @Column()
  departmentId: string;

  @Column({ type: 'varchar', nullable: true })
  createdByUserId: string | null;

  @Column({ type: 'jsonb' })
  formValues: Record<string, unknown>;

  @Column({ type: 'text', array: true, default: '{}' })
  vendorIds: string[];

  @Column({ default: false })
  sent: boolean;

  @Column({ type: 'varchar', nullable: true })
  subjectLine: string | null;

  @Column({ type: 'jsonb', nullable: true })
  promptTemplateMeta: Record<string, unknown> | null;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
