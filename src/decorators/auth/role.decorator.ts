import { Role, ROLE } from '@/constants/index';
import { SetMetadata } from '@nestjs/common';

export const UseRole = (role: Role) => SetMetadata(ROLE, role);
