import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Rfq } from './rfq.entity';

@Index('IDX_rfq_field_specs_rfqId', ['rfqId'])
@Unique('UQ_rfq_field_specs_rfqId_fieldKey', ['rfqId', 'fieldKey'])
@Entity('rfq_field_specs')
export class RfqFieldSpec {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  rfqId: string;

  @Column()
  fieldKey: string;

  @Column()
  fieldLabel: string;

  @Column({ default: false })
  isCustom: boolean;

  @ManyToOne(() => Rfq, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rfqId' })
  rfq: Rfq;
}
