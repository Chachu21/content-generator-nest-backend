import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { User } from '../../users/entities/user.entity';

@Entity('contents')
export class Content {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  body: string;

  @Column({ nullable: true })
  language: string; // 'am', 'en'

  @Column({ default: 'DRAFT' })
  status: string; // 'DRAFT', 'PUBLISHED', 'ARCHIVED'

  @ManyToOne(() => Organization, (org) => org.contents)
  organization: Organization;

  @ManyToOne(() => User)
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
