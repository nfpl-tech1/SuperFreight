import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

/**
 * Immutable audit log record.
 * Written after every critical action (login, user create/update, department changes).
 * Never updated or deleted — provides a tamper-evident trail.
 */
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  userEmail: string;

  /** Human-readable action label, e.g. USER_CREATED, USER_LOGIN */
  @Column()
  action: string;

  /** The entity type affected, e.g. 'user', 'vendor', 'quote' */
  @Column({ nullable: true })
  resourceType: string;

  /** Primary key of the affected resource */
  @Column({ nullable: true })
  resourceId: string;

  /** Arbitrary extra context (request body snapshot, etc.) */
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;
}
