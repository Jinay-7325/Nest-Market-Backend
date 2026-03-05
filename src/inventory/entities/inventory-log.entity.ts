import { Product } from 'src/products/entities/product.entity';
import { Tenant } from 'src/tenants/entities/tenant.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum InventoryChangeType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  RETURN = 'RETURN',
  DAMAGE = 'DAMAGE',
  MANUAL_ADJUSTMENT = 'MANUAL_ADJUSTMENT',
  CANCELLED_ORDER = 'CANCELLED_ORDER',
}

@Entity('inventory_logs')
export class InventoryLog {
  @PrimaryGeneratedColumn()
  log_id: number;

  @Column({ type: 'int' })
  tenant_id: number;

  @Column({ type: 'int' })
  product_id: number;

  @Column({ type: 'enum', enum: InventoryChangeType })
  change_type: InventoryChangeType;

  @Column({ type: 'int' })
  quantity_change: number; // negative for SALE/DAMAGE, positive for PURCHASE/RETURN

  @Column({ type: 'int' })
  previous_quantity: number;

  @Column({ type: 'int' })
  new_quantity: number;

  @Column({ type: 'int', nullable: true })
  reference_id: number | null; // e.g. order_id or purchase_id

  @Column({ type: 'varchar', length: 50, nullable: true })
  reference_type: string | null; // e.g. 'order', 'manual'

  @Column({ type: 'int', nullable: true })
  performed_by: number | null; // nullable → SET NULL when user deleted

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @CreateDateColumn()
  created_at: Date; // logs are immutable — no updated_at

  // ─── Relations ───────────────────────────────────────────
  @ManyToOne(() => Tenant, (tenant) => tenant.inventoryLogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Product, (product) => product.inventoryLogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => User, (user) => user.inventoryLogs, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'performed_by' })
  performedBy: User | null;
}
