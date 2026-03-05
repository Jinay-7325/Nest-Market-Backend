import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  accessExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
}));
