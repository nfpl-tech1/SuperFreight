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

@Index('IDX_role_permissions_roleId', ['roleId'])
@Unique('UQ_role_permissions_roleId_moduleKey', ['roleId', 'moduleKey'])
@Entity('role_permissions')
export class RolePermission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  roleId: string;

  @Column()
  moduleKey: string;

  @Column({ default: true })
  canView: boolean;

  @Column({ default: false })
  canEdit: boolean;

  @ManyToOne(() => AppRole, (role) => role.permissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roleId' })
  role: AppRole;
}
