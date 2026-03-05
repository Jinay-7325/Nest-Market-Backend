import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';

export enum EmailStatus {
  REMAINING = 'remaining to sent',
  SENDING = 'sending',
  FAILED = 'failed to send',
  SUCCESS = 'sent success',
}

@Entity('order_confirmation_email')
export class OrderConfirmationEmail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  order_id: number;

  @Column({ type: 'enum', enum: EmailStatus })
  email_status: EmailStatus;

  @Column({ type: 'varchar', length: 150 })
  recipient_email: string;

  @Column({ type: 'tinyint', default: 0 })
  retry_count: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ─── Relations ───────────────────────────────────────────
  @OneToOne(() => Order, (order) => order.confirmationEmail, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
