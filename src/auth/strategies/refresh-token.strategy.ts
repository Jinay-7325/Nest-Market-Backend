import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Role } from 'src/common/enums/role.enum';

interface JwtPayload {
  sub: number;
  role: Role;
  tenant_id: number;
}

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    const jwt_refresh_secret = process.env.JWT_REFRESH_SECRET;
    if (!jwt_refresh_secret) {
      throw new InternalServerErrorException('JWT_REFRESH_SECRET not set');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwt_refresh_secret,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload) {
    // ✅ no more any
    const refreshToken = req
      .get('Authorization')
      ?.replace('Bearer ', '')
      .trim();
    if (!refreshToken)
      throw new UnauthorizedException('Refresh token not found');
    return { ...payload, refreshToken };
  }
}
