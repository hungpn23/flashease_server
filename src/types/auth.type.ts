import { Role } from '@/constants';
import { Seconds, UUID } from './branded.type';

type BaseJwtPayload = {
  sessionId: UUID;
  iat?: number;
  exp?: Seconds;
};

export type JwtPayload = BaseJwtPayload & { userId: UUID; role: Role };

export type RefreshPayload = JwtPayload & { signature: string };
