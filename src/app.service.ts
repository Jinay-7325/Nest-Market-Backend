import { Injectable } from '@nestjs/common';
import { Role } from './common/enums/role.enum';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>, // 👈 inject repo
    private readonly configService: ConfigService,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  // async onApplicationBootstrap() {
  //   await this.createDefaultAdmin();
  // }

  // private async createDefaultAdmin() {
  //   const adminExists = await this.userRepository.findOne({
  //     where: { user_role: Role.ADMIN },
  //   });

  //   if (adminExists) {
  //     console.log('Admin already exists, skipping...');
  //     return;
  //   }

  //   // 👇 get all values first with non-null assertion
  //   const username = this.configService.get<string>('ADMIN_USERNAME')!;
  //   const email = this.configService.get<string>('ADMIN_EMAIL')!;
  //   const password = this.configService.get<string>('ADMIN_PASSWORD')!;

  //   // 👇 await hash before passing to create()
  //   const hashedPassword = await bcrypt.hash(password, 10);

  //   const admin = this.userRepository.create({
  //     username,
  //     email,
  //     hashed_password: hashedPassword, // 👈 now a resolved string, not a Promise
  //     user_role: Role.ADMIN,
  //   });

  //   await this.userRepository.save(admin);
  //   console.log('✅ Default admin created successfully');
  // }
}
