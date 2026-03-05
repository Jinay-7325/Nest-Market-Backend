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
      where: { email: createUserDto.email },
    });
    if (isExist) {
      throw new Error('email already exists.');
    }

    const password = createUserDto.password;
    const hashed_password = await bcrypt.hash(password, 10);

    const newUser = this.userRepository.save({
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

  async findByEmail(email: string) {
    const existingUser = await this.userRepository.findOne({
      where: { email: email },
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

  async updateRole(id: number, role: Role) {
    const result = await this.userRepository.update(id, {
      user_role: role,
    });
    if (result.affected === 0) {
      // 👈 0 means no row was found/updated
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return this.userRepository.findOne({ where: { user_id: id } });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
