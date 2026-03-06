import { Role } from 'src/common/enums/role.enum';
import { InventoryLog } from 'src/inventory/entities/inventory-log.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Product } from 'src/products/entities/product.entity';
import { DailySalesSummary } from 'src/sales/entities/daily-sales-summary.entity';
import { Tenant } from 'src/tenants/entities/tenant.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
@Unique('uniqueEmailPerTenant', ['email', 'tenant_id']) // ✅ Move to class level
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ type: 'varchar', length: 50 })
  username: string;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  hashed_password: string;

  @Column({ type: 'enum', enum: Role, default: Role.CUSTOMER })
  user_role: Role;

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  hashed_refresh_token: string | null;

  @Column({ type: 'int', nullable: true }) // ✅ add nullable: true to match your SQL
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

  // ❌ Remove this — uniqueEmailPerTenant is not a real column
}
