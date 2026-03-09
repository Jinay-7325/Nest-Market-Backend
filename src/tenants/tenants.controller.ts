import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Tenants')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard) // 👈 apply both guards to all routes
@Roles(Role.SUPER_ADMIN) // 👈 only super admin can access all routes
@Controller('v1/tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @ApiOperation({ summary: 'Create a new tenant (Super Admin only)' })
  @Post()
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(createTenantDto);
  }

  @ApiOperation({ summary: 'Get all tenants (Super Admin only)' })
  @Get()
  findAll() {
    return this.tenantsService.findAll();
  }

  @ApiOperation({ summary: 'Get tenant by ID (Super Admin only)' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update tenant (Super Admin only)' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantsService.update(+id, updateTenantDto);
  }

  @ApiOperation({ summary: 'Delete tenant (Super Admin only)' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(+id);
  }
}
