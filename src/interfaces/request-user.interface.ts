import { JwtPayload } from '@/types/auth.type';
import { Request } from 'express';

export interface RequestUser extends Request {
  user: JwtPayload;
}
