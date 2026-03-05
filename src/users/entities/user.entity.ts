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

import { Product } from 'src/products/entities/product.entity';
import { Tenant } from 'src/tenants/entities/tenant.entity';
import { Order } from 'src/orders/entities/order.entity';
import { DailySalesSummary } from 'src/sales/entities/daily-sales-summary.entity';
import { InventoryLog } from 'src/inventory/entities/inventory-log.entity';
import { Role } from 'src/common/enums/role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ type: 'varchar', length: 50 })
  username: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  // select: false → never returned in queries unless explicitly requested
  hashed_password: string;

  @Column({ type: 'enum', enum: Role, default: Role.CUSTOMER })
  user_role: Role;

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  hashed_refresh_token: string | null;

  @Column({ type: 'int' })
  tenant_id: number | null;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ─── Relations ───────────────────────────────────────────
  @ManyToOne(() => Tenant, (tenant) => tenant.users)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @OneToMany(() => Product, (product) => product.vendor)
  products: Product[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => DailySalesSummary, (summary) => summary.vendor)
  dailySalesSummaries: DailySalesSummary[];

  @OneToMany(() => InventoryLog, (log) => log.performedBy)
  inventoryLogs: InventoryLog[];
}
