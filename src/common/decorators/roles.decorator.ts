import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';

// ✅ Always inject SUPER_ADMIN into every @Roles() call
export const Roles = (...roles: Role[]) =>
  SetMetadata(ROLES_KEY, [...roles, Role.SUPER_ADMIN]);
