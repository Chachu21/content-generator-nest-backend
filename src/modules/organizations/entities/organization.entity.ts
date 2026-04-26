import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Membership } from '../../memberships/entities/membership.entity';
import { Subscription } from '../../subscriptions/entities/subscription.entity';
import { Content } from '../../contents/entities/content.entity';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  industry: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Membership, (membership) => membership.organization)
  memberships: Membership[];

  @OneToMany(() => Subscription, (subscription) => subscription.organization)
  subscriptions: Subscription[];

  @OneToMany(() => Content, (content) => content.organization)
  contents: Content[];
}
