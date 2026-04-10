import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('outlook_connections')
export class OutlookConnection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  userId: string;

  @Column({ type: 'varchar', nullable: true })
  tenantId: string | null;

  @Column({ type: 'varchar', nullable: true })
  microsoftUserId: string | null;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column({ type: 'text', nullable: true })
  accessToken: string | null;

  @Column({ type: 'text', nullable: true })
  refreshToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  accessTokenExpiresAt: Date | null;

  @Column({ default: false })
  isConnected: boolean;

  @Column({ type: 'timestamp', nullable: true })
  connectedAt: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
