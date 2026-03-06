import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@UseGuards(JwtAuthGuard)
@Controller('v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ─── Get all users (Admin + Super Admin) ──────────────────
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  findAll(@CurrentUser('tenant_id') tenant_id: number) {
    return this.usersService.findAll(tenant_id);
  }

  // ─── Get own profile ──────────────────────────────────────
  @Get('profile')
  getProfile(@CurrentUser('sub') user_id: number) {
    return this.usersService.findById(user_id);
  }

  // ─── Get user by ID (Admin + Super Admin) ─────────────────
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.usersService.findById(+id);
  }

  // ─── Update own profile ───────────────────────────────────
  @Patch('profile')
  updateProfile(
    @CurrentUser('sub') user_id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(user_id, updateUserDto);
  }

  // ─── Update user by ID (Admin + Super Admin) ──────────────
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateProfile(+id, updateUserDto);
  }

  // ─── Update user role (Admin + Super Admin) ───────────────
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/role')
  updateRole(
    @Param('id') id: number,
    @CurrentUser('role') currentUserRole: Role,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.usersService.updateRole(
      +id,
      updateUserRoleDto.role,
      currentUserRole,
    );
  }

  // ─── Deactivate user (Admin + Super Admin) ────────────────
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  deactivate(@Param('id') id: number) {
    return this.usersService.deactivate(+id);
  }
}
