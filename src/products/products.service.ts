import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { ProductImage } from './entities/product-iamge.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
  ) {}

  async create(createProductDto: CreateProductDto, tenant_id: number) {
    const product = await this.productRepository.save({
      ...createProductDto,
      tenant_id: tenant_id,
    });
    return product;
  }

  async findAll(tenant_id: number) {
    return await this.productRepository.find({
      where: { tenant_id: tenant_id },
    });
  }

  async findOne(id: number) {
    return await this.productRepository.findOne({ where: { product_id: id } });
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    return await this.productRepository.update(id, { ...updateProductDto });
  }

  async remove(id: number) {
    return await this.productRepository.update(id, { status: 0 });
  }
}
