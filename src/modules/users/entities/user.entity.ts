import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Membership } from '../../memberships/entities/membership.entity';
import { Role } from '../../rbac/roles/entities/role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false, nullable: true })
  password?: string;

  @Column({ unique: true, nullable: true })
  googleId?: string;

  @Column({ unique: true, nullable: true })
  facebookId?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  @OneToMany(() => Membership, (membership) => membership.user)
  memberships: Membership[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
