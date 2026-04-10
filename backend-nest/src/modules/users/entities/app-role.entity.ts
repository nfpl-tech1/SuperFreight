import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RolePermission } from './role-permission.entity';
import { RoleScopeRule } from './role-scope-rule.entity';
import { UserRoleAssignment } from './user-role-assignment.entity';

@Entity('app_roles')
export class AppRole {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @Column({ default: false })
  isSystem: boolean;

  @OneToMany(() => RolePermission, (permission) => permission.role, {
    cascade: true,
    eager: true,
  })
  permissions: RolePermission[];

  @OneToMany(() => RoleScopeRule, (scope) => scope.role, {
    cascade: true,
    eager: true,
  })
  scopeRules: RoleScopeRule[];

  @OneToMany(() => UserRoleAssignment, (assignment) => assignment.role)
  userAssignments: UserRoleAssignment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
