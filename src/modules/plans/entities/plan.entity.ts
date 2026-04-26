import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Subscription } from '../../subscriptions/entities/subscription.entity';

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ default: 'ETB' })
  currency: string;

  @Column()
  interval: string; // 'MONTHLY', 'YEARLY'

  @Column('text', { nullable: true })
  description: string;

  @Column('jsonb', { nullable: true })
  features: any;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Subscription, (sub) => sub.plan)
  subscriptions: Subscription[];
}
