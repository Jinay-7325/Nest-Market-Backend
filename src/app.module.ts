import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { TenantsModule } from './tenants/tenants.module';
import { CategoriesModule } from './categories/categories.module';

import { SalesModule } from './sales/sales.module';
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
import { DailySalesSummary } from './sales/entities/daily-sales-summary.entity';
import jwtConfig from './config/jwt.config';
import * as Joi from 'joi';
@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([User]),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig],
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        ACCESS_TOKEN_EXPIRES_IN: Joi.string().required(),
        REFRESH_TOKEN_EXPIRES_IN: Joi.string().required(),
        ADMIN_USERNAME: Joi.string().required(),
        ADMIN_EMAIL: Joi.string().email().required(),
        ADMIN_PASSWORD: Joi.string().min(6).required(),
      }),
    }),

    AuthModule,

    OrdersModule,
    ProductsModule,
    TenantsModule,
    CategoriesModule,
    InventoryModule,
    SalesModule,
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
        DailySalesSummary,
      ],
      synchronize: false,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
