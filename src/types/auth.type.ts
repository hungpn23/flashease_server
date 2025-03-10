import { Role } from '@/constants';

type BaseJwtPayload = {
  sessionId: string;
  iat?: number;
  exp?: number;
};

export type JwtPayload = BaseJwtPayload & { userId: string; role: Role };

export type RefreshPayload = JwtPayload & { signature: string };
