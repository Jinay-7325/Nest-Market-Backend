import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const jwt_secret = process.env.JWT_SECRET;
    if (!jwt_secret) {
      console.log('.env does not have jwt_secret.');
      throw new InternalServerErrorException();
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwt_secret,
    });
  }

  async validate(payload: any) {
    return {
      sub: payload.sub, // 👈 add this for CurrentUserId decorator
      user_id: payload.sub,
      tenant_id: payload.tenant_id,
      role: payload.role,
    };
  }
}
