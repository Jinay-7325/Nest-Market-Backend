import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiSecurity,
  ApiOperation,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { multerConfig } from 'src/common/config/multer.config';
import { tenantFromHeader } from 'src/common/decorators/tenant-from-header.decorator';

@ApiTags('Products')
@ApiSecurity('x-tenant-id')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({ summary: 'Create a product (Vendor only)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR)
  @Post()
  create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser('tenant_id') tenant_id: number,
    @CurrentUser('sub') user_id: number,
  ) {
    return this.productsService.create(createProductDto, tenant_id, user_id);
  }

  @ApiOperation({ summary: 'Get all products with optional filters' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'category_id', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @Get()
  findAll(
    @tenantFromHeader() tenant_id: string,
    @Query() filters: FilterProductDto,
  ) {
    return this.productsService.findAll(+tenant_id, filters);
  }

  @ApiOperation({ summary: 'Get one product by ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update product (Vendor own / Admin)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR, Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser('sub') user_id: number,
    @CurrentUser('role') user_role: Role,
    @CurrentUser('tenant_id') tenant_id: number,
  ) {
    return this.productsService.update(
      +id,
      updateProductDto,
      user_id,
      user_role,
      tenant_id,
    );
  }

  @ApiOperation({ summary: 'Deactivate product (Vendor own / Admin)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR, Role.ADMIN)
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser('sub') user_id: number,
    @CurrentUser('role') user_role: Role,
  ) {
    return this.productsService.remove(+id, user_id, user_role);
  }

  @ApiOperation({
    summary: 'Upload product images (max 5, JPG/PNG, <2MB each)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR, Role.ADMIN)
  @Post(':id/images')
  @UseInterceptors(FilesInterceptor('images', 5, multerConfig))
  uploadImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser('sub') user_id: number,
    @CurrentUser('role') user_role: Role,
  ) {
    return this.productsService.addImages(+id, files, user_id, user_role);
  }

  @ApiOperation({ summary: 'Delete a product image' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR, Role.ADMIN)
  @Delete('images/:imageId')
  removeImage(
    @Param('imageId') imageId: string,
    @CurrentUser('sub') user_id: number,
    @CurrentUser('role') user_role: Role,
  ) {
    return this.productsService.removeImage(+imageId, user_id, user_role);
  }
}
