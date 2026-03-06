import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DailySalesSummary } from 'src/orders/entities/daily-sales-summary.entity';
import { OrderItem } from '../entities/order-items.entity';

@Injectable()
export class SalesSummaryCron {
  private readonly logger = new Logger(SalesSummaryCron.name);

  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(DailySalesSummary)
    private readonly summaryRepository: Repository<DailySalesSummary>,
  ) {}

  @Cron('59 23 * * *') // Every day at 11:59 PM
  async generateDailySalesSummary() {
    this.logger.log('⏰ Running Daily Sales Summary Cron...');

    const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

    // Aggregate sales by vendor and tenant for today
    const results = await this.dataSource.query(
      `
      SELECT
        p.vendor_id,
        o.tenant_id,
        COUNT(DISTINCT o.order_id) AS total_orders,
        SUM(oi.product_price_at_purchase * oi.purchased_quantity) AS total_sales
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.order_id
      JOIN products p ON oi.product_id = p.product_id
      WHERE DATE(o.order_time) = ?
        AND o.status = 1
      GROUP BY p.vendor_id, o.tenant_id
    `,
      [today],
    );

    if (!results.length) {
      this.logger.log('📭 No orders found for today.');
      return;
    }

    // Upsert each vendor's summary
    for (const row of results) {
      await this.summaryRepository
        .createQueryBuilder()
        .insert()
        .into(DailySalesSummary)
        .values({
          date: today,
          vendor_id: row.vendor_id,
          tenant_id: row.tenant_id,
          total_orders: row.total_orders,
          total_sales: row.total_sales,
        })
        .orUpdate(
          ['total_orders', 'total_sales'],
          ['date', 'vendor_id', 'tenant_id'],
        )
        .execute();
    }

    this.logger.log(
      `✅ Daily sales summary generated for ${results.length} vendors.`,
    );
  }
}
