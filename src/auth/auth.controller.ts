import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Header,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserAuth } from './dto/create-user-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Tenant } from 'src/common/decorators/tenant.decorator';
import { loginUserAuth } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createAuthDto: CreateUserAuth, @Tenant() tenantId: string) {
    return this.authService.create(createAuthDto, +tenantId);
  }

  @Post('login')
  login(@Body() loginUserAuthDto: loginUserAuth) {
    return this.authService.login(loginUserAuthDto);
  }

  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
