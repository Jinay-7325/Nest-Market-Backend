import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, tenant_id: number) {
    const category = await this.categoryRepository.save({
      tenant_id,
      ...createCategoryDto,
    });
    return category;
  }

  async findAll(tenant_id: number) {
    return await this.categoryRepository.find({
      where: { tenant_id: tenant_id },
    });
  }
}
