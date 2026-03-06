import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export interface ICurrentUser {
  sub: number;
  role: Role;
  tenant_id: number;
  refreshToken?: string; // 👈 add this
}

export const CurrentUser = createParamDecorator(
  (data: keyof ICurrentUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: ICurrentUser = request.user;
    return data ? user?.[data] : user;
  },
);
