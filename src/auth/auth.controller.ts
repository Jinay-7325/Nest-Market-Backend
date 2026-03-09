import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import type { Request } from 'express'; // ✅ use 'import type' for isolatedModules
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { loginUserAuth } from './dto/login-user.dto';
import { CreateUserAuth } from './dto/create-user-auth.dto';
import { Role } from 'src/common/enums/role.enum';
import { tenantFromHeader } from 'src/common/decorators/tenant-from-header.decorator';
import { RefreshTokenGuard } from 'src/common/guards/refresh-token.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UsersService } from 'src/users/users.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Auth')
@ApiSecurity('x-tenant-id')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
    private readonly usersService: UsersService,
  ) {}

  // ─── Register ─────────────────────────────────────────────
  @ApiOperation({ summary: 'Register new user' })
  @Post('register')
  register(
    @Body() createUserAuthDto: CreateUserAuth,
    @tenantFromHeader() tenant_id: string,
  ) {
    return this.authService.create(createUserAuthDto, +tenant_id);
  }

  // ─── Login ────────────────────────────────────────────────
  @ApiOperation({ summary: 'Login (max 3 attempts/min)' })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(ThrottlerGuard)
  @Post('login')
  login(
    @Body() loginUserAuthDto: loginUserAuth,
    @tenantFromHeader() tenant_id: string,
    @Req() req: Request,
  ) {
    const device_info = req.headers['user-agent'] ?? undefined; // ✅ null → undefined
    const ip_address = req.ip ?? undefined; // ✅ null → undefined
    return this.authService.login(
      loginUserAuthDto,
      +tenant_id,
      device_info,
      ip_address,
    );
  }

  // ─── Refresh Token ────────────────────────────────────────

  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBearerAuth('access-token')
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  refreshToken(
    @CurrentUser('sub') user_id: number,
    @CurrentUser('role') role: Role,
    @CurrentUser('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshToken(user_id, role, refreshToken);
  }

  // ─── Logout from current device ───────────────────────────
  @ApiOperation({ summary: 'Logout from current device' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Body('session_id') session_id: number) {
    return this.authService.logout(session_id);
  }

  // ─── Logout from ALL devices ──────────────────────────────
  @ApiOperation({ summary: 'Logout from all devices' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  logoutAll(@CurrentUser('sub') user_id: number) {
    return this.authService.logoutAll(user_id);
  }

  // ─── Get all active sessions ──────────────────────────────
  @ApiOperation({ summary: 'Get all active sessions' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  getSessions(@CurrentUser('sub') user_id: number) {
    return this.sessionService.findUserSessions(user_id);
  }

  // ─── Change Password ──────────────────────────────────────
  @ApiOperation({ summary: 'Change password' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  changePassword(
    @CurrentUser('sub') user_id: number,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(
      user_id,
      changePasswordDto.old_password,
      changePasswordDto.new_password,
    );
  }
}
