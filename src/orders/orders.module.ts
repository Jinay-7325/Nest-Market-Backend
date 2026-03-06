import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-items.entity';
import { OrderConfirmationEmail } from './entities/order-confirmation-email.entity';
import { Product } from 'src/products/entities/product.entity';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, OrderConfirmationEmail]),
    ProductsModule,
  ], // Add Order and OrderItem entities here
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
