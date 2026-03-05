import { IsEmail, IsNotEmpty } from 'class-validator';

export class loginUserAuth {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
