import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum JobServicePartType {
  FREIGHT = 'FREIGHT',
  CHA = 'CHA',
  TRANSPORTATION = 'TRANSPORTATION',
}

@Index('IDX_job_service_parts_jobId', ['jobId'])
@Entity('job_service_parts')
export class JobServicePart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  jobId: string;

  @Column({ type: 'enum', enum: JobServicePartType })
  partType: JobServicePartType;

  @Column({ type: 'varchar', nullable: true })
  ownerUserId: string | null;

  @Column({ type: 'varchar', nullable: true })
  status: string | null;

  @Column({ type: 'varchar', nullable: true })
  applicationSlug: string | null;

  @Column({ type: 'jsonb', nullable: true })
  meta: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
