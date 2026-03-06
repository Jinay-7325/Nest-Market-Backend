import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface ICurrentUser {
  sub: number; // user_id
  role: string;
  tenant_id: number;
}

export const CurrentUser = createParamDecorator(
  (data: keyof ICurrentUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: ICurrentUser = request.user;

    // If a specific field is requested e.g. @CurrentUser('tenant_id')
    return data ? user?.[data] : user;
  },
);
