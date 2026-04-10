import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Index('IDX_rate_sheets_effectiveMonth_shippingLine', [
  'effectiveMonth',
  'shippingLine',
])
@Entity('rate_sheets')
export class RateSheet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  shippingLine: string;

  @Column({ type: 'varchar', nullable: true })
  tradeLane: string | null;

  @Column({ type: 'varchar', nullable: true })
  currency: string | null;

  @Column({ type: 'numeric', nullable: true })
  amount: number | null;

  @Column({ type: 'date', nullable: true })
  effectiveMonth: string | null;

  @Column({ type: 'varchar', nullable: true })
  notes: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
