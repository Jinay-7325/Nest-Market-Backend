import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserAuth } from './dto/create-user-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

import { UsersService } from 'src/users/users.service';
import { loginUserAuth } from './dto/login-user.dto';
import * as bycrpt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { StringValue } from 'ms';
import { ConfigService } from '@nestjs/config';
import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async create(createAuthDto: CreateUserAuth, tenantId: number) {
    const user = await this.usersService.create({
      tenant_id: tenantId,
      ...createAuthDto,
    });
    console.log(user);
    return user;
  }

  async login(loginUserAuthDto: loginUserAuth, tenant_id: number) {
    const existingUser = await this.usersService.findByEmail(
      loginUserAuthDto.email,
      tenant_id,
    );

    if (!existingUser) {
      throw new NotFoundException('Email is not registered.');
    }
    const isMatch = await bycrpt.compare(
      loginUserAuthDto.password,
      existingUser.hashed_password,
    );
    if (!isMatch) {
      throw new UnauthorizedException('Invalid Credentials.');
    }

    const payload = {
      sub: existingUser.user_id,
      role: existingUser.user_role,
      tenant_id: existingUser.tenant_id, // 👈 Add this
    };

    const refreshToken = this.usersService.updateRefreshToken(
      existingUser.user_id,
      await this.getRefreshToken(payload),
    );
    return {
      access_token: await this.getAccessToken(payload),
    };
  }

  async getAccessToken(payload: { sub: number; role: Role }) {
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as StringValue,
    });

    return accessToken;
  }

  async getRefreshToken(payload: { sub: number; role: Role }) {
    const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN;
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as StringValue,
    });

    return accessToken;
  }
}
