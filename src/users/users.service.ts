import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from 'src/common/enums/role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ─── Create ───────────────────────────────────────────────
  async create(createUserDto: CreateUserDto) {
    const isExist = await this.userRepository.findOne({
      where: { email: createUserDto.email, tenant_id: createUserDto.tenant_id },
    });
    if (isExist) throw new ConflictException('Email already exists.');

    const hashed_password = await bcrypt.hash(createUserDto.password, 10);
    return this.userRepository.save({
      username: createUserDto.username,
      email: createUserDto.email,
      hashed_password,
      tenant_id: createUserDto.tenant_id,
    });
  }

  // ─── Find All (scoped to tenant) ──────────────────────────
  findAll(tenant_id: number) {
    return this.userRepository.find({
      where: { tenant_id, status: 1 },
      select: [
        'user_id',
        'username',
        'email',
        'user_role',
        'status',
        'created_at',
      ],
    });
  }

  // ─── Find by Email ────────────────────────────────────────
  async findByEmail(email: string, tenant_id: number) {
    return this.userRepository.findOne({
      where: { email, tenant_id },
    });
  }

  // ─── Find by ID ───────────────────────────────────────────
  async findById(user_id: number) {
    const user = await this.userRepository.findOne({
      where: { user_id },
      select: [
        'user_id',
        'username',
        'email',
        'user_role',
        'tenant_id',
        'status',
        'created_at',
      ],
    });
    if (!user) throw new NotFoundException(`User #${user_id} not found`);
    return user;
  }

  // ─── Update Profile ───────────────────────────────────────
  async updateProfile(user_id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { user_id } });
    if (!user) throw new NotFoundException(`User #${user_id} not found`);

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  // ─── Change Password ──────────────────────────────────────
  async changePassword(
    user_id: number,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.userRepository.findOne({ where: { user_id } });
    if (!user) throw new NotFoundException(`User #${user_id} not found`);

    const isMatch = await bcrypt.compare(oldPassword, user.hashed_password);
    if (!isMatch) throw new ConflictException('Old password is incorrect');

    user.hashed_password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
    return { message: 'Password changed successfully' };
  }

  // ─── Update Role ──────────────────────────────────────────
  async updateRole(id: number, role: Role, currentUserRole: Role) {
    if (currentUserRole === Role.ADMIN && role === Role.SUPER_ADMIN) {
      throw new ConflictException('Admin cannot assign Super Admin role');
    }
    if (currentUserRole === Role.ADMIN && role === Role.ADMIN) {
      throw new ConflictException('Admin cannot assign Admin role');
    }

    const result = await this.userRepository.update(id, { user_role: role });
    if (result.affected === 0)
      throw new NotFoundException(`User #${id} not found`);

    return this.userRepository.findOne({ where: { user_id: id } });
  }

  // ─── Deactivate (soft delete) ─────────────────────────────
  async deactivate(user_id: number) {
    const result = await this.userRepository.update(user_id, { status: 0 });
    if (result.affected === 0)
      throw new NotFoundException(`User #${user_id} not found`);
    return { message: `User #${user_id} deactivated successfully` };
  }
}
