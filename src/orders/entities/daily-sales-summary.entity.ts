import { Tenant } from 'src/tenants/entities/tenant.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';

@Entity('daily_sales_summary')
@Unique('uq_vendor_date', ['date', 'vendor_id', 'tenant_id'])
export class DailySalesSummary {
  @PrimaryGeneratedColumn()
  summary_id: number;

  @Column({ type: 'date' })
  date: string; // 'YYYY-MM-DD' string — Date object can drift by timezone

  @Column({ type: 'int' })
  vendor_id: number;

  @Column({ type: 'int' })
  total_orders: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total_sales: number;

  @Column({ type: 'int' })
  tenant_id: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ─── Relations ───────────────────────────────────────────
  @ManyToOne(() => Tenant, (tenant) => tenant.dailySalesSummaries)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => User, (user) => user.dailySalesSummaries)
  @JoinColumn({ name: 'vendor_id' })
  vendor: User;
}
