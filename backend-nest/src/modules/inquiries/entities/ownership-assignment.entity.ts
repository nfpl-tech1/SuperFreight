import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Index('IDX_ownership_assignments_inquiryId_createdAt', [
  'inquiryId',
  'createdAt',
])
@Entity('ownership_assignments')
export class OwnershipAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  inquiryId: string;

  @Column()
  previousOwnerUserId: string;

  @Column()
  newOwnerUserId: string;

  @Column({ type: 'varchar', nullable: true })
  changedByUserId: string | null;

  @Column({ type: 'varchar', nullable: true })
  reason: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
