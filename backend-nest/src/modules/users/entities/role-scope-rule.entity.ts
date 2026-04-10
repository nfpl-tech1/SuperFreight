import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { AppRole } from './app-role.entity';

@Index('IDX_role_scope_rules_roleId', ['roleId'])
@Unique('UQ_role_scope_rules_roleId_scopeType_scopeValue', [
  'roleId',
  'scopeType',
  'scopeValue',
])
@Entity('role_scope_rules')
export class RoleScopeRule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  roleId: string;

  @Column()
  scopeType: string;

  @Column()
  scopeValue: string;

  @ManyToOne(() => AppRole, (role) => role.scopeRules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roleId' })
  role: AppRole;
}
