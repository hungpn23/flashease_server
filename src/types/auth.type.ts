import { Role } from '@/constants';

type BaseJwtPayload = {
  sessionId: number;
  iat?: number;
  exp?: number;
};

export type JwtPayloadType = BaseJwtPayload & { userId: number; role: Role };

export type JwtRefreshPayloadType = JwtPayloadType & { signature: string };
