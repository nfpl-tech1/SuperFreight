import {
  Entity,
  Column,
  PrimaryColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserDepartment } from './user-department.entity';
import { UserRoleAssignment } from './user-role-assignment.entity';

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

/**
 * Core user record.
 * - id: UUID assigned on creation (stateless, portable across DB migrations)
 * - isActive: immediate kick-out flag — JwtStrategy rejects inactive users on every request
 * - refreshTokenVersion: bump to force logout on all devices without a token blacklist
 * - azureAdId: links the record to Microsoft identity for SSO
 */
@Entity('users')
export class User {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
  osUserId: string | null;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Column({ default: false })
  isAppAdmin: boolean;

  @Column({ default: false })
  isTeamLead: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'varchar', nullable: true })
  userType: string | null;

  @Column({ type: 'varchar', nullable: true })
  departmentSlug: string | null;

  @Column({ type: 'varchar', nullable: true })
  departmentName: string | null;

  @Column({ type: 'varchar', nullable: true })
  orgId: string | null;

  @Column({ type: 'varchar', nullable: true })
  orgName: string | null;

  @Column({ type: 'timestamp', nullable: true })
  outlookConnectedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  emailSignature: string | null;

  @Column({ type: 'jsonb', nullable: true })
  lastLoginContext: Record<string, unknown> | null;

  @OneToMany(() => UserDepartment, (dept) => dept.user, {
    cascade: true,
    eager: true,
  })
  departments: UserDepartment[];

  @OneToMany(() => UserRoleAssignment, (assignment) => assignment.user, {
    cascade: true,
    eager: true,
  })
  roleAssignments: UserRoleAssignment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
