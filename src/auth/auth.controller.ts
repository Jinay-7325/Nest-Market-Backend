import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Header,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserAuth } from './dto/create-user-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { loginUserAuth } from './dto/login-user.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { tenantFromHeader } from 'src/common/decorators/tenant-from-header.decorator';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(
    @Body() createAuthDto: CreateUserAuth,
    @tenantFromHeader() tenantId: string,
  ) {
    return this.authService.create(createAuthDto, +tenantId);
  }

  @Throttle({ default: { limit: 3, ttl: 6000 } })
  @UseGuards(ThrottlerGuard)
  @Post('login')
  login(
    @Body() loginUserAuthDto: loginUserAuth,
    @tenantFromHeader() tenant_id: string,
  ) {
    return this.authService.login(loginUserAuthDto, +tenant_id);
  }
}
