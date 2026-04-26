import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';

export enum MembershipRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
}

@Entity('memberships')
export class Membership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: MembershipRole,
    default: MembershipRole.VIEWER,
  })
  role: MembershipRole;

  @ManyToOne(() => User, (user) => user.memberships)
  user: User;

  @ManyToOne(() => Organization, (org) => org.memberships)
  organization: Organization;

  @CreateDateColumn()
  joinedAt: Date;
}
