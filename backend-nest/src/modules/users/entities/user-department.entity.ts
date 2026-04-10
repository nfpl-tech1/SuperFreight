import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

export enum Department {
  IMPORT = 'IMPORT',
  EXPORT = 'EXPORT',
  INTERNATIONAL = 'INTERNATIONAL',
}

/**
 * Junction table: one user → many departments.
 * Stored as separate rows so adding new departments requires no schema migration.
 */
@Index('IDX_user_departments_userId', ['userId'])
@Unique('UQ_user_departments_userId_department', ['userId', 'department'])
@Entity('user_departments')
export class UserDepartment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column({ type: 'enum', enum: Department })
  department: Department;

  @ManyToOne(() => User, (user) => user.departments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
