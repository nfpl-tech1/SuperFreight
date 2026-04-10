import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  inquiryId: string;

  @Column()
  customerName: string;

  @Column({ type: 'varchar', nullable: true })
  tradeLane: string | null;

  @Column({ type: 'varchar', nullable: true })
  currentStage: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
