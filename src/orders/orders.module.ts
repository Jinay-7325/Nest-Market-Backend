import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-items.entity';
import { OrderConfirmationEmail } from './entities/order-confirmation-email.entity';
import { EmailProcessor, EMAIL_QUEUE } from './processors/email.processor';
import { SalesSummaryCron } from './cron/sales-summary.cron';
import { DailySalesSummary } from 'src/orders/entities/daily-sales-summary.entity';
import { InventoryModule } from 'src/inventory/inventory.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      OrderConfirmationEmail,
      DailySalesSummary, // 👈 for cron
    ]),
    BullModule.registerQueue({
      name: EMAIL_QUEUE, // 👈 register queue
    }),
    InventoryModule, // 👈 for inventory logging
    UsersModule, // 👈 for user email lookup
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    EmailProcessor, // 👈 processes queue jobs
    SalesSummaryCron, // 👈 runs cron at 11:59 PM
  ],
})
export class OrdersModule {}
