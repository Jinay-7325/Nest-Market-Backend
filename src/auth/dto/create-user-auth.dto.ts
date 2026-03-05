import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserAuth {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  username: string;
}
