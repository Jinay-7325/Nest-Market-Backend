import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserAuth } from './dto/create-user-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Tenant } from 'src/common/decorators/tenant.decorator';
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
  create(createAuthDto: CreateUserAuth, tenantId: number) {
    return this.usersService.create({ tenant_id: tenantId, ...createAuthDto });
  }

  async login(loginUserAuthDto: loginUserAuth) {
    const existingUser = await this.usersService.findByEmail(
      loginUserAuthDto.email,
    );
    if (!existingUser) {
      throw new NotFoundException('Email is not registered.');
    }
    const isMatch = await bycrpt.compare(
      loginUserAuthDto.password,
      existingUser.hashed_password,
    );
    if (!isMatch) {
      throw new UnauthorizedException('Invalid Credentilas.');
    }
    const payload = {
      sub: existingUser.user_id,
      role: existingUser.user_role,
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
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: this.configService.get<string>(
        'jwt.accessExpiresIn',
      ) as StringValue,
    });

    return accessToken;
  }

  async getRefreshToken(payload: { sub: number; role: Role }) {
    const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN;
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>(
        'jwt.refreshExpiresIn',
      ) as StringValue,
    });

    return accessToken;
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
