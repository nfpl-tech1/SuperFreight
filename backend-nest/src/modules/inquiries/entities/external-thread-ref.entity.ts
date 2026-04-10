import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Index('IDX_external_thread_refs_inquiryId', ['inquiryId'])
@Entity('external_thread_refs')
export class ExternalThreadRef {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  inquiryId: string;

  @Column()
  participantType: string;

  @Column({ type: 'varchar', nullable: true })
  participantEmail: string | null;

  @Column({ type: 'varchar', nullable: true })
  conversationId: string | null;

  @Column({ type: 'varchar', nullable: true })
  messageId: string | null;

  @Column({ type: 'varchar', nullable: true })
  internetMessageId: string | null;

  @Column({ type: 'varchar', nullable: true })
  webLink: string | null;

  @Column({ type: 'timestamp', nullable: true })
  lastActivityAt: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
