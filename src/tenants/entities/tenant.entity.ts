import { Category } from 'src/categories/entities/category.entity';
import { InventoryLog } from 'src/inventory/entities/inventory-log.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Product } from 'src/products/entities/product.entity';
import { DailySalesSummary } from 'src/sales/entities/daily-sales-summary.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn()
  tenant_id: number;

  @Column({ type: 'varchar', length: 150 })
  tenant_name: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ─── Relations ───────────────────────────────────────────
  @OneToMany(() => User, (user) => user.tenant)
  users: User[];

  @OneToMany(() => Category, (category) => category.tenant)
  categories: Category[];

  @OneToMany(() => Product, (product) => product.tenant)
  products: Product[];

  @OneToMany(() => Order, (order) => order.tenant)
  orders: Order[];

  @OneToMany(() => DailySalesSummary, (summary) => summary.tenant)
  dailySalesSummaries: DailySalesSummary[];

  @OneToMany(() => InventoryLog, (log) => log.tenant)
  inventoryLogs: InventoryLog[];
}
