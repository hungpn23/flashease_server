import { Role } from '@/constants';
import { UUID } from './branded.type';

type BaseJwtPayload = {
  sessionId: UUID;
  iat?: number;
  exp?: number;
};

export type JwtPayload = BaseJwtPayload & { userId: UUID; role: Role };

export type RefreshPayload = JwtPayload & { signature: string };
