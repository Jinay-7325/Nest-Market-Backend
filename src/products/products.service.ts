import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  ILike,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
} from 'typeorm'; // ✅ import from typeorm
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager'; // ✅ import type from cache-manager directly
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-iamge.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { InventoryService } from 'src/inventory/inventory.service';
import { InventoryChangeType } from 'src/inventory/entities/inventory-log.entity';
import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly inventoryService: InventoryService,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache, // ✅ Cache from cache-manager
  ) {}

  async create(
    createProductDto: CreateProductDto,
    tenant_id: number,
    vendor_id: number,
  ) {
    const product = await this.productRepository.save({
      ...createProductDto,
      tenant_id,
      vendor_id,
    });

    await this.inventoryService.log({
      tenant_id,
      product_id: product.product_id,
      change_type: InventoryChangeType.PURCHASE,
      quantity_change: product.available_quantity,
      previous_quantity: 0,
      new_quantity: product.available_quantity,
      performed_by: vendor_id,
      reference_type: 'manual',
    });

    await this.invalidateCache(tenant_id);
    return product;
  }

  async findAll(tenant_id: number, filters: FilterProductDto) {
    const cacheKey = `products_${tenant_id}_${JSON.stringify(filters)}`;

    const cached = await this.cacheManager.get<Product[]>(cacheKey);
    if (cached) return cached;

    const where: any = { tenant_id, status: 1 };

    if (filters.category_id) where.category_id = filters.category_id;
    if (filters.search) where.product_name = ILike(`%${filters.search}%`);

    if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
      where.product_price = Between(filters.minPrice, filters.maxPrice);
    } else if (filters.minPrice !== undefined) {
      where.product_price = MoreThanOrEqual(filters.minPrice);
    } else if (filters.maxPrice !== undefined) {
      where.product_price = LessThanOrEqual(filters.maxPrice);
    }

    const products = await this.productRepository.find({
      where,
      relations: ['images', 'category'],
    });

    await this.cacheManager.set(cacheKey, products); // ✅ v7 — no ttl as 3rd param
    return products;
  }

  async invalidateCache(tenant_id: number) {
    await this.cacheManager.del(`products_${tenant_id}_${JSON.stringify({})}`);
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { product_id: id },
      relations: ['images', 'category'],
    });
    if (!product) throw new NotFoundException(`Product #${id} not found`);
    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    user_id: number,
    user_role: Role,
    tenant_id: number,
  ) {
    const product = await this.findOne(id);

    if (user_role === Role.VENDOR && product.vendor_id !== user_id) {
      throw new ForbiddenException('You can only update your own products');
    }

    if (
      updateProductDto.available_quantity !== undefined &&
      updateProductDto.available_quantity !== product.available_quantity
    ) {
      const quantityChange =
        updateProductDto.available_quantity - product.available_quantity;
      await this.inventoryService.log({
        tenant_id,
        product_id: id,
        change_type: InventoryChangeType.MANUAL_ADJUSTMENT,
        quantity_change: quantityChange,
        previous_quantity: product.available_quantity,
        new_quantity: updateProductDto.available_quantity,
        performed_by: user_id,
        reference_type: 'manual',
      });
    }

    Object.assign(product, updateProductDto);
    const updated = await this.productRepository.save(product);
    await this.invalidateCache(tenant_id);
    return updated;
  }

  async remove(id: number, user_id: number, user_role: Role) {
    const product = await this.findOne(id);

    if (user_role === Role.VENDOR && product.vendor_id !== user_id) {
      throw new ForbiddenException('You can only delete your own products');
    }

    await this.productRepository.update(id, { status: 0 });
    await this.invalidateCache(product.tenant_id);
    return { message: `Product #${id} deactivated successfully` };
  }

  async addImages(
    product_id: number,
    files: Express.Multer.File[],
    user_id: number,
    user_role: Role,
  ) {
    const product = await this.findOne(product_id);

    if (user_role === Role.VENDOR && product.vendor_id !== user_id) {
      throw new ForbiddenException(
        'You can only add images to your own products',
      );
    }

    const images = files.map((file) =>
      this.productImageRepository.create({
        product_id,
        image_url: `/uploads/products/${file.filename}`,
      }),
    );

    return this.productImageRepository.save(images);
  }

  async removeImage(image_id: number, user_id: number, user_role: Role) {
    const image = await this.productImageRepository.findOne({
      where: { image_id },
      relations: ['product'],
    });
    if (!image) throw new NotFoundException(`Image #${image_id} not found`);

    if (user_role === Role.VENDOR && image.product.vendor_id !== user_id) {
      throw new ForbiddenException(
        'You can only remove images from your own products',
      );
    }

    await this.productImageRepository.remove(image);
    return { message: `Image #${image_id} removed successfully` };
  }
}
