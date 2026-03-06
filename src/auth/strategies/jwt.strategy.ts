import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Role } from 'src/common/enums/role.enum';

interface JwtPayload {
  sub: number;
  role: Role;
  tenant_id: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const jwt_secret = process.env.JWT_SECRET;
    if (!jwt_secret) {
      throw new InternalServerErrorException('JWT_SECRET not set');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwt_secret,
    });
  }

  async validate(payload: JwtPayload) {
    // ✅ no more any
    return {
      sub: payload.sub,
      user_id: payload.sub,
      tenant_id: payload.tenant_id,
      role: payload.role,
    };
  }
}
