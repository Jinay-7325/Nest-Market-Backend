import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { SessionService } from './session.service';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { loginUserAuth } from './dto/login-user.dto';
import { CreateUserAuth } from './dto/create-user-auth.dto';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/common/enums/role.enum';
import { StringValue } from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private sessionService: SessionService,
  ) {}

  async create(createAuthDto: CreateUserAuth, tenantId: number) {
    return this.usersService.create({
      tenant_id: tenantId,
      ...createAuthDto,
    });
  }

  async login(
    loginUserAuthDto: loginUserAuth,
    tenant_id: number,
    device_info?: string,
    ip_address?: string,
  ) {
    const existingUser = await this.usersService.findByEmail(
      loginUserAuthDto.email,
      tenant_id,
    );
    if (!existingUser) throw new NotFoundException('Email is not registered.');

    const isMatch = await bcrypt.compare(
      loginUserAuthDto.password,
      existingUser.hashed_password,
    );
    if (!isMatch) throw new UnauthorizedException('Invalid Credentials.');

    const payload = {
      sub: existingUser.user_id,
      role: existingUser.user_role,
      tenant_id: existingUser.tenant_id ?? tenant_id, // ✅ fix null
    };

    const refreshToken = await this.generateRefreshToken(payload); // ✅ renamed

    const session = await this.sessionService.createSession(
      existingUser.user_id,
      existingUser.tenant_id ?? tenant_id, // ✅ fix null
      refreshToken,
      device_info,
      ip_address,
    );

    return {
      access_token: await this.getAccessToken(payload),
      refresh_token: refreshToken,
      session_id: session.session_id,
    };
  }

  async refreshToken(user_id: number, role: Role, refreshToken: string) {
    const session = await this.sessionService.validateRefreshToken(
      user_id,
      refreshToken,
    );
    if (!session) throw new UnauthorizedException('Invalid refresh token');

    const user = await this.usersService.findById(user_id);
    if (!user) throw new UnauthorizedException('User not found'); // ✅ fix null

    const payload = {
      sub: user_id,
      role,
      tenant_id: user.tenant_id ?? 0,
    };

    return {
      access_token: await this.getAccessToken(payload),
    };
  }

  async logout(session_id: number) {
    await this.sessionService.removeSession(session_id);
    return { message: 'Logged out successfully' };
  }

  async logoutAll(user_id: number) {
    await this.sessionService.removeAllSessions(user_id);
    return { message: 'Logged out from all devices' };
  }

  // ─── Token Helpers ────────────────────────────────────────
  async getAccessToken(payload: {
    sub: number;
    role: Role;
    tenant_id: number;
  }) {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as StringValue,
    });
  }

  async generateRefreshToken(payload: {
    sub: number;
    role: Role;
    tenant_id: number;
  }) {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as StringValue,
    });
  }
}
