import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { TenantsModule } from './tenants/tenants.module';
import { CategoriesModule } from './categories/categories.module';
import { InventoryModule } from './inventory/inventory.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from './users/entities/user.entity';
import { Tenant } from './tenants/entities/tenant.entity';
import { Product } from './products/entities/product.entity';
import { ProductImage } from './products/entities/product-iamge.entity';
import { Order } from './orders/entities/order.entity';
import { OrderConfirmationEmail } from './orders/entities/order-confirmation-email.entity';
import { Category } from './categories/entities/category.entity';
import { InventoryLog } from './inventory/entities/inventory-log.entity';
import { OrderItem } from './orders/entities/order-items.entity';
import { DailySalesSummary } from './orders/entities/daily-sales-summary.entity';
import { SeederModule } from './database/seeders/seeder.module';
import { UserSession } from './auth/entities/user-session.entity';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ScheduleModule.forRoot(), // 👈 cron jobs
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379'),
      },
    }),
    CacheModule.register({
      ttl: 60, // ✅ v7 uses SECONDS not milliseconds
      max: 100,
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
    SeederModule,
    UsersModule,
    TypeOrmModule.forFeature([User]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    AuthModule,
    OrdersModule,
    ProductsModule,
    TenantsModule,
    CategoriesModule,
    InventoryModule,

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'Root@1234',
      database: 'nest_market',
      entities: [
        User,
        Tenant,
        Product,
        ProductImage,
        Order,
        OrderConfirmationEmail,
        Category,
        InventoryLog,
        OrderItem,
        UserSession,
        DailySalesSummary,
      ],
      synchronize: false,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
