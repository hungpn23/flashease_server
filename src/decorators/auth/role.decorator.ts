import { Role, ROLE_KEY } from '@/constants/index';
import { SetMetadata } from '@nestjs/common';

export const UseRole = (role: Role) => SetMetadata(ROLE_KEY, role);
