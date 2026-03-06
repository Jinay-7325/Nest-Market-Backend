import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const isExist = await this.userRepository.findOne({
      where: { email: createUserDto.email, tenant_id: createUserDto.tenant_id },
    });
    if (isExist) {
      throw new Error('email already exists.');
    }

    const password = createUserDto.password;
    const hashed_password = await bcrypt.hash(password, 10);

    const newUser = await this.userRepository.save({
      username: createUserDto.username,
      email: createUserDto.email,
      hashed_password: hashed_password,
      tenant_id: createUserDto.tenant_id,
    });
    return newUser;
  }

  findAll() {
    return this.userRepository.find();
  }

  async findByEmail(email: string, tenant_id: number) {
    const existingUser = await this.userRepository.findOne({
      where: { email: email, tenant_id: tenant_id },
    });
    return existingUser;
  }
  async findById(user_id: number) {
    const existingUser = await this.userRepository.findOne({
      where: { user_id: user_id },
    });
    return existingUser;
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashed = await bcrypt.hash(refreshToken, 10);

    await this.userRepository.update(userId, {
      hashed_refresh_token: hashed,
    });
  }

  async updateRole(id: number, role: Role, currentUserRole: Role) {
    if (currentUserRole === Role.ADMIN && role === Role.SUPER_ADMIN) {
      throw new Error('Admin cannot assign Super Admin role');
    }
    if (currentUserRole === Role.ADMIN && role === Role.ADMIN) {
      throw new Error('Admin cannot assign Admin role');
    }
    if (currentUserRole === Role.SUPER_ADMIN && role === Role.SUPER_ADMIN) {
      throw new Error('Super Admin cannot assign Super Admin role');
    }

    const result = await this.userRepository.update(id, {
      user_role: role,
    });
    if (result.affected === 0) {
      // 👈 0 means no row was found/updated
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return this.userRepository.findOne({ where: { user_id: id } });
  }
}
