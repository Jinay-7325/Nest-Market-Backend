import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from 'src/products/entities/product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  item_id: number;

  @Column({ type: 'int' })
  order_id: number;

  @Column({ type: 'int' })
  product_id: number;

  // Snapshot — preserves product name even if product is later renamed/deleted
  @Column({ type: 'varchar', length: 100 })
  product_name: string;

  // Snapshot — preserves price at time of purchase
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  product_price_at_purchase: number;

  @Column({ type: 'int' })
  purchased_quantity: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ─── Relations ───────────────────────────────────────────
  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Product, (product) => product.orderItems)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
