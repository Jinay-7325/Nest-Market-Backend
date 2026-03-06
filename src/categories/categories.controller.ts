import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { tenantFromHeader } from 'src/common/decorators/tenant-from-header.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentUser('tenant_id') tenant_id: number,
  ) {
    return this.categoriesService.create(createCategoryDto, tenant_id);
  }

  @Get()
  findAll(@tenantFromHeader() tenant_id: string) {
    return this.categoriesService.findAll(+tenant_id);
  }
}
