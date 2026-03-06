import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // Admin/Super Admin — all logs for tenant
  @Roles(Role.ADMIN)
  @Get()
  findAll(@CurrentUser('tenant_id') tenant_id: number) {
    return this.inventoryService.findAll(tenant_id);
  }

  // Vendor/Admin — logs for specific product
  @Roles(Role.VENDOR, Role.ADMIN)
  @Get('product/:id')
  findByProduct(@Param('id') id: number) {
    return this.inventoryService.findByProduct(+id);
  }
}
