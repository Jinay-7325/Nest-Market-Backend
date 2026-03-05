import { Tenant } from 'src/tenants/entities/tenant.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { OrderItem } from './order-items.entity';
import { OrderConfirmationEmail } from './order-confirmation-email.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  order_id: number;

  @Column({ type: 'int' })
  user_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_amount: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  order_time: Date;

  @Column({ type: 'int' })
  tenant_id: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ─── Relations ───────────────────────────────────────────
  @ManyToOne(() => Tenant, (tenant) => tenant.orders)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @OneToOne(() => OrderConfirmationEmail, (email) => email.order)
  confirmationEmail: OrderConfirmationEmail;
}
