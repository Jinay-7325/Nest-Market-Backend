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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiSecurity,
  ApiOperation,
} from '@nestjs/swagger';

@ApiTags('Orders')
@ApiBearerAuth('access-token')
@ApiSecurity('x-tenant-id') // 👈 was missing
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Place an order' })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser('tenant_id') tenant_id: number,
    @CurrentUser('sub') user_id: number,
  ) {
    return this.ordersService.create(createOrderDto, +tenant_id, +user_id);
  }

  @ApiOperation({ summary: 'Get all orders for tenant (Admin)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  findAll(@CurrentUser('tenant_id') tenant_id: number) {
    return this.ordersService.findAll(tenant_id);
  }

  @ApiOperation({ summary: 'Get orders by vendor (Vendor)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR)
  @Get('/vendor')
  findByVendor(
    @CurrentUser('tenant_id') tenant_id: number,
    @CurrentUser('sub') vendor_id: number,
  ) {
    return this.ordersService.findByVendor(tenant_id, vendor_id);
  }
}
