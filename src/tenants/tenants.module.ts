import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { Tenant } from './entities/tenant.entity';
import { AuthModule } from 'src/auth/auth.module';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant]), // 👈 register entity
    AuthModule, // 👈 gives access to JwtAuthGuard
  ],
  controllers: [TenantsController],
  providers: [TenantsService, RolesGuard],
})
export class TenantsModule {}
