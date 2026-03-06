import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-iamge.entity';
import { InventoryModule } from 'src/inventory/inventory.module'; // 👈

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage]),
    InventoryModule, // 👈 gives access to InventoryService
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
