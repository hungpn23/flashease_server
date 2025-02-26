import { Role } from '@/constants';

type BaseJwtPayload = {
  sessionId: string;
  iat?: number;
  exp?: number;
};

export type JwtPayloadType = BaseJwtPayload & { userId: string; role: Role };

export type JwtRefreshPayloadType = JwtPayloadType & { signature: string };
