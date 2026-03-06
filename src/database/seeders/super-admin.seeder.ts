import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../common/enums/role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SuperAdminSeeder implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedSuperAdmin();
  }

  private async seedSuperAdmin() {
    const existing = await this.userRepository.findOne({
      where: { user_role: Role.SUPER_ADMIN }, // ✅ Fix 1: use Role enum
    });

    if (existing) {
      console.log('✅ Super admin already exists, skipping seed.');
      return;
    }

    const password = process.env.SUPER_ADMIN_PASSWORD;
    if (!password) {
      throw new Error('SUPER_ADMIN_PASSWORD is not set in .env'); // ✅ Fix 2: guard undefined
    }

    const hashed_password = await bcrypt.hash(password, 10);

    const superAdmin = this.userRepository.create({
      username: 'superadmin', // ✅ Fix 3: added missing required fields
      email: process.env.SUPER_ADMIN_EMAIL ?? 'superadmin@app.com',
      hashed_password,
      user_role: Role.SUPER_ADMIN,
      tenant_id: null,
      status: 1,
    });

    await this.userRepository.save(superAdmin);
    console.log('🌱 Super admin created successfully.');
  }
}
