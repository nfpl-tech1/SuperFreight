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
import { User } from './user.entity';

@Index('IDX_user_role_assignments_userId', ['userId'])
@Index('IDX_user_role_assignments_roleId', ['roleId'])
@Unique('UQ_user_role_assignments_userId_roleId', ['userId', 'roleId'])
@Entity('user_role_assignments')
export class UserRoleAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  roleId: string;

  @ManyToOne(() => User, (user) => user.roleAssignments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => AppRole, (role) => role.userAssignments, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'roleId' })
  role: AppRole;
}
