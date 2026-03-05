import { Category } from 'src/categories/entities/category.entity';
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
  JoinColumn,
} from 'typeorm';
import { ProductImage } from './product-iamge.entity';
import { OrderItem } from 'src/orders/entities/order-items.entity';
import { InventoryLog } from 'src/inventory/entities/inventory-log.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  product_id: number;

  @Column({ type: 'int' })
  category_id: number;

  @Column({ type: 'varchar', length: 100 })
  product_name: string;

  @Column({ type: 'text', nullable: true })
  product_description: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  product_price: number;

  @Column({ type: 'int', default: 0 })
  available_quantity: number;

  @Column({ type: 'int' })
  vendor_id: number;

  @Column({ type: 'int' })
  tenant_id: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ─── Relations ───────────────────────────────────────────
  @ManyToOne(() => Tenant, (tenant) => tenant.products)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => User, (user) => user.products)
  @JoinColumn({ name: 'vendor_id' })
  vendor: User;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true })
  images: ProductImage[];

  @OneToMany(() => OrderItem, (item) => item.product)
  orderItems: OrderItem[];

  @OneToMany(() => InventoryLog, (log) => log.product)
  inventoryLogs: InventoryLog[];
}
