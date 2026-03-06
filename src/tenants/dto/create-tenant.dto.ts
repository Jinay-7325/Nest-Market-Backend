import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTenantDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  tenant_name: string;

  @IsEmail()
  email: string;
}
