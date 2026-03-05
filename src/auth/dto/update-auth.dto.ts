import { PartialType } from '@nestjs/mapped-types';
import { CreateUserAuth } from './create-user-auth.dto';

export class UpdateAuthDto extends PartialType(CreateUserAuth) {}
